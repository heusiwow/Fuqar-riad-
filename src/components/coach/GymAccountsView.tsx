import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Edit3,
  FileDown,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  deleteGymSubscription,
  ensureOrGetCoachCode,
  generateSafeId,
  saveGymSubscription,
  sendSubscriptionExpiryAlert,
  updateCoachCodeConfig,
} from '../../services/firestoreService';
import {
  CoachSubscriptionTier,
  GymSubscriptionRecord,
  SubscriptionPaymentStatus,
} from '../../types/ironlog';
import { formatAppError } from '../../utils/errorMessages';
import { exportGymAccountsPdf } from '../../utils/pdfExport';

type SubFilter = 'all' | 'active' | 'attention' | 'unpaid';

const FIXED_CURRENCY = 'د.ع';

function addDaysIso(startIso: string, days: number): string {
  const base = startIso ? new Date(`${startIso}T12:00:00Z`) : new Date();
  if (Number.isNaN(base.getTime())) return new Date().toISOString().slice(0, 10);
  base.setUTCDate(base.getUTCDate() + Math.max(1, days));
  return base.toISOString().slice(0, 10);
}

function diffDaysFromToday(endIso: string, todayIso: string): number {
  const endMs = new Date(`${endIso}T00:00:00Z`).getTime();
  const todayMs = new Date(`${todayIso}T00:00:00Z`).getTime();
  return Math.round((endMs - todayMs) / (24 * 60 * 60 * 1000));
}

export const GymAccountsView: React.FC = () => {
  const {
    firebaseUser,
    profile,
    language,
    t,
    coachRoster,
    coachProfileCode,
    gymSubscriptions,
    showToast,
  } = useApp();

  const isAr = language === 'ar';
  const currencyLabel = isAr ? 'د.ع' : 'IQD';
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const soonCutoffStr = useMemo(
    () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    []
  );

  const savedTiers = coachProfileCode?.subscriptionTiers || [];
  const activeRosterAthletes = useMemo(
    () => coachRoster.filter((l) => l.status === 'active'),
    [coachRoster]
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubFilter>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [exportingPdf, setExportingPdf] = useState(false);

  // One-Time Fixed Categories & Prices Setup Modal
  const [tiersModalOpen, setTiersModalOpen] = useState(false);
  const [gymNameDraft, setGymNameDraft] = useState('');
  const [tiersDraft, setTiersDraft] = useState<CoachSubscriptionTier[]>([]);
  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState('');
  const [newTierDays, setNewTierDays] = useState('30');
  const [savingTiers, setSavingTiers] = useState(false);

  // Simplified Add / Renew / Edit Subscription Modal
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [selectedRosterLinkId, setSelectedRosterLinkId] = useState<string>('manual');
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [athleteUid, setAthleteUid] = useState('');
  const [selectedTierId, setSelectedTierId] = useState('');
  const [customTierName, setCustomTierName] = useState('');
  const [tierPrice, setTierPrice] = useState('');
  const [allowCustomOverride, setAllowCustomOverride] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<SubscriptionPaymentStatus>('paid');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(addDaysIso(todayStr, 30));
  const [notes, setNotes] = useState('');
  const [savingSub, setSavingSub] = useState(false);
  const [sendingAlertId, setSendingAlertId] = useState<string | null>(null);

  const enrichedSubs = useMemo(() => {
    return gymSubscriptions.map((sub) => {
      const daysLeft = diffDaysFromToday(sub.endDate, todayStr);
      const effectiveState: 'active' | 'expiring' | 'expired' | 'cancelled' =
        sub.status === 'cancelled'
          ? 'cancelled'
          : sub.endDate < todayStr || sub.status === 'expired'
            ? 'expired'
            : sub.endDate <= soonCutoffStr
              ? 'expiring'
              : 'active';
      const remainingAmount = Math.max(0, (Number(sub.tierPrice) || 0) - (Number(sub.amountPaid) || 0));
      return { sub, daysLeft, effectiveState, remainingAmount };
    });
  }, [gymSubscriptions, todayStr, soonCutoffStr]);

  const alertItems = useMemo(
    () =>
      enrichedSubs
        .filter((x) => x.effectiveState === 'expired' || x.effectiveState === 'expiring')
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [enrichedSubs]
  );

  const filteredSubs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedSubs.filter(({ sub, effectiveState, remainingAmount }) => {
      if (statusFilter === 'active' && effectiveState !== 'active' && effectiveState !== 'expiring') {
        return false;
      }
      if (
        statusFilter === 'attention' &&
        effectiveState !== 'expiring' &&
        effectiveState !== 'expired'
      ) {
        return false;
      }
      if (statusFilter === 'unpaid' && remainingAmount <= 0 && sub.paymentStatus === 'paid') {
        return false;
      }
      if (tierFilter !== 'all' && sub.tierId !== tierFilter) return false;
      if (q) {
        const hay = `${sub.memberName} ${sub.memberPhone || ''} ${sub.tierName} ${sub.notes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [enrichedSubs, statusFilter, tierFilter, searchQuery]);

  const summaryStats = useMemo(() => {
    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let totalRevenue = 0;
    let totalRemaining = 0;

    for (const item of filteredSubs) {
      if (item.effectiveState === 'active') activeCount += 1;
      else if (item.effectiveState === 'expiring') {
        activeCount += 1;
        expiringSoonCount += 1;
      } else if (item.effectiveState === 'expired') {
        expiredCount += 1;
      }
      totalRevenue += Number(item.sub.amountPaid) || 0;
      totalRemaining += item.remainingAmount;
    }

    return {
      totalMembers: filteredSubs.length,
      activeCount,
      expiringSoonCount,
      expiredCount,
      totalRevenue,
      totalRemaining,
      currency: currencyLabel,
    };
  }, [filteredSubs, currencyLabel]);

  const formatMoney = (n: number) =>
    `${(Math.round(n * 100) / 100).toLocaleString('en-US')} ${currencyLabel}`;

  const openTiersModal = async () => {
    let docItem = coachProfileCode;
    if (!docItem && firebaseUser) {
      try {
        docItem = await ensureOrGetCoachCode(
          firebaseUser.uid,
          profile?.displayName || (isAr ? 'الكابتن' : 'Coach'),
          language
        );
      } catch {
        // Ignore error
      }
    }
    setGymNameDraft(docItem?.gymName || (isAr ? 'القاعة الرياضية' : 'Gym Hall'));
    setTiersDraft(docItem?.subscriptionTiers ? [...docItem.subscriptionTiers] : []);
    setNewTierName('');
    setNewTierPrice('');
    setNewTierDays('30');
    setTiersModalOpen(true);
  };

  const handleAddTierDraft = () => {
    if (!newTierName.trim()) return;
    const price = Math.max(0, Number(newTierPrice) || 0);
    const durationDays = Math.max(1, Math.min(1825, Math.round(Number(newTierDays) || 30)));
    setTiersDraft((prev) => [
      ...prev,
      {
        id: generateSafeId('tier'),
        name: newTierName.trim(),
        price,
        durationDays,
        description: '',
      },
    ]);
    setNewTierName('');
    setNewTierPrice('');
    setNewTierDays('30');
  };

  const handleSaveTiersConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setSavingTiers(true);
    try {
      let finalTiers = [...tiersDraft];
      if (newTierName.trim()) {
        finalTiers = [
          ...finalTiers,
          {
            id: generateSafeId('tier'),
            name: newTierName.trim(),
            price: Math.max(0, Number(newTierPrice) || 0),
            durationDays: Math.max(1, Math.min(1825, Math.round(Number(newTierDays) || 30))),
            description: '',
          },
        ];
      }
      const codeDoc =
        coachProfileCode ||
        (await ensureOrGetCoachCode(
          firebaseUser.uid,
          profile?.displayName || (isAr ? 'الكابتن' : 'Coach'),
          language
        ));
      await updateCoachCodeConfig(codeDoc.coachCode, {
        gymName: gymNameDraft.trim() || (isAr ? 'القاعة الرياضية' : 'Gym Hall'),
        currency: FIXED_CURRENCY,
        subscriptionTiers: finalTiers,
      });
      setNewTierName('');
      setNewTierPrice('');
      setNewTierDays('30');
      setTiersModalOpen(false);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSavingTiers(false);
    }
  };

  const applyTierSelection = (tierId: string, baseStartDate: string) => {
    setSelectedTierId(tierId);
    const tier = savedTiers.find((item) => item.id === tierId);
    if (!tier) return;
    setAllowCustomOverride(false);
    setCustomTierName(tier.name);
    setTierPrice(String(tier.price));
    if (paymentStatus === 'paid') {
      setAmountPaid(String(tier.price));
    } else if (paymentStatus === 'unpaid') {
      setAmountPaid('0');
    }
    setEndDate(addDaysIso(baseStartDate, tier.durationDays));
  };

  const openNewSubModal = (prefillTierId?: string) => {
    setEditingSubId(null);
    setSelectedRosterLinkId('manual');
    setMemberName('');
    setMemberPhone('');
    setAthleteUid('');
    setNotes('');
    setStartDate(todayStr);

    const targetTier =
      (prefillTierId ? savedTiers.find((tItem) => tItem.id === prefillTierId) : undefined) ||
      savedTiers[0];

    if (targetTier) {
      setSelectedTierId(targetTier.id);
      setCustomTierName(targetTier.name);
      setTierPrice(String(targetTier.price));
      setAmountPaid(String(targetTier.price));
      setPaymentStatus('paid');
      setAllowCustomOverride(false);
      setEndDate(addDaysIso(todayStr, targetTier.durationDays));
    } else {
      setSelectedTierId('custom');
      setCustomTierName('');
      setTierPrice('');
      setAmountPaid('');
      setPaymentStatus('paid');
      setAllowCustomOverride(true);
      setEndDate(addDaysIso(todayStr, 30));
    }
    setSubModalOpen(true);
  };

  const openEditSubModal = (sub: GymSubscriptionRecord) => {
    setEditingSubId(sub.id);
    setSelectedRosterLinkId(sub.linkId || 'manual');
    setMemberName(sub.memberName);
    setMemberPhone(sub.memberPhone || '');
    setAthleteUid(sub.athleteUid || '');
    const hasSavedMatch = savedTiers.some((tItem) => tItem.id === sub.tierId);
    setSelectedTierId(hasSavedMatch ? sub.tierId : 'custom');
    setCustomTierName(sub.tierName);
    setTierPrice(String(sub.tierPrice));
    setAmountPaid(String(sub.amountPaid));
    setPaymentStatus(sub.paymentStatus);
    setAllowCustomOverride(!hasSavedMatch);
    setStartDate(sub.startDate);
    setEndDate(sub.endDate);
    setNotes(sub.notes || '');
    setSubModalOpen(true);
  };

  const handleQuickRenew = (sub: GymSubscriptionRecord) => {
    const matchedTier = savedTiers.find((item) => item.id === sub.tierId);
    const duration = matchedTier?.durationDays || 30;
    const price = matchedTier?.price ?? sub.tierPrice;
    const nextStart = sub.endDate >= todayStr ? sub.endDate : todayStr;
    setEditingSubId(null);
    setSelectedRosterLinkId(sub.linkId || 'manual');
    setMemberName(sub.memberName);
    setMemberPhone(sub.memberPhone || '');
    setAthleteUid(sub.athleteUid || '');
    setSelectedTierId(matchedTier ? matchedTier.id : 'custom');
    setCustomTierName(matchedTier?.name || sub.tierName);
    setTierPrice(String(price));
    setAmountPaid(String(price));
    setPaymentStatus('paid');
    setAllowCustomOverride(!matchedTier);
    setStartDate(nextStart);
    setEndDate(addDaysIso(nextStart, duration));
    setNotes(isAr ? 'تجديد اشتراك' : 'Membership renewal');
    setSubModalOpen(true);
  };

  const handleRosterSelect = (val: string) => {
    setSelectedRosterLinkId(val);
    if (val === 'manual') {
      setAthleteUid('');
      return;
    }
    const link = activeRosterAthletes.find((l) => l.id === val);
    if (link) {
      setMemberName(link.athleteName);
      setAthleteUid(link.athleteUid || '');
    }
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !memberName.trim()) return;
    setSavingSub(true);
    try {
      const priceNum = Math.max(0, Number(tierPrice) || 0);
      const paidNum =
        paymentStatus === 'unpaid'
          ? 0
          : paymentStatus === 'paid'
            ? priceNum
            : Math.min(priceNum, Math.max(0, Number(amountPaid) || 0));

      const finalStatus = endDate < todayStr ? 'expired' : 'active';
      const subId = editingSubId || generateSafeId('gsub');

      await saveGymSubscription(
        firebaseUser.uid,
        {
          id: subId,
          athleteUid: athleteUid.trim(),
          linkId: selectedRosterLinkId !== 'manual' ? selectedRosterLinkId : '',
          memberName: memberName.trim(),
          memberPhone: memberPhone.trim(),
          tierId: selectedTierId || 'custom',
          tierName: customTierName.trim() || (isAr ? 'اشتراك قاعة' : 'Gym Pass'),
          tierPrice: priceNum,
          amountPaid: paidNum,
          currency: FIXED_CURRENCY,
          paymentStatus,
          startDate,
          endDate,
          status: finalStatus,
          notes: notes.trim(),
        },
        Boolean(editingSubId)
      );
      setSubModalOpen(false);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSavingSub(false);
    }
  };

  const handleDeleteSub = async (subId: string) => {
    try {
      await deleteGymSubscription(subId);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSettleBalance = async (sub: GymSubscriptionRecord) => {
    if (!firebaseUser) return;
    try {
      await saveGymSubscription(
        firebaseUser.uid,
        {
          ...sub,
          currency: FIXED_CURRENCY,
          amountPaid: sub.tierPrice,
          paymentStatus: 'paid',
        },
        true
      );
      showToast(
        isAr ? `تم تسديد كامل المبلغ لـ ${sub.memberName}` : `Balance settled for ${sub.memberName}`,
        'success'
      );
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSendExpiryAlert = async (sub: GymSubscriptionRecord) => {
    if (!firebaseUser || !sub.athleteUid) return;
    setSendingAlertId(sub.id);
    try {
      await sendSubscriptionExpiryAlert(
        firebaseUser.uid,
        profile?.displayName || (isAr ? 'الكابتن' : 'Coach'),
        sub
      );
      showToast(
        isAr
          ? `تم إرسال إشعار الاشتراك إلى ${sub.memberName}`
          : `Expiry alert sent to ${sub.memberName}`,
        'success'
      );
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSendingAlertId(null);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const filterLabel =
        statusFilter === 'all'
          ? isAr
            ? 'جميع السجلات'
            : 'All Records'
          : statusFilter === 'active'
            ? isAr
              ? 'الاشتراكات السارية'
              : 'Active Subscriptions'
            : statusFilter === 'attention'
              ? isAr
                ? 'منتهية / قريبة الانتهاء'
                : 'Expired / Expiring Soon'
              : isAr
                ? 'غير مسددة / متبقي دفع'
                : 'Unpaid / Partial';

      await exportGymAccountsPdf({
        language,
        coachName: profile?.displayName || (isAr ? 'الكابتن' : 'Coach'),
        gymName: coachProfileCode?.gymName || (isAr ? 'القاعة الرياضية' : 'APEX Gym Hall'),
        coachCode: coachProfileCode?.coachCode,
        filterLabel,
        summary: summaryStats,
        records: filteredSubs.map((x) => x.sub),
      });
      showToast(
        isAr ? 'تم حفظ ملف PDF للسجلات الحسابية بنجاح' : 'Accounting ledger PDF downloaded',
        'success'
      );
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setExportingPdf(false);
    }
  };

  const selectedTierObj = savedTiers.find((item) => item.id === selectedTierId);

  return (
    <div className="space-y-5">
      {/* Header & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              {isAr ? 'سجل اشتراكات القاعة الرياضية' : 'Gym Subscriptions Ledger'}
            </h2>
            {coachProfileCode?.gymName && (
              <span className="px-2.5 py-0.5 rounded-lg bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-medium">
                {coachProfileCode.gymName}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              {isAr ? 'الدينار العراقي (د.ع)' : 'Iraqi Dinar (IQD)'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isAr
              ? 'ثبّت فئاتك وأسعارك مرة واحدة، وعند تسجيل أي لاعب اختر الفئة مباشرة بضغطة واحدة.'
              : 'Set your fixed categories once, then register any athlete in one tap.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void openTiersModal()}
            className="min-h-[42px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-emerald-500" />
            {isAr ? 'الفئات والأسعار الثابتة' : 'Fixed Categories'}
          </button>

          <button
            type="button"
            onClick={() => void handleExportPdf()}
            disabled={exportingPdf}
            className="min-h-[42px] px-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            {exportingPdf ? t.common.loading : isAr ? 'حفظ PDF' : 'Save PDF'}
          </button>

          <button
            type="button"
            onClick={() => openNewSubModal()}
            className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'تسجيل اشتراك' : 'Add Member'}
          </button>
        </div>
      </div>

      {/* Fixed Categories Quick Bar (One-Time Setup -> Instant 1-Tap Member Signup) */}
      {savedTiers.length > 0 ? (
        <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              {isAr
                ? 'فئاتك الثابتة (اضغط على أي فئة لتسجيل لاعب بها فوراً):'
                : 'Your Fixed Categories (tap any category to register a member immediately):'}
            </p>
            <button
              type="button"
              onClick={() => void openTiersModal()}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
            >
              {isAr ? 'تعديل الفئات' : 'Edit'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => openNewSubModal(tier.id)}
                className="px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/60 hover:bg-emerald-500/5 text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="font-bold">{tier.name}</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(tier.price)}
                </span>
                <span className="text-neutral-500">
                  ({tier.durationDays} {isAr ? 'يوم' : 'd'})
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="bg-emerald-500/8 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              {isAr ? 'ثبّت فئات وأسعار قاعتك مرة واحدة' : 'Set Your Fixed Gym Categories Once'}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {isAr
                ? 'أضف فئات الاشتراك الثابتة بالدينار العراقي (مثل: شهري، VIP، تدريب خاص) مرة واحدة لتظهر تلقائياً عند تسجيل أي لاعب.'
                : 'Add your fixed IQD subscription categories once so registering every player takes one tap.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void openTiersModal()}
            className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Settings2 className="w-4 h-4" />
            {isAr ? 'إعداد الفئات والأسعار' : 'Set Fixed Categories'}
          </button>
        </section>
      )}

      {/* Clean 3-Card Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              {isAr ? 'المشتركون في السجل' : 'Total Subscribers'}
            </p>
            <p className="text-2xl font-bold font-mono tabular-nums">{summaryStats.totalMembers}</p>
            <p className="text-[11px] text-neutral-500">
              {isAr
                ? `ساري: ${summaryStats.activeCount} · منتهي/قريب: ${summaryStats.expiredCount + summaryStats.expiringSoonCount}`
                : `Active: ${summaryStats.activeCount} · Expired/Soon: ${summaryStats.expiredCount + summaryStats.expiringSoonCount}`}
            </p>
          </div>
          {activeRosterAthletes.length > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#090A0B] text-[11px] text-neutral-600 dark:text-neutral-300 font-medium">
              {isAr ? `تطبيق: ${activeRosterAthletes.length}` : `App: ${activeRosterAthletes.length}`}
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-1">
          <p className="text-xs text-neutral-500 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
            {isAr ? 'الإيرادات المستلمة' : 'Collected Revenue'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatMoney(summaryStats.totalRevenue)}
          </p>
          <p className="text-[11px] text-neutral-500">
            {isAr ? 'بالدينار العراقي حسب السجل المعروض' : 'In Iraqi Dinar'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStatusFilter((prev) => (prev === 'unpaid' ? 'all' : 'unpaid'))}
          className={`text-start bg-white dark:bg-[#121417] border rounded-2xl p-4 space-y-1 cursor-pointer transition-colors ${
            statusFilter === 'unpaid'
              ? 'border-rose-500/60 bg-rose-500/5'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-rose-500/40'
          }`}
        >
          <p className="text-xs text-neutral-500 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            {isAr ? 'المبالغ المتبقية (اضغط للفرز)' : 'Pending Dues (tap to filter)'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-rose-500">
            {formatMoney(summaryStats.totalRemaining)}
          </p>
          <p className="text-[11px] text-neutral-500">
            {isAr ? 'دفعات جزئية أو آجلة' : 'Partial / unpaid balances'}
          </p>
        </button>
      </section>

      {/* Expiry Alerts Strip */}
      {alertItems.length > 0 && (
        <section className="bg-amber-500/8 border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
          <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            {isAr
              ? `اشتراكات منتهية أو قريبة الانتهاء (${alertItems.length})`
              : `Expiring / Expired Subscriptions (${alertItems.length})`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {alertItems.slice(0, 4).map(({ sub, daysLeft, effectiveState }) => (
              <div
                key={`alert-${sub.id}`}
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#121417] border border-amber-500/25 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{sub.memberName}</p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {sub.tierName} ·{' '}
                    <span
                      className={
                        effectiveState === 'expired' ? 'text-rose-500 font-semibold' : 'text-amber-600 font-semibold'
                      }
                    >
                      {daysLeft < 0
                        ? isAr
                          ? `منتهي منذ ${Math.abs(daysLeft)} يوم`
                          : `Expired ${Math.abs(daysLeft)}d ago`
                        : daysLeft === 0
                          ? isAr
                            ? 'ينتهي اليوم'
                            : 'Expires today'
                          : isAr
                            ? `ينتهي خلال ${daysLeft} يوم`
                            : `Expires in ${daysLeft}d`}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {sub.athleteUid && (
                    <button
                      type="button"
                      disabled={sendingAlertId === sub.id}
                      onClick={() => void handleSendExpiryAlert(sub)}
                      className="min-h-[32px] px-2.5 rounded-lg border border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Bell className="w-3 h-3" />
                      {sendingAlertId === sub.id ? '...' : isAr ? 'تنبيه' : 'Notify'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleQuickRenew(sub)}
                    className="min-h-[32px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {isAr ? 'تجديد' : 'Renew'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Simplified Search & Filter Bar */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-neutral-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث باسم المشترك أو الهاتف...' : 'Search member or phone...'}
              className="w-full min-h-[40px] ps-10 pe-3 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
            />
          </div>

          {savedTiers.length > 0 && (
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="min-h-[40px] px-3 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
            >
              <option value="all">{isAr ? 'كل الفئات' : 'All Categories'}</option>
              {savedTiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
          {(
            [
              ['all', isAr ? 'الكل' : 'All'],
              ['active', isAr ? 'ساري' : 'Active'],
              ['attention', isAr ? 'قريب / منتهي' : 'Soon / Expired'],
              ['unpaid', isAr ? 'متبقي دفع' : 'Unpaid'],
            ] as [SubFilter, string][]
          ).map(([key, lbl]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`min-h-[34px] px-3 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${
                statusFilter === key
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </section>

      {/* Simplified Ledger Rows */}
      {filteredSubs.length === 0 ? (
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 text-center space-y-3">
          <Wallet className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
          <p className="text-sm font-semibold">
            {isAr ? 'لا توجد اشتراكات مسجلة في السجل بعد' : 'No gym subscriptions recorded yet'}
          </p>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {savedTiers.length === 0
              ? isAr
                ? 'ابدأ أولاً بتحديد فئات وأسعار قاعتك بالدينار العراقي، ثم سجّل المشتركين بضغطة واحدة.'
                : 'Start by defining your fixed IQD gym categories, then register members in one tap.'
              : isAr
                ? 'اضغط على أي فئة أعلاه أو على «تسجيل اشتراك» لإضافة مشترك جديد.'
                : 'Tap any category above or click "Add Member" to record a subscription.'}
          </p>
          <button
            type="button"
            onClick={() => (savedTiers.length === 0 ? void openTiersModal() : openNewSubModal())}
            className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
          >
            {savedTiers.length === 0 ? <Settings2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {savedTiers.length === 0
              ? isAr
                ? 'إعداد الفئات والأسعار'
                : 'Set Fixed Categories'
              : isAr
                ? 'تسجيل أول اشتراك'
                : 'Add First Subscription'}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredSubs.map(({ sub, daysLeft, effectiveState, remainingAmount }) => (
            <div
              key={sub.id}
              className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold">{sub.memberName}</h4>
                  {sub.memberPhone && (
                    <span className="text-xs font-mono text-neutral-500">{sub.memberPhone}</span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold">
                    {sub.tierName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      effectiveState === 'active'
                        ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                        : effectiveState === 'expiring'
                          ? 'bg-amber-500/12 text-amber-600 dark:text-amber-300'
                          : 'bg-rose-500/12 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {effectiveState === 'active'
                      ? isAr
                        ? `ساري (${daysLeft} يوم)`
                        : `Active (${daysLeft}d)`
                      : effectiveState === 'expiring'
                        ? daysLeft === 0
                          ? isAr
                            ? 'ينتهي اليوم'
                            : 'Expires today'
                          : isAr
                            ? `ينتهي خلال ${daysLeft} يوم`
                            : `Expiring in ${daysLeft}d`
                        : isAr
                          ? 'منتهي'
                          : 'Expired'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span className="font-mono">
                    {sub.startDate} → {sub.endDate}
                  </span>
                  {remainingAmount <= 0 ? (
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(sub.tierPrice)} · {isAr ? 'مدفوع بالكامل' : 'Paid'}
                    </span>
                  ) : (
                    <span className="font-mono font-semibold text-rose-500">
                      {isAr
                        ? `المدفوع ${formatMoney(sub.amountPaid)} · المتبقي ${formatMoney(remainingAmount)}`
                        : `Paid ${formatMoney(sub.amountPaid)} · Due ${formatMoney(remainingAmount)}`}
                    </span>
                  )}
                  {sub.notes && <span className="truncate max-w-xs">· {sub.notes}</span>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {remainingAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleSettleBalance(sub)}
                    className="min-h-[36px] px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isAr ? 'تسديد المتبقي' : 'Mark Paid'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleQuickRenew(sub)}
                  className="min-h-[36px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isAr ? 'تجديد' : 'Renew'}
                </button>
                {sub.athleteUid && (
                  <button
                    type="button"
                    disabled={sendingAlertId === sub.id}
                    onClick={() => void handleSendExpiryAlert(sub)}
                    className="min-h-[36px] px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                    title={isAr ? 'إرسال إشعار اشتراك القاعة للاعب' : 'Send gym expiry alert'}
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEditSubModal(sub)}
                  className="min-h-[36px] px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  aria-label={t.common.edit}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteSub(sub.id)}
                  className="min-h-[36px] px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                  aria-label={t.common.delete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* One-Time Fixed Categories & Prices Setup Modal (Locked to Iraqi Dinar) */}
      {tiersModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setTiersModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {isAr ? 'إعداد فئات وأسعار القاعة الثابتة' : 'Fixed Gym Categories & Pricing'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {isAr
                    ? 'حدد الفئات وأسعارها بالدينار العراقي مرة واحدة وستبقى ثابتة عند تسجيل أي لاعب.'
                    : 'Set your categories and IQD prices once; they stay fixed for every athlete signup.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTiersModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTiersConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-500">
                    {isAr ? 'اسم القاعة الرياضية' : 'Gym / Hall Name'}
                  </label>
                  <input
                    type="text"
                    value={gymNameDraft}
                    onChange={(e) => setGymNameDraft(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                  />
                </div>
                <div className="min-h-[42px] px-3 rounded-xl bg-emerald-500/8 border border-emerald-500/25 flex items-center justify-between text-xs">
                  <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                    {isAr ? 'العملة المعتمدة:' : 'Currency:'}
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {isAr ? 'الدينار العراقي (د.ع)' : 'Iraqi Dinar (IQD)'}
                  </span>
                </div>
              </div>

              {/* Saved Tiers List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">
                    {isAr ? 'الفئات الثابتة المحفوظة:' : 'Saved Fixed Categories:'}
                  </p>
                  {tiersDraft.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTiersDraft([])}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      {isAr ? 'حذف الكل' : 'Clear All'}
                    </button>
                  )}
                </div>
                {tiersDraft.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-2">
                    {isAr ? 'لا توجد فئات بعد — أضف فئات قاعتك وسعرها بالدينار العراقي بالأسفل.' : 'No categories yet — add your IQD categories below.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tiersDraft.map((tier, idx) => (
                      <div
                        key={tier.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800"
                      >
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTiersDraft((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                            );
                          }}
                          className="sm:col-span-5 min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs font-semibold"
                        />
                        <div className="sm:col-span-3 flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={tier.price}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setTiersDraft((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                              );
                            }}
                            className="w-full min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                          />
                          <span className="text-[11px] text-neutral-500 shrink-0">{currencyLabel}</span>
                        </div>
                        <div className="sm:col-span-3 flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            value={tier.durationDays}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value) || 30);
                              setTiersDraft((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, durationDays: val } : item))
                              );
                            }}
                            className="w-full min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                          />
                          <span className="text-[11px] text-neutral-500 shrink-0">
                            {isAr ? 'يوم' : 'd'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setTiersDraft((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="sm:col-span-1 min-h-[38px] rounded-lg hover:bg-rose-500/10 text-rose-500 flex items-center justify-center cursor-pointer"
                          aria-label={t.common.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Fixed Category */}
              <div className="p-3.5 rounded-xl bg-emerald-500/6 border border-emerald-500/25 space-y-2.5">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {isAr ? '+ إضافة فئة ثابتة جديدة' : '+ Add New Fixed Category'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newTierName}
                    onChange={(e) => setNewTierName(e.target.value)}
                    placeholder={isAr ? 'اسم الفئة (مثال: اشتراك شهري)' : 'Category Name (e.g. Monthly)'}
                    className="min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={newTierPrice}
                    onChange={(e) => setNewTierPrice(e.target.value)}
                    placeholder={isAr ? 'السعر الثابت (د.ع)' : 'Fixed Price (IQD)'}
                    className="min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={newTierDays}
                      onChange={(e) => setNewTierDays(e.target.value)}
                      placeholder={isAr ? 'الأيام' : 'Days'}
                      className="w-full min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddTierDraft}
                      className="min-h-[38px] px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      {isAr ? 'إضافة' : 'Add'}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-neutral-500">
                    {isAr ? 'المدة:' : 'Duration:'}
                  </span>
                  {[15, 30, 60, 90, 180, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setNewTierDays(String(d))}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono cursor-pointer border ${
                        newTierDays === String(d)
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-white dark:bg-[#121417] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {d} {isAr ? 'يوم' : 'd'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingTiers}
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {savingTiers
                  ? t.common.loading
                  : isAr
                    ? 'حفظ وتثبيت الفئات'
                    : 'Save Fixed Categories'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Simplified Add / Renew / Edit Subscription Modal */}
      {subModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSubModalOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingSubId
                  ? isAr
                    ? 'تعديل الاشتراك'
                    : 'Edit Subscription'
                  : isAr
                    ? 'تسجيل اشتراك لاعب'
                    : 'Register Member Subscription'}
              </h3>
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} className="space-y-4">
              {/* 1. Athlete / Member Picker */}
              <div className="space-y-2.5">
                {activeRosterAthletes.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-500">
                      {isAr ? 'اختر لاعب مسجل بالتطبيق (اختياري)' : 'Pick Registered Athlete (optional)'}
                    </label>
                    <select
                      value={selectedRosterLinkId}
                      onChange={(e) => handleRosterSelect(e.target.value)}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                    >
                      <option value="manual">
                        {isAr ? '— كتابة اسم المشترك يدوياً —' : '— Enter member name manually —'}
                      </option>
                      {activeRosterAthletes.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.athleteName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-500">
                      {isAr ? 'اسم المشترك *' : 'Member Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      placeholder={isAr ? 'مثال: علي حسين' : 'Full name'}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-500">
                      {isAr ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}
                    </label>
                    <input
                      type="tel"
                      value={memberPhone}
                      onChange={(e) => setMemberPhone(e.target.value)}
                      placeholder="0770..."
                      className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 2. 1-Tap Pre-Saved Fixed Categories */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    {isAr ? 'اختر الفئة المسجلة مسبقاً:' : 'Select Pre-Saved Category:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSubModalOpen(false);
                      void openTiersModal();
                    }}
                    className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {savedTiers.length > 0
                      ? isAr
                        ? 'تعديل الفئات'
                        : 'Edit categories'
                      : isAr
                        ? '+ إعداد الفئات الثابتة'
                        : '+ Set fixed categories'}
                  </button>
                </div>

                {savedTiers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savedTiers.map((tier) => {
                      const active = selectedTierId === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => applyTierSelection(tier.id, startDate)}
                          className={`p-3 rounded-xl border text-start cursor-pointer transition-colors ${
                            active
                              ? 'bg-emerald-500/12 border-emerald-500 text-neutral-900 dark:text-white'
                              : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold truncate">{tier.name}</span>
                            <span className="text-[11px] text-neutral-500 shrink-0">
                              {tier.durationDays} {isAr ? 'يوم' : 'd'}
                            </span>
                          </div>
                          <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {formatMoney(tier.price)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300">
                    {isAr
                      ? 'لم تُحدد فئات ثابتة بعد — يمكنك حفظ فئاتك مرة واحدة من «الفئات والأسعار الثابتة» أو إدخال الفئة والسعر هنا.'
                      : 'No fixed categories saved yet — configure them once or enter details below.'}
                  </div>
                )}

                {/* Locked Price Summary & Optional Override Toggle */}
                {selectedTierObj && !allowCustomOverride && (
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs">
                    <span>
                      {isAr ? 'السعر الثابت:' : 'Fixed Price:'}{' '}
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                        {formatMoney(Number(tierPrice) || 0)}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAllowCustomOverride(true)}
                      className="text-[11px] text-neutral-500 hover:text-emerald-500 underline cursor-pointer"
                    >
                      {isAr ? 'تعديل استثنائي للسعر' : 'Custom price override'}
                    </button>
                  </div>
                )}

                {(allowCustomOverride || savedTiers.length === 0 || selectedTierId === 'custom') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-neutral-500">
                        {isAr ? 'اسم الفئة' : 'Category Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={customTierName}
                        onChange={(e) => setCustomTierName(e.target.value)}
                        placeholder={isAr ? 'مثال: اشتراك شهري' : 'Category'}
                        className="w-full min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-neutral-500">
                        {isAr ? `السعر (${currencyLabel})` : `Price (${currencyLabel})`}
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        required
                        value={tierPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTierPrice(val);
                          if (paymentStatus === 'paid') setAmountPaid(val);
                        }}
                        placeholder="0"
                        className="w-full min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Simple 3-Button Payment Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500">
                  {isAr ? 'حالة الدفع:' : 'Payment Status:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ['paid', isAr ? 'مدفوع بالكامل' : 'Paid Full'],
                      ['partial', isAr ? 'دفعة جزئية' : 'Partial'],
                      ['unpaid', isAr ? 'غير مدفوع' : 'Unpaid'],
                    ] as [SubscriptionPaymentStatus, string][]
                  ).map(([st, lbl]) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setPaymentStatus(st);
                        if (st === 'paid') setAmountPaid(tierPrice);
                        else if (st === 'unpaid') setAmountPaid('0');
                        else if (amountPaid === tierPrice || !amountPaid) setAmountPaid('');
                      }}
                      className={`min-h-[38px] px-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        paymentStatus === st
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                {paymentStatus === 'partial' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center pt-1">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      required
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder={isAr ? `المبلغ المدفوع الآن (${currencyLabel})` : `Paid now (${currencyLabel})`}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                    />
                    <p className="text-xs font-mono text-rose-500 font-semibold">
                      {isAr
                        ? `المتبقي: ${formatMoney(Math.max(0, (Number(tierPrice) || 0) - (Number(amountPaid) || 0)))}`
                        : `Remaining: ${formatMoney(Math.max(0, (Number(tierPrice) || 0) - (Number(amountPaid) || 0)))}`}
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Start & Auto-Calculated End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-500">
                    {isAr ? 'تاريخ البدء' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      const nextStart = e.target.value;
                      setStartDate(nextStart);
                      const matched = savedTiers.find((tItem) => tItem.id === selectedTierId);
                      if (matched) {
                        setEndDate(addDaysIso(nextStart, matched.durationDays));
                      }
                    }}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-500">
                    {isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                  />
                </div>
              </div>

              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isAr ? 'ملاحظة قصيرة (اختياري)...' : 'Short note (optional)...'}
                className="w-full min-h-[38px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />

              <button
                type="submit"
                disabled={savingSub}
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                {savingSub
                  ? t.common.loading
                  : editingSubId
                    ? t.common.save
                    : isAr
                      ? 'حفظ الاشتراك في السجل'
                      : 'Save Subscription'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
