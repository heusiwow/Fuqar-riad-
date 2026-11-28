import React, { useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Dumbbell,
  Edit3,
  FileDown,
  FolderPlus,
  Megaphone,
  MessageSquare,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Send,
  Share2,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DIFFICULTY_LABELS, tLabel } from '../../i18n/translations';
import {
  createCoachingLinkInvite,
  deleteCoachGroup,
  ensureOrGetCoachCode,
  fetchLinkedAthleteData,
  generateSafeId,
  saveCoachGroup,
  sendCoachMessage,
  updateCoachCodeConfig,
} from '../../services/firestoreService';
import { CoachAssignment, CoachingLink, DifficultyLevel } from '../../types/ironlog';
import { formatAppError } from '../../utils/errorMessages';
import { exportCoachQrPosterPdf } from '../../utils/pdfExport';
import { AthleteProgressModal } from './AthleteProgressModal';
import { CustomCourseModal } from './CustomCourseModal';
import { GymAccountsView } from './GymAccountsView';
import { AthleteBundle, resolveAthleteTodayStatus } from './coachHelpers';

type RosterStatusFilter = 'all' | 'active' | 'pending' | 'attention' | 'archived';

export const CoachDashboardView: React.FC = () => {
  const {
    firebaseUser,
    isLocalDeviceMode,
    profile,
    isCoach,
    language,
    unit,
    t,
    coachGroups,
    coachRoster,
    coachAssignments,
    coachMessages,
    coachProfileCode,
    gymSubscriptions,
    setActiveSection,
    openCoachChat,
    showToast,
  } = useApp();

  const unitText = unit === 'lb' ? t.common.lb : t.common.kg;

  const [coachTab, setCoachTab] = useState<'roster' | 'accounts'>('roster');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<RosterStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [inviteOpen, setInviteOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [masterQrOpen, setMasterQrOpen] = useState(false);
  const [masterQrDataUrl, setMasterQrDataUrl] = useState('');
  const [masterGymNameDraft, setMasterGymNameDraft] = useState('');
  const [savingMasterGym, setSavingMasterGym] = useState(false);
  const [exportingQrPdf, setExportingQrPdf] = useState(false);
  const [qrLink, setQrLink] = useState<CoachingLink | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [customCourseTarget, setCustomCourseTarget] = useState<CoachingLink | null>(null);

  // Live athlete data bundles (for Today's Workouts + Completed Today + Full Progress)
  const [athleteBundles, setAthleteBundles] = useState<Record<string, AthleteBundle>>({});
  const [refreshingBundles, setRefreshingBundles] = useState(false);

  // Progress Inspector modal state
  const [inspectLink, setInspectLink] = useState<CoachingLink | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Group inline editing
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');

  // Add Athlete / Invite form
  const [newAthName, setNewAthName] = useState('');
  const [newAthGoal, setNewAthGoal] = useState('');
  const [newAthLevel, setNewAthLevel] = useState<DifficultyLevel>('intermediate');
  const [newAthWeeklyTarget, setNewAthWeeklyTarget] = useState(4);
  const [newAthGroupId, setNewAthGroupId] = useState('');
  const [newAthNotes, setNewAthNotes] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);

  // New Group form
  const [grpName, setGrpName] = useState('');
  const [grpDesc, setGrpDesc] = useState('');

  // Broadcast announcement
  const [annText, setAnnText] = useState('');
  const [annGroupId, setAnnGroupId] = useState('all');
  const [sendingAnn, setSendingAnn] = useState(false);

  const [nowMs] = useState(() => Date.now());
  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;

  const activeAthleteUidsKey = useMemo(
    () =>
      coachRoster
        .filter((l) => l.status === 'active' && Boolean(l.athleteUid))
        .map((l) => l.athleteUid)
        .sort()
        .join(','),
    [coachRoster]
  );

  const loadAllActiveBundles = useCallback(async () => {
    if (!firebaseUser || !isCoach) return;
    const targets = coachRoster.filter(
      (l) => l.status === 'active' && Boolean(l.athleteUid)
    );
    if (targets.length === 0) return;

    setRefreshingBundles(true);
    try {
      const results = await Promise.allSettled(
        targets.map(async (link) => {
          const bundle = await fetchLinkedAthleteData(link.athleteUid, firebaseUser.uid);
          return { uid: link.athleteUid, bundle };
        })
      );
      const nextMap: Record<string, AthleteBundle> = {};
      for (const r of results) {
        if (r.status === 'fulfilled') {
          nextMap[r.value.uid] = r.value.bundle;
        }
      }
      if (Object.keys(nextMap).length > 0) {
        setAthleteBundles((prev) => ({ ...prev, ...nextMap }));
      }
    } finally {
      setRefreshingBundles(false);
    }
  }, [firebaseUser, isCoach, coachRoster]);

  useEffect(() => {
    void loadAllActiveBundles();
  }, [activeAthleteUidsKey, firebaseUser?.uid, isCoach]);

  const latestAssignmentByAthlete = useMemo(() => {
    const map = new Map<string, CoachAssignment>();
    for (const a of coachAssignments) {
      if (!a.athleteUid || a.status === 'archived') continue;
      if (!map.has(a.athleteUid)) {
        map.set(a.athleteUid, a);
      }
    }
    return map;
  }, [coachAssignments]);

  const unreadByAthlete = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of coachMessages) {
      if (!m.read && m.senderId !== firebaseUser?.uid && m.athleteUid) {
        map.set(m.athleteUid, (map.get(m.athleteUid) || 0) + 1);
      }
    }
    return map;
  }, [coachMessages, firebaseUser?.uid]);

  const getJoinUrl = (code: string) => {
    if (typeof window === 'undefined') return `?join=${code}`;
    const origin = window.location.origin;
    if (!origin || origin === 'null' || origin.startsWith('file:')) {
      return `https://apex.fitness/?join=${code}`;
    }
    return `${origin}/?join=${code}`;
  };

  useEffect(() => {
    if (!qrLink) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(getJoinUrl(qrLink.inviteCode), {
      width: 240,
      margin: 2,
      color: { dark: '#090A0B', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [qrLink]);

  useEffect(() => {
    if (!masterQrOpen || !coachProfileCode) {
      return;
    }
    setMasterGymNameDraft(coachProfileCode.gymName || '');
    let cancelled = false;
    QRCode.toDataURL(getJoinUrl(coachProfileCode.coachCode), {
      width: 340,
      margin: 2,
      color: { dark: '#090A0B', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setMasterQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setMasterQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [masterQrOpen, coachProfileCode]);

  const subscriptionAlertCount = useMemo(() => {
    const soonCutoff = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return gymSubscriptions.filter(
      (s) => s.status !== 'cancelled' && (s.status === 'expired' || s.endDate <= soonCutoff)
    ).length;
  }, [gymSubscriptions]);

  const teamStats = useMemo(() => {
    const nonArchived = coachRoster.filter((l) => l.status !== 'archived');
    const active = nonArchived.filter((l) => l.status === 'active');

    let todayScheduledCount = 0;
    let completedTodayCount = 0;
    for (const l of active) {
      const bundle = l.athleteUid ? athleteBundles[l.athleteUid] : undefined;
      const latestAsgn = l.athleteUid ? latestAssignmentByAthlete.get(l.athleteUid) : undefined;
      const todayInfo = resolveAthleteTodayStatus(bundle, latestAsgn);
      if (todayInfo.hasScheduledToday) todayScheduledCount += 1;
      if (todayInfo.completedToday) completedTodayCount += 1;
    }

    const attentionList = active.filter((l) => {
      if (l.needsAttention) return true;
      if (!l.lastSessionAt) return false;
      return nowMs - new Date(l.lastSessionAt).getTime() > fiveDaysMs;
    });

    const adherenceVals = active
      .map((l) => l.recentAdherencePct)
      .filter((v): v is number => typeof v === 'number');
    const avgAdherence =
      adherenceVals.length > 0
        ? Math.round(adherenceVals.reduce((a, b) => a + b, 0) / adherenceVals.length)
        : null;

    return {
      total: nonArchived.length,
      activeCount: active.length,
      pendingCount: nonArchived.filter((l) => l.status === 'pending').length,
      archivedCount: coachRoster.filter((l) => l.status === 'archived').length,
      todayScheduledCount,
      completedTodayCount,
      attentionCount: attentionList.length,
      avgAdherence,
    };
  }, [coachRoster, athleteBundles, latestAssignmentByAthlete, nowMs, fiveDaysMs]);

  const filteredRoster = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return coachRoster.filter((l) => {
      if (statusFilter === 'archived') {
        if (l.status !== 'archived') return false;
      } else {
        if (l.status === 'archived') return false;
        if (statusFilter === 'active' && l.status !== 'active') return false;
        if (statusFilter === 'pending' && l.status !== 'pending') return false;
        if (statusFilter === 'attention') {
          const overdue =
            l.status === 'active' &&
            Boolean(l.lastSessionAt) &&
            nowMs - new Date(l.lastSessionAt!).getTime() > fiveDaysMs;
          if (!l.needsAttention && !overdue) return false;
        }
      }
      if (selectedGroupId !== 'all' && l.groupId !== selectedGroupId) return false;
      if (q) {
        const hay =
          `${l.athleteName} ${l.inviteCode} ${l.goalSummary || ''} ${l.assignedProgramName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [coachRoster, selectedGroupId, statusFilter, searchQuery, nowMs, fiveDaysMs]);

  if (!isCoach) {
    return (
      <div className="py-16 text-center space-y-3 bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <p className="text-sm text-neutral-500">
          {language === 'ar'
            ? 'لوحة المدرب متاحة لحسابات المدربين. يمكنك التبديل إلى حساب مدرب من الملف والإعدادات.'
            : 'Coach Hub is for Coach accounts. You can switch workspace role in Profile & Settings.'}
        </p>
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          className="min-h-[44px] px-5 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
        >
          {t.nav.profile}
        </button>
      </div>
    );
  }

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    const cleanAthName =
      newAthName.trim() || (language === 'ar' ? 'لاعب جديد' : 'Walk-In Athlete');
    setCreatingInvite(true);
    try {
      const created = await createCoachingLinkInvite(
        firebaseUser.uid,
        profile?.displayName || (language === 'ar' ? 'الكابتن' : 'Coach'),
        cleanAthName,
        {
          groupId: newAthGroupId || undefined,
          goalSummary: newAthGoal.trim(),
          experienceLevel: newAthLevel,
          weeklyTarget: newAthWeeklyTarget,
          privateNotes: newAthNotes.trim(),
        }
      );
      setNewAthName('');
      setNewAthGoal('');
      setNewAthNotes('');
      setInviteOpen(false);
      setQrLink(created);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !grpName.trim()) return;
    try {
      await saveCoachGroup(
        firebaseUser.uid,
        {
          id: generateSafeId('grp'),
          name: grpName.trim(),
          description: grpDesc.trim(),
        },
        false
      );
      setGrpName('');
      setGrpDesc('');
      setGroupOpen(false);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSaveGroupRename = async (groupId: string, description: string) => {
    if (!firebaseUser || !editingGroupName.trim()) return;
    try {
      await saveCoachGroup(
        firebaseUser.uid,
        { id: groupId, name: editingGroupName.trim(), description },
        true
      );
      setEditingGroupId(null);
      setEditingGroupName('');
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteCoachGroup(groupId);
      if (selectedGroupId === groupId) setSelectedGroupId('all');
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !annText.trim()) return;
    setSendingAnn(true);
    try {
      const targets = coachRoster.filter(
        (l) => l.status === 'active' && l.athleteUid && (annGroupId === 'all' || l.groupId === annGroupId)
      );
      for (const target of targets) {
        await sendCoachMessage({
          coachId: firebaseUser.uid,
          athleteUid: target.athleteUid,
          groupId: annGroupId !== 'all' ? annGroupId : undefined,
          senderId: firebaseUser.uid,
          senderName: profile?.displayName || (language === 'ar' ? 'الكابتن' : 'Coach'),
          senderRole: 'coach',
          type: 'announcement',
          text: annText.trim(),
        });
      }
      setAnnText('');
      setAnnounceOpen(false);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSendingAnn(false);
    }
  };

  const openInspector = async (link: CoachingLink) => {
    setInspectLink(link);
    if (!link.athleteUid || !firebaseUser) return;
    setInspectLoading(true);
    try {
      const res = await fetchLinkedAthleteData(link.athleteUid, firebaseUser.uid);
      setAthleteBundles((prev) => ({ ...prev, [link.athleteUid]: res }));
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setInspectLoading(false);
    }
  };

  const copyCode = (code: string) => {
    try {
      navigator.clipboard?.writeText(code);
      showToast(language === 'ar' ? 'تم نسخ رمز الدعوة' : 'Invite code copied');
    } catch {
      // ignore
    }
  };

  const handleCopyInviteLink = (link: CoachingLink) => {
    try {
      navigator.clipboard?.writeText(getJoinUrl(link.inviteCode));
      showToast(t.apex.shareInviteLink);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleShareInviteMessage = async (link: CoachingLink) => {
    const coachDisplay = profile?.displayName || (language === 'ar' ? 'الكابتن' : 'Coach');
    const url = getJoinUrl(link.inviteCode);
    const shareBody =
      language === 'ar'
        ? `انضم إلى تدريبي على تطبيق APEX مع ${coachDisplay}.\nرمز الربط: ${link.inviteCode}\nالرابط المباشر: ${url}`
        : `Join my training roster on APEX with ${coachDisplay}.\nInvite Code: ${link.inviteCode}\nDirect Link: ${url}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `APEX — ${link.inviteCode}`,
          text: shareBody,
          url,
        });
        return;
      }
      navigator.clipboard?.writeText(shareBody);
      showToast(t.common.savedSuccess);
    } catch {
      try {
        navigator.clipboard?.writeText(shareBody);
        showToast(t.common.savedSuccess);
      } catch {
        // user cancelled share
      }
    }
  };

  const handleOpenMasterQr = async () => {
    if (!firebaseUser) return;
    setMasterQrOpen(true);
    if (!coachProfileCode) {
      try {
        await ensureOrGetCoachCode(
          firebaseUser.uid,
          profile?.displayName || (language === 'ar' ? 'الكابتن' : 'Coach'),
          language
        );
      } catch (err) {
        showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
      }
    }
  };

  const handleSaveMasterGymName = async () => {
    if (!coachProfileCode) return;
    setSavingMasterGym(true);
    try {
      await updateCoachCodeConfig(coachProfileCode.coachCode, {
        gymName: masterGymNameDraft.trim() || (language === 'ar' ? 'القاعة الرياضية' : 'APEX Gym Hall'),
        coachName: profile?.displayName || coachProfileCode.coachName,
      });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSavingMasterGym(false);
    }
  };

  const handleExportMasterQrPdf = async () => {
    if (!coachProfileCode || !masterQrDataUrl) return;
    setExportingQrPdf(true);
    try {
      await exportCoachQrPosterPdf({
        coachDoc: coachProfileCode,
        qrDataUrl: masterQrDataUrl,
        joinUrl: getJoinUrl(coachProfileCode.coachCode),
        language,
      });
      showToast(
        language === 'ar' ? 'تم تحميل بوستر الباركود PDF للطباعة' : 'Printable QR poster PDF downloaded',
        'success'
      );
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setExportingQrPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.apex.coachDashboardTitle}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {language === 'ar'
              ? 'إدارة اللاعبين، الباركود الدائم للقاعة، الكورسات المخصصة، وسجل حسابات واشتراكات القاعة.'
              : 'Manage athletes, your permanent gym QR code, custom courses, and gym subscription accounts.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleOpenMasterQr()}
            className="min-h-[42px] px-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <QrCode className="w-4 h-4" />
            {language === 'ar' ? 'باركود الكابتن (للطباعة)' : 'Printable Coach QR'}
          </button>
          {coachTab === 'roster' && (
            <>
              <button
                type="button"
                onClick={() => void loadAllActiveBundles()}
                disabled={refreshingBundles}
                className="min-h-[42px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${refreshingBundles ? 'animate-spin' : ''}`} />
                {t.apex.coachRefreshStatus}
              </button>
              <button
                type="button"
                onClick={() => setAnnounceOpen(true)}
                className="min-h-[42px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                {t.apex.sendAnnouncement}
              </button>
              <button
                type="button"
                onClick={() => setGroupOpen(true)}
                className="min-h-[42px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <FolderPlus className="w-3.5 h-3.5 text-emerald-500" />
                {t.apex.createGroupBtn}
              </button>
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                {t.apex.addAthleteBtn}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Coach Section Mode Switcher: Roster & Training vs Gym Accounts & Subscriptions */}
      <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setCoachTab('roster')}
          className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
            coachTab === 'roster'
              ? 'bg-emerald-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'ar' ? 'المتدربون والكورسات' : 'Athletes & Training'}</span>
          <span className="font-mono text-[11px] opacity-85">({teamStats.total})</span>
        </button>
        <button
          type="button"
          onClick={() => setCoachTab('accounts')}
          className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
            coachTab === 'accounts'
              ? 'bg-emerald-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{language === 'ar' ? 'سجل الحسابات والاشتراكات' : 'Gym Accounts & Subscriptions'}</span>
          {subscriptionAlertCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                coachTab === 'accounts'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
              }`}
            >
              {subscriptionAlertCount}
            </span>
          )}
        </button>
      </div>

      {coachTab === 'accounts' ? (
        <GymAccountsView />
      ) : (
        <>
          {/* 4-Column Live KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-1">
          <p className="text-xs text-neutral-500">{t.apex.athleteRoster}</p>
          <p className="text-2xl font-bold font-mono tabular-nums">{teamStats.total}</p>
          <p className="text-[11px] text-neutral-500 font-mono tabular-nums">
            {teamStats.activeCount} {t.apex.statusActive} · {teamStats.pendingCount}{' '}
            {t.apex.statusPending}
          </p>
        </div>

        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-1">
          <p className="text-xs text-neutral-500">{t.apex.coachKpiTodayScheduled}</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {teamStats.todayScheduledCount}
          </p>
          <p className="text-[11px] text-neutral-500">{t.apex.coachTodayScheduled}</p>
        </div>

        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-1">
          <p className="text-xs text-neutral-500">{t.apex.coachKpiCompletedToday}</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-500">
            {teamStats.completedTodayCount}
          </p>
          <p className="text-[11px] text-neutral-500 font-mono tabular-nums">
            {teamStats.todayScheduledCount > 0
              ? `${Math.min(100, Math.round((teamStats.completedTodayCount / teamStats.todayScheduledCount) * 100))}%`
              : '—'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-1">
          <p className="text-xs text-neutral-500">{t.apex.needsAttention}</p>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-2xl font-bold font-mono tabular-nums text-amber-500">
              {teamStats.attentionCount}
            </p>
            {teamStats.avgAdherence !== null && (
              <span className="text-xs font-mono tabular-nums text-neutral-500">
                {teamStats.avgAdherence}% {t.apex.adherenceLabel}
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500">{t.apex.adherenceLabel}</p>
        </div>
      </section>

      {/* Search + Status Filter + Squad Filter Toolbar */}
      <section className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.apex.searchAthletesPlaceholder}
              className="w-full min-h-[42px] ps-10 pe-3.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
            {(
              [
                ['all', `${t.apex.statusAll} (${teamStats.total})`],
                ['active', `${t.apex.statusActive} (${teamStats.activeCount})`],
                ['pending', `${t.apex.statusPending} (${teamStats.pendingCount})`],
                ['attention', `${t.apex.needsAttention} (${teamStats.attentionCount})`],
                ['archived', `${t.apex.statusArchived} (${teamStats.archivedCount})`],
              ] as [RosterStatusFilter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  statusFilter === key
                    ? 'bg-emerald-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Group Filter Bar */}
        {coachGroups.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedGroupId('all')}
              className={`min-h-[36px] px-3.5 rounded-xl text-xs font-medium border cursor-pointer whitespace-nowrap ${
                selectedGroupId === 'all'
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-white dark:bg-[#121417] border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {t.common.all} ({teamStats.total})
            </button>
            {coachGroups.map((g) => (
              <div key={g.id} className="inline-flex items-center gap-1">
                {editingGroupId === g.id ? (
                  <div className="inline-flex items-center gap-1 bg-white dark:bg-[#121417] border border-emerald-500 rounded-xl px-2 py-1">
                    <input
                      type="text"
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      className="w-32 bg-transparent text-xs focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveGroupRename(g.id, g.description)}
                      className="p-1 text-emerald-500 cursor-pointer"
                      aria-label={t.common.save}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGroupId(null)}
                      className="p-1 text-neutral-400 cursor-pointer"
                      aria-label={t.common.cancel}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedGroupId(g.id)}
                      className={`min-h-[36px] px-3.5 rounded-xl text-xs font-medium border cursor-pointer whitespace-nowrap ${
                        selectedGroupId === g.id
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-white dark:bg-[#121417] border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      {g.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGroupId(g.id);
                        setEditingGroupName(g.name);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-emerald-500 cursor-pointer"
                      aria-label={t.common.edit}
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(g.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 cursor-pointer"
                      aria-label={t.common.delete}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Athlete Roster Grid */}
      {filteredRoster.length === 0 ? (
        <div className="py-14 text-center bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl px-4 space-y-4">
          <Users className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            {coachRoster.length === 0
              ? language === 'ar'
                ? 'لا يوجد لاعبون مسجلون بعد. اطبع باركود الكابتن ليقوم اللاعبون بمسحه من داخل التطبيق أو أنشئ رمز دعوة خاص.'
                : 'No athletes registered yet. Print your Coach QR poster for athletes to scan inside the app, or create an invite link.'
              : t.common.noResults}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => void handleOpenMasterQr()}
              className="min-h-[44px] px-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              {language === 'ar' ? 'باركود الكابتن (للطباعة)' : 'Printable Coach QR'}
            </button>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {t.apex.addAthleteBtn}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRoster.map((link) => {
            const overdue =
              link.status === 'active' &&
              Boolean(link.lastSessionAt) &&
              nowMs - new Date(link.lastSessionAt!).getTime() > fiveDaysMs;
            const grp = coachGroups.find((g) => g.id === link.groupId);
            const unreadCount = link.athleteUid ? unreadByAthlete.get(link.athleteUid) || 0 : 0;

            const bundle = link.athleteUid ? athleteBundles[link.athleteUid] : undefined;
            const latestAsgn = link.athleteUid
              ? latestAssignmentByAthlete.get(link.athleteUid)
              : undefined;
            const todayInfo = resolveAthleteTodayStatus(bundle, latestAsgn);
            const activeCourseTitle =
              todayInfo.activeProgram?.name || link.assignedProgramName || '';

            return (
              <div
                key={link.id}
                className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold truncate">{link.athleteName}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500 mt-0.5">
                        <span
                          className={`font-semibold ${
                            link.status === 'active'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : link.status === 'archived'
                                ? 'text-neutral-500'
                                : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {link.status === 'active'
                            ? t.apex.statusActive
                            : link.status === 'archived'
                              ? t.apex.statusArchived
                              : t.apex.statusPending}
                        </span>
                        {link.experienceLevel && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{tLabel(DIFFICULTY_LABELS[link.experienceLevel], language)}</span>
                          </>
                        )}
                        {grp && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{grp.name}</span>
                          </>
                        )}
                      </div>
                      {(link.needsAttention || overdue) && link.status === 'active' && (
                        <p className="text-xs font-semibold text-amber-500 inline-flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {overdue ? t.apex.missedSessions : t.apex.needsAttention}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyCode(link.inviteCode)}
                        className="min-h-[34px] px-2.5 rounded-lg bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
                        title={language === 'ar' ? 'نسخ الرمز' : 'Copy Code'}
                      >
                        <span>{link.inviteCode}</span>
                        <Copy className="w-3 h-3 text-neutral-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrLink(link)}
                        className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 cursor-pointer"
                        title={t.apex.coachInviteQrLinkBtn}
                        aria-label={t.apex.coachInviteQrLinkBtn}
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                      </button>
                    </div>
                  </div>

                  {/* Active Course + Today's Scheduled vs Completed Preview */}
                  {link.status === 'active' && link.athleteUid ? (
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate flex items-center gap-1.5">
                          <Dumbbell className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">
                            {activeCourseTitle || t.apex.coachNoProgramAssigned}
                          </span>
                        </span>
                        {todayInfo.completedToday ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.apex.coachDoneTodayBadge}
                          </span>
                        ) : todayInfo.isRestDayToday ? (
                          <span className="text-[11px] text-neutral-500 shrink-0">
                            {t.apex.coachRestDayToday}
                          </span>
                        ) : todayInfo.hasScheduledToday ? (
                          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 shrink-0">
                            {t.apex.coachNotDoneTodayBadge}
                          </span>
                        ) : null}
                      </div>

                      {todayInfo.completedToday && todayInfo.todaySessions[0] && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                            {todayInfo.todaySessions[0].workoutName} ·{' '}
                            {todayInfo.todaySessions[0].totalSets} {t.common.sets}
                          </p>
                          <p className="text-[11px] text-neutral-500 truncate">
                            {todayInfo.todaySessions[0].exercises
                              .map((ex) =>
                                language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn
                              )
                              .join(' · ')}
                          </p>
                        </div>
                      )}

                      {!todayInfo.completedToday && todayInfo.hasScheduledToday && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                            {t.apex.coachTodayScheduled}:{' '}
                            {todayInfo.todayWorkout?.name || todayInfo.todaySchedule?.workoutName}
                          </p>
                          {todayInfo.todayWorkout && todayInfo.todayWorkout.exercises.length > 0 && (
                            <p className="text-[11px] text-neutral-500 truncate">
                              {todayInfo.todayWorkout.exercises
                                .slice(0, 4)
                                .map((ex) =>
                                  language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn
                                )
                                .join(' · ')}
                              {todayInfo.todayWorkout.exercises.length > 4
                                ? ` (+${todayInfo.todayWorkout.exercises.length - 4})`
                                : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300">
                      {language === 'ar'
                        ? 'بانتظار قبول اللاعب للدعوة عبر الباركود أو رابط الربط المباشر.'
                        : 'Pending athlete connection via QR barcode or direct invite link.'}
                    </div>
                  )}

                  {/* Quick Numeric Strip */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs font-mono tabular-nums">
                    <div>
                      <span className="text-[10px] font-sans text-neutral-500 block">
                        {t.dashboard.totalSessions}
                      </span>
                      <strong>
                        {bundle ? bundle.sessions.length : link.completedSessionsCount || 0}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-neutral-500 block">
                        {language === 'ar' ? 'آخر تمرين' : 'Last Session'}
                      </span>
                      <strong>
                        {bundle?.sessions[0]?.completedAt || link.lastSessionAt
                          ? new Date(
                              bundle?.sessions[0]?.completedAt || link.lastSessionAt!
                            ).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-neutral-500 block">
                        {t.dashboard.recentPRs}
                      </span>
                      <strong className="truncate block font-sans text-[11px]">
                        {link.recentPrText || '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-neutral-200 dark:border-neutral-800">
                  {link.athleteUid ? (
                    <button
                      type="button"
                      onClick={() => setCustomCourseTarget(link)}
                      className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 rtl:-scale-x-100" />
                      {t.apex.coachCustomCourseBtn}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setQrLink(link)}
                      className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {t.apex.coachInviteQrLinkBtn}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openInspector(link)}
                    className="min-h-[40px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {t.apex.coachFullProgressBtn}
                  </button>

                  {link.athleteUid && (
                    <button
                      type="button"
                      onClick={() => openCoachChat(link.athleteUid)}
                      className="min-h-[40px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.nav.messaging}</span>
                      {unreadCount > 0 && (
                        <span className="font-mono font-bold text-emerald-500 tabular-nums">
                          ({unreadCount})
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Permanent Printable Master Coach QR Modal */}
      {masterQrOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setMasterQrOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between text-start gap-3">
              <div>
                <h3 className="text-base font-bold">
                  {language === 'ar' ? 'باركود الكابتن الدائم (للطباعة)' : 'Permanent Printable Coach QR'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {language === 'ar'
                    ? 'اطبعه مرة واحدة وعلّقه في القاعة — أي لاعب يمسحه من داخل التطبيق يتسجل عندك مباشرة.'
                    : 'Print once and post in your gym — any athlete scanning it inside APEX joins your roster directly.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMasterQrOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {coachProfileCode ? (
              <>
                <div className="flex items-center gap-2 text-start">
                  <input
                    type="text"
                    value={masterGymNameDraft}
                    onChange={(e) => setMasterGymNameDraft(e.target.value)}
                    placeholder={language === 'ar' ? 'اسم القاعة الرياضية' : 'Gym Name'}
                    className="flex-1 min-h-[38px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                  <button
                    type="button"
                    disabled={savingMasterGym}
                    onClick={() => void handleSaveMasterGymName()}
                    className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold cursor-pointer"
                  >
                    {savingMasterGym ? '...' : t.common.save}
                  </button>
                </div>

                {masterQrDataUrl && (
                  <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/40 inline-block mx-auto space-y-2">
                    <p className="text-xs font-bold text-neutral-900">
                      {coachProfileCode.gymName || (language === 'ar' ? 'القاعة الرياضية' : 'APEX Gym')}
                    </p>
                    <img
                      src={masterQrDataUrl}
                      alt={`Coach QR ${coachProfileCode.coachCode}`}
                      className="w-56 h-56 block mx-auto"
                    />
                    <p className="text-[11px] font-semibold text-emerald-700">
                      {profile?.displayName || coachProfileCode.coachName}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => copyCode(coachProfileCode.coachCode)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xl font-bold tracking-wider cursor-pointer"
                  >
                    <span>{coachProfileCode.coachCode}</span>
                    <Copy className="w-4 h-4 text-emerald-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={exportingQrPdf || !masterQrDataUrl}
                    onClick={() => void handleExportMasterQrPdf()}
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    {exportingQrPdf
                      ? t.common.loading
                      : language === 'ar'
                        ? 'حفظ بوستر PDF للطباعة'
                        : 'Save Printable Poster PDF'}
                  </button>

                  {masterQrDataUrl && (
                    <a
                      href={masterQrDataUrl}
                      download={`APEX-Coach-QR-${coachProfileCode.coachCode}.png`}
                      className="min-h-[44px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-emerald-500" />
                      {language === 'ar' ? 'تحميل صورة PNG' : 'Download PNG'}
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard?.writeText(getJoinUrl(coachProfileCode.coachCode));
                      showToast(t.apex.shareInviteLink);
                    } catch {
                      showToast(t.common.errorGeneric, 'error');
                    }
                  }}
                  className="w-full min-h-[40px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'نسخ رابط التسجيل المباشر' : 'Copy Direct Join Link'}
                </button>
              </>
            ) : (
              <div className="py-8 text-xs text-neutral-500">{t.common.loading}</div>
            )}
          </div>
        </div>
      )}

      {/* Add Athlete / Invite Code Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{t.apex.addAthleteBtn}</h3>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvite} className="space-y-3">
              <input
                type="text"
                value={newAthName}
                onChange={(e) => setNewAthName(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'اسم اللاعب (أو اتركه فارغاً لدعوة سريعة)'
                    : 'Athlete Name (optional for quick QR)'
                }
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newAthLevel}
                  onChange={(e) => setNewAthLevel(e.target.value as DifficultyLevel)}
                  className="min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((l) => (
                    <option key={l} value={l}>
                      {tLabel(DIFFICULTY_LABELS[l], language)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={newAthWeeklyTarget}
                  onChange={(e) => setNewAthWeeklyTarget(Number(e.target.value) || 4)}
                  className="min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs tabular-nums"
                  title={t.profile.weeklyFreq}
                />
              </div>
              {coachGroups.length > 0 && (
                <select
                  value={newAthGroupId}
                  onChange={(e) => setNewAthGroupId(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  <option value="">{language === 'ar' ? 'بدون مجموعة' : 'No squad'}</option>
                  {coachGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                value={newAthGoal}
                onChange={(e) => setNewAthGoal(e.target.value)}
                placeholder={language === 'ar' ? 'ملخص الهدف التدريبي' : 'Goal summary'}
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <textarea
                rows={2}
                value={newAthNotes}
                onChange={(e) => setNewAthNotes(e.target.value)}
                placeholder={t.apex.privateCoachNotes}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <button
                type="submit"
                disabled={creatingInvite}
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                {creatingInvite
                  ? t.common.loading
                  : language === 'ar'
                    ? 'إنشاء الباركود ورابط الدعوة'
                    : 'Generate QR Barcode & Link'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share & QR Invite Modal */}
      {qrLink && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQrLink(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-start">
              <div>
                <h3 className="text-base font-bold">{t.apex.shareQrTitle}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{qrLink.athleteName}</p>
              </div>
              <button
                type="button"
                onClick={() => setQrLink(null)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {qrDataUrl && (
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 inline-block mx-auto">
                <img
                  src={qrDataUrl}
                  alt={`QR ${qrLink.inviteCode}`}
                  className="w-48 h-48 block"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => copyCode(qrLink.inviteCode)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xl font-bold tracking-wider cursor-pointer"
              >
                <span>{qrLink.inviteCode}</span>
                <Copy className="w-4 h-4 text-emerald-500" />
              </button>
              <p className="text-xs text-neutral-500 leading-relaxed">{t.apex.qrScanHint}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleCopyInviteLink(qrLink)}
                className="min-h-[44px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {t.apex.shareInviteLink}
              </button>
              <button
                type="button"
                onClick={() => handleShareInviteMessage(qrLink)}
                className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                {t.apex.shareInviteText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {groupOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{t.apex.createGroupBtn}</h3>
              <button
                type="button"
                onClick={() => setGroupOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <input
                type="text"
                required
                value={grpName}
                onChange={(e) => setGrpName(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'اسم المجموعة (مثال: فريق القوة)'
                    : 'Squad Name (e.g., Hypertrophy Squad)'
                }
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              />
              <textarea
                rows={2}
                value={grpDesc}
                onChange={(e) => setGrpDesc(e.target.value)}
                placeholder={t.common.notes}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                {t.common.save}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {announceOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{t.apex.sendAnnouncement}</h3>
              <button
                type="button"
                onClick={() => setAnnounceOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <select
                value={annGroupId}
                onChange={(e) => setAnnGroupId(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              >
                <option value="all">
                  {language === 'ar' ? 'جميع اللاعبين النشطين' : 'All Active Athletes'}
                </option>
                {coachGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <textarea
                rows={4}
                required
                value={annText}
                onChange={(e) => setAnnText(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'اكتب التوجيه أو التعميم للاعبين...'
                    : 'Write your team announcement...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              />
              <button
                type="submit"
                disabled={sendingAnn}
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                {sendingAnn ? t.common.loading : t.apex.sendAnnouncement}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Athlete Full Progress Inspector Modal */}
      {inspectLink && (
        <AthleteProgressModal
          link={inspectLink}
          loading={inspectLoading}
          athleteData={inspectLink.athleteUid ? athleteBundles[inspectLink.athleteUid] ?? null : null}
          latestAssignment={
            inspectLink.athleteUid
              ? latestAssignmentByAthlete.get(inspectLink.athleteUid) ?? null
              : null
          }
          coachGroups={coachGroups}
          onClose={() => setInspectLink(null)}
          onOpenCustomCourse={(targetLink) => setCustomCourseTarget(targetLink)}
          onOpenQr={(targetLink) => setQrLink(targetLink)}
          onUpdateLinkLocal={(updated) => setInspectLink(updated)}
          onRemoveLinkLocal={() => setInspectLink(null)}
          onUpdateBundleLocal={(uid, nextBundle) =>
            setAthleteBundles((prev) => ({ ...prev, [uid]: nextBundle }))
          }
        />
      )}

      {/* Per-Athlete Custom Course Builder Modal */}
      {customCourseTarget && (
        <CustomCourseModal
          link={customCourseTarget}
          onClose={() => setCustomCourseTarget(null)}
          onAssigned={(assignedLink, assignedName) => {
            if (inspectLink?.id === assignedLink.id) {
              setInspectLink({ ...inspectLink, assignedProgramName: assignedName });
            }
            if (assignedLink.athleteUid && firebaseUser) {
              void fetchLinkedAthleteData(assignedLink.athleteUid, firebaseUser.uid)
                .then((res) =>
                  setAthleteBundles((prev) => ({ ...prev, [assignedLink.athleteUid]: res }))
                )
                .catch(() => {});
            }
          }}
        />
      )}
    </div>
  );
};
