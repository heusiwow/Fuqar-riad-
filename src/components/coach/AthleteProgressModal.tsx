import React, { useMemo, useState } from 'react';
import {
  Archive,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Dumbbell,
  MessageSquare,
  Plus,
  QrCode,
  RotateCcw,
  Ruler,
  Send,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DIFFICULTY_LABELS, formatArabicCount, tLabel, WEEKDAYS } from '../../i18n/translations';
import {
  addSessionCoachFeedback,
  deleteCoachingLink,
  deletePerformanceGoal,
  generateSafeId,
  savePerformanceGoal,
  sendCoachMessage,
  updateCoachingLink,
} from '../../services/firestoreService';
import {
  CoachAssignment,
  CoachGroup,
  CoachingLink,
  DifficultyLevel,
  PerformanceGoal,
} from '../../types/ironlog';
import {
  formatDuration,
  formatWeight,
  toStorageKg,
} from '../../utils/calculations';
import { formatAppError } from '../../utils/errorMessages';
import {
  AthleteBundle,
  buildExerciseProgressionList,
  resolveAthleteTodayStatus,
} from './coachHelpers';

interface AthleteProgressModalProps {
  link: CoachingLink;
  loading: boolean;
  athleteData: AthleteBundle | null;
  latestAssignment?: CoachAssignment | null;
  coachGroups: CoachGroup[];
  onClose: () => void;
  onOpenCustomCourse: (link: CoachingLink) => void;
  onOpenQr: (link: CoachingLink) => void;
  onUpdateLinkLocal: (updated: CoachingLink) => void;
  onRemoveLinkLocal: (linkId: string) => void;
  onUpdateBundleLocal: (athleteUid: string, nextBundle: AthleteBundle) => void;
}

type InspectorTab = 'today' | 'sessions' | 'prs' | 'body';

export const AthleteProgressModal: React.FC<AthleteProgressModalProps> = ({
  link,
  loading,
  athleteData,
  latestAssignment,
  coachGroups,
  onClose,
  onOpenCustomCourse,
  onOpenQr,
  onUpdateLinkLocal,
  onRemoveLinkLocal,
  onUpdateBundleLocal,
}) => {
  const {
    firebaseUser,
    profile,
    language,
    unit,
    t,
    allExercises,
    openCoachChat,
    showToast,
  } = useApp();

  const unitText = unit === 'lb' ? t.common.lb : t.common.kg;
  const [activeTab, setActiveTab] = useState<InspectorTab>('today');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [selectedExId, setSelectedExId] = useState<string | null>(null);

  // Meta editor state
  const [editAthName, setEditAthName] = useState(link.athleteName || '');
  const [editAthGroupId, setEditAthGroupId] = useState(link.groupId || '');
  const [editAthLevel, setEditAthLevel] = useState<DifficultyLevel>(
    link.experienceLevel || 'intermediate'
  );
  const [editAthWeeklyTarget, setEditAthWeeklyTarget] = useState(link.weeklyTarget || 4);
  const [editAthGoalSummary, setEditAthGoalSummary] = useState(link.goalSummary || '');
  const [coachNotesDraft, setCoachNotesDraft] = useState(link.privateNotes || '');
  const [savingMeta, setSavingMeta] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Check-in & feedback
  const [checkinText, setCheckinText] = useState('');
  const [sendingCheckin, setSendingCheckin] = useState(false);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  // Goal creation
  const [athGoalTitle, setAthGoalTitle] = useState('');
  const [athGoalExId, setAthGoalExId] = useState('barbell-bench-press');
  const [athGoalWeight, setAthGoalWeight] = useState('100');

  const todayInfo = useMemo(
    () => resolveAthleteTodayStatus(athleteData, latestAssignment),
    [athleteData, latestAssignment]
  );

  const progressionList = useMemo(
    () => buildExerciseProgressionList(athleteData?.sessions ?? []),
    [athleteData?.sessions]
  );

  const activeProgression = useMemo(() => {
    if (progressionList.length === 0) return null;
    if (selectedExId) {
      const match = progressionList.find((p) => p.exerciseId === selectedExId);
      if (match) return match;
    }
    return progressionList[0];
  }, [progressionList, selectedExId]);

  const adherenceSummary = useMemo(() => {
    const weeklyPlan =
      todayInfo.activeProgram?.weeklyFrequency || link.weeklyTarget || 4;
    const planned28 = weeklyPlan * 4;
    const cutoff28 = Date.now() - 28 * 24 * 60 * 60 * 1000;
    const completed28 = athleteData
      ? athleteData.sessions.filter((s) => new Date(s.completedAt).getTime() >= cutoff28).length
      : link.completedSessionsCount || 0;
    const missed28 = Math.max(0, planned28 - completed28);
    const adherencePct = Math.min(
      100,
      Math.round((completed28 / Math.max(1, planned28)) * 100)
    );
    return { planned28, completed28, missed28, adherencePct };
  }, [todayInfo.activeProgram, link, athleteData]);

  const handleCopyAthleteReport = () => {
    const prSummary =
      athleteData && athleteData.prs.length > 0
        ? athleteData.prs
            .slice(0, 5)
            .map(
              (pr) =>
                `- ${language === 'ar' ? pr.exerciseNameAr : pr.exerciseNameEn}: ${formatWeight(pr.bestWeightKg, unit)} ${unitText} × ${pr.bestWeightReps}`
            )
            .join('\n')
        : link.recentPrText || '—';

    const report =
      language === 'ar'
        ? `تقرير تقدّم المتدرّب — ${link.athleteName}\nالكورس: ${todayInfo.activeProgram?.name || link.assignedProgramName || '—'}\nالالتزام (28 يوماً): ${adherenceSummary.adherencePct}% (${formatArabicCount(adherenceSummary.completed28, 'حصة', 'حصتان', 'حصص', 'حصة')} من أصل ${adherenceSummary.planned28})\nأبرز الأرقام القياسية:\n${prSummary}`
        : `APEX Athlete Progress Summary — ${link.athleteName}\nCourse: ${todayInfo.activeProgram?.name || link.assignedProgramName || '—'}\n28-Day Adherence: ${adherenceSummary.adherencePct}% (${adherenceSummary.completed28}/${adherenceSummary.planned28} sessions)\nTop PRs:\n${prSummary}`;

    try {
      navigator.clipboard?.writeText(report);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    try {
      const updates: Partial<CoachingLink> = {
        athleteName: editAthName.trim() || link.athleteName,
        groupId: editAthGroupId,
        experienceLevel: editAthLevel,
        weeklyTarget: Math.max(1, Math.min(14, Number(editAthWeeklyTarget) || 4)),
        goalSummary: editAthGoalSummary.trim(),
        privateNotes: coachNotesDraft,
      };
      await updateCoachingLink(link.id, updates);
      onUpdateLinkLocal({ ...link, ...updates });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSavingMeta(false);
    }
  };

  const handleToggleAttention = async (checked: boolean) => {
    try {
      await updateCoachingLink(link.id, { needsAttention: checked });
      onUpdateLinkLocal({ ...link, needsAttention: checked });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSetStatus = async (nextStatus: 'active' | 'archived') => {
    try {
      await updateCoachingLink(link.id, { status: nextStatus });
      onUpdateLinkLocal({ ...link, status: nextStatus });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleDeleteLink = async () => {
    try {
      await deleteCoachingLink(link.id);
      onRemoveLinkLocal(link.id);
      onClose();
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSendCheckin = async () => {
    if (!firebaseUser || !link.athleteUid) return;
    const msg =
      checkinText.trim() ||
      (language === 'ar'
        ? `مرحباً ${link.athleteName}، كيف سير التمرين والاستشفاء هذا الأسبوع؟ شاركني ملاحظاتك.`
        : `Hey ${link.athleteName}, quick check-in: how are energy, soreness, and sessions going?`);
    setSendingCheckin(true);
    try {
      await sendCoachMessage({
        coachId: firebaseUser.uid,
        athleteUid: link.athleteUid,
        groupId: link.groupId || undefined,
        senderId: firebaseUser.uid,
        senderName: profile?.displayName || (language === 'ar' ? 'الكابتن' : 'Coach'),
        senderRole: 'coach',
        type: 'checkin',
        text: msg,
      });
      setCheckinText('');
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSendingCheckin(false);
    }
  };

  const handleSendSessionFeedback = async (sessionId: string) => {
    if (!firebaseUser || !link.athleteUid || !athleteData) return;
    const text = (feedbackDrafts[sessionId] || '').trim();
    if (!text) return;
    try {
      await addSessionCoachFeedback(
        link.athleteUid,
        sessionId,
        profile?.displayName || (language === 'ar' ? 'الكابتن' : 'Coach'),
        text
      );
      setFeedbackDrafts((prev) => ({ ...prev, [sessionId]: '' }));
      onUpdateBundleLocal(link.athleteUid, {
        ...athleteData,
        sessions: athleteData.sessions.map((s) =>
          s.id === sessionId ? { ...s, coachFeedback: text } : s
        ),
      });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !link.athleteUid || !athleteData || !athGoalTitle.trim()) return;
    try {
      const ex = allExercises.find((item) => item.id === athGoalExId);
      const goalId = generateSafeId('goal');
      const goalObj: Omit<PerformanceGoal, 'userId' | 'createdAt' | 'updatedAt'> = {
        id: goalId,
        title: athGoalTitle.trim(),
        targetType: 'weight',
        exerciseId: ex?.id || athGoalExId,
        exerciseNameEn: ex?.nameEn || '',
        exerciseNameAr: ex?.nameAr || '',
        targetWeightKg: toStorageKg(Number(athGoalWeight) || 100, unit),
        status: 'active',
        assignedByCoachId: firebaseUser.uid,
      };
      await savePerformanceGoal(link.athleteUid, goalObj, false, firebaseUser.uid);
      setAthGoalTitle('');
      onUpdateBundleLocal(link.athleteUid, {
        ...athleteData,
        goals: [{ ...goalObj, userId: link.athleteUid }, ...athleteData.goals],
      });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleToggleGoal = async (g: PerformanceGoal) => {
    if (!firebaseUser || !link.athleteUid || !athleteData) return;
    const nextStatus = g.status === 'achieved' ? 'active' : 'achieved';
    try {
      await savePerformanceGoal(
        link.athleteUid,
        { ...g, status: nextStatus },
        true,
        firebaseUser.uid
      );
      onUpdateBundleLocal(link.athleteUid, {
        ...athleteData,
        goals: athleteData.goals.map((item) =>
          item.id === g.id ? { ...item, status: nextStatus } : item
        ),
      });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!link.athleteUid || !athleteData) return;
    try {
      await deletePerformanceGoal(link.athleteUid, goalId);
      onUpdateBundleLocal(link.athleteUid, {
        ...athleteData,
        goals: athleteData.goals.filter((item) => item.id !== goalId),
      });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold truncate">{link.athleteName}</h3>
            <p className="text-xs font-mono text-neutral-500">
              {link.inviteCode} ·{' '}
              {link.status === 'active'
                ? t.apex.statusActive
                : link.status === 'archived'
                  ? t.apex.statusArchived
                  : t.apex.statusPending}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {link.athleteUid && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenCustomCourse(link)}
                  className="min-h-[38px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  {t.apex.coachCustomCourseBtn}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetUid = link.athleteUid;
                    onClose();
                    openCoachChat(targetUid);
                  }}
                  className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t.nav.messaging}
                </button>
                <button
                  type="button"
                  onClick={handleCopyAthleteReport}
                  className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {t.apex.copyReportBtn}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onOpenQr(link)}
              className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-500" />
              {t.apex.coachInviteQrLinkBtn}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              aria-label={t.common.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-Tab Bar */}
        {link.athleteUid && (
          <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-1.5 bg-neutral-50 dark:bg-[#090A0B]">
            {(
              [
                ['today', t.apex.coachTabTodayCourse],
                ['sessions', `${t.apex.coachTabSessionsLogs} (${athleteData?.sessions.length || 0})`],
                ['prs', t.apex.coachTabPrsProgression],
                ['body', t.apex.coachTabMeasurementsGoals],
              ] as [InspectorTab, string][]
            ).map(([tabKey, tabLabel]) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                className={`min-h-[36px] px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === tabKey
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {tabLabel}
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {!link.athleteUid ? (
            <div className="p-6 text-center space-y-4 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl">
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                {language === 'ar'
                  ? `أرسل الباركود أو رابط الدعوة (${link.inviteCode}) للاعب ليرتبط بحسابك، وبعدها ستتمكن من إرسال الكورس المخصص ومتابعة تمارينه اليومية وتطوره الكامل هنا.`
                  : `Share QR barcode or direct invite link (${link.inviteCode}) with the athlete to connect and track all their workouts and progress.`}
              </p>
              <button
                type="button"
                onClick={() => onOpenQr(link)}
                className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                {t.apex.coachInviteQrLinkBtn}
              </button>
            </div>
          ) : loading && !athleteData ? (
            <p className="text-xs text-neutral-500 text-center py-12">{t.common.loading}</p>
          ) : athleteData ? (
            <>
              {/* TAB 1: Today's Workout + Active Weekly Course */}
              {activeTab === 'today' && (
                <div className="space-y-4">
                  {/* Today Status Banner */}
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      todayInfo.completedToday
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#090A0B]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-sm font-bold">{t.apex.coachTodayScheduled}</h4>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          todayInfo.completedToday
                            ? 'bg-emerald-600 text-white'
                            : todayInfo.isRestDayToday
                              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {todayInfo.completedToday
                          ? t.apex.coachDoneTodayBadge
                          : todayInfo.isRestDayToday
                            ? t.apex.coachRestDayToday
                            : todayInfo.hasScheduledToday
                              ? t.apex.coachNotDoneTodayBadge
                              : t.apex.coachNoProgramAssigned}
                      </span>
                    </div>

                    {todayInfo.completedToday && (
                      <div className="space-y-2">
                        {todayInfo.todaySessions.map((ts) => (
                          <div
                            key={ts.id}
                            className="p-3 rounded-xl bg-white dark:bg-[#121417] border border-emerald-500/30 space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <strong className="text-sm">{ts.workoutName}</strong>
                              <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                                {ts.totalSets} {t.common.sets}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500">
                              {ts.exercises
                                .map((ex) => language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn)
                                .join(' · ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {todayInfo.hasScheduledToday && todayInfo.todayWorkout && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {todayInfo.todayWorkout.name} ({todayInfo.todayWorkout.exercises.length}{' '}
                          {t.workouts.exercisesInWorkout})
                        </p>
                        <div className="space-y-1.5">
                          {todayInfo.todayWorkout.exercises.map((ex, i) => (
                            <div
                              key={ex.itemId || `${ex.exerciseId}-${i}`}
                              className="px-3 py-2 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                  {i + 1}.
                                </span>
                                <span className="font-medium truncate">
                                  {language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn}
                                </span>
                              </div>
                              <span className="font-mono tabular-nums text-neutral-500 shrink-0">
                                {ex.sets} × {ex.targetRepsMin}-{ex.targetRepsMax}
                                {ex.targetWeightKg
                                  ? ` · ${formatWeight(ex.targetWeightKg, unit)} ${unitText}`
                                  : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Full Weekly Course Schedule */}
                  {todayInfo.activeProgram ? (
                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <h4 className="text-sm font-bold">{todayInfo.activeProgram.name}</h4>
                        </div>
                        <span className="text-xs font-mono tabular-nums text-neutral-500">
                          {todayInfo.activeProgram.weeklyFrequency}{' '}
                          {language === 'ar' ? 'أيام/أسبوع' : 'days/wk'} ·{' '}
                          {todayInfo.activeProgram.durationWeeks}{' '}
                          {language === 'ar' ? 'أسابيع' : 'wks'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {todayInfo.activeProgram.scheduledDays.map((day, idx) => {
                          const wd = WEEKDAYS[idx];
                          const matchedWorkout =
                            !day.isRestDay && day.workoutId
                              ? todayInfo.workoutsPool.find(
                                  (w) => w.id === day.workoutId || (day.workoutName && w.name === day.workoutName)
                                )
                              : null;
                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-neutral-500">
                                  {language === 'ar' ? wd.ar : wd.shortEn}
                                </span>
                                <span className="font-medium truncate">
                                  {day.isRestDay
                                    ? t.programs.restDay
                                    : day.workoutName || t.programs.restDay}
                                </span>
                              </div>
                              {matchedWorkout && matchedWorkout.exercises.length > 0 && (
                                <p className="text-[11px] text-neutral-500 truncate">
                                  {matchedWorkout.exercises
                                    .map((ex) =>
                                      language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn
                                    )
                                    .join(' · ')}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl space-y-3">
                      <p className="text-xs text-neutral-500">{t.apex.coachNoProgramAssigned}</p>
                      <button
                        type="button"
                        onClick={() => onOpenCustomCourse(link)}
                        className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        {t.apex.coachCustomCourseBtn}
                      </button>
                    </div>
                  )}

                  {/* Quick Weekly Check-in */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={checkinText}
                      onChange={(e) => setCheckinText(e.target.value)}
                      placeholder={
                        language === 'ar'
                          ? 'أرسل رسالة متابعة سريعة للاعب...'
                          : 'Send a quick weekly check-in prompt...'
                      }
                      className="flex-1 min-h-[40px] px-3 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                    />
                    <button
                      type="button"
                      disabled={sendingCheckin}
                      onClick={handleSendCheckin}
                      className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 rtl:-scale-x-100" />
                      {t.apex.sendCheckinBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Completed Sessions + Exercise Logs + Feedback */}
              {activeTab === 'sessions' && (
                <div className="space-y-4">
                  {/* 28-Day Adherence Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono tabular-nums">
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] font-sans text-neutral-500 block">
                        {t.apex.plannedLabel}
                      </span>
                      <strong className="text-base">{adherenceSummary.planned28}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] font-sans text-neutral-500 block">
                        {t.apex.completedLabel}
                      </span>
                      <strong className="text-base text-emerald-600 dark:text-emerald-400">
                        {adherenceSummary.completed28}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] font-sans text-neutral-500 block">
                        {t.apex.missedLabel}
                      </span>
                      <strong
                        className={`text-base ${
                          adherenceSummary.missed28 > 2 ? 'text-amber-500' : ''
                        }`}
                      >
                        {adherenceSummary.missed28}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] font-sans text-neutral-500 block">
                        {t.apex.adherenceLabel}
                      </span>
                      <strong className="text-base">{adherenceSummary.adherencePct}%</strong>
                    </div>
                  </div>

                  {athleteData.sessions.length === 0 ? (
                    <p className="text-xs text-neutral-500 py-8 text-center">
                      {t.history.noHistory}
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {athleteData.sessions.slice(0, 15).map((s) => {
                        const isExpanded = expandedSessionId === s.id;
                        return (
                          <div
                            key={s.id}
                            className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSessionId(isExpanded ? null : s.id)
                              }
                              className="w-full flex items-center justify-between gap-2 text-start cursor-pointer"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{s.workoutName}</p>
                                <p className="text-xs text-neutral-500 font-mono tabular-nums mt-0.5">
                                  {new Date(s.completedAt).toLocaleDateString(
                                    language === 'ar' ? 'ar-EG' : 'en-US',
                                    { month: 'short', day: 'numeric' }
                                  )}{' '}
                                  · {formatDuration(s.durationSeconds)} · {s.totalSets} {t.common.sets}
                                  {s.sessionRpe ? ` · RPE ${s.sessionRpe}` : ''}
                                </p>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                                {s.exercises.map((ex, i) => (
                                  <div
                                    key={ex.itemId || `${ex.exerciseId}-${i}`}
                                    className="p-2.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 space-y-1.5 text-xs"
                                  >
                                    <p className="font-semibold">
                                      {i + 1}.{' '}
                                      {language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn}
                                      {ex.skipped && (
                                        <span className="ms-2 text-[10px] text-neutral-400">
                                          ({t.history.skippedLabel})
                                        </span>
                                      )}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {ex.sets
                                        .filter((st) => st.completed)
                                        .map((st, stIdx) => (
                                          <span
                                            key={stIdx}
                                            className={`px-2 py-1 rounded-lg font-mono text-[11px] tabular-nums border ${
                                              st.isPR
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                                                : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#090A0B]'
                                            }`}
                                          >
                                            {formatWeight(st.weightKg, unit)} {unitText} × {st.reps}
                                            {st.rpe ? ` @${st.rpe}` : ''}
                                            {st.isPR ? ' PR' : ''}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {s.coachFeedback && (
                              <p className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 p-2.5 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 inline me-1" />
                                {s.coachFeedback}
                              </p>
                            )}

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={feedbackDrafts[s.id] || ''}
                                onChange={(e) =>
                                  setFeedbackDrafts((prev) => ({ ...prev, [s.id]: e.target.value }))
                                }
                                placeholder={t.apex.addCoachFeedback}
                                className="flex-1 min-h-[36px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => handleSendSessionFeedback(s.id)}
                                className="min-h-[36px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5 rtl:-scale-x-100" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Personal Records + Exercise-by-Exercise Strength Progression */}
              {activeTab === 'prs' && (
                <div className="space-y-5">
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-emerald-500" />
                      {t.dashboard.recentPRs} ({athleteData.prs.length})
                    </h4>
                    {athleteData.prs.length === 0 ? (
                      <p className="text-xs text-neutral-500">{t.dashboard.noPRsYet}</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {athleteData.prs.map((pr) => (
                          <div
                            key={pr.exerciseId}
                            className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                          >
                            <span className="truncate font-medium">
                              {language === 'ar' ? pr.exerciseNameAr : pr.exerciseNameEn}
                            </span>
                            <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                              {formatWeight(pr.bestWeightKg, unit)} {unitText} × {pr.bestWeightReps}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Strength Progression Series */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <h4 className="text-xs font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      {t.apex.coachExerciseProgression}
                    </h4>

                    {progressionList.length === 0 ? (
                      <p className="text-xs text-neutral-500">{t.analytics.noAnalyticsData}</p>
                    ) : (
                      <>
                        <select
                          value={activeProgression?.exerciseId || ''}
                          onChange={(e) => setSelectedExId(e.target.value)}
                          className="w-full min-h-[40px] px-3 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
                        >
                          {progressionList.map((item) => (
                            <option key={item.exerciseId} value={item.exerciseId}>
                              {language === 'ar' ? item.nameAr : item.nameEn} ({item.entries.length})
                            </option>
                          ))}
                        </select>

                        {activeProgression && (
                          <div className="space-y-2.5">
                            <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
                              <div className="p-2.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                                <span className="text-[10px] font-sans text-neutral-500 block">
                                  {language === 'ar' ? 'أول تسجيل' : 'Start Max'}
                                </span>
                                <strong>
                                  {formatWeight(activeProgression.earliestMaxKg, unit)} {unitText}
                                </strong>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                                <span className="text-[10px] font-sans text-neutral-500 block">
                                  {language === 'ar' ? 'آخر تسجيل' : 'Latest Max'}
                                </span>
                                <strong>
                                  {formatWeight(activeProgression.latestMaxKg, unit)} {unitText}
                                </strong>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                                <span className="text-[10px] font-sans text-neutral-500 block">
                                  {language === 'ar' ? 'التطوّر' : 'Net Delta'}
                                </span>
                                <strong
                                  className={
                                    activeProgression.deltaKg >= 0
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-amber-500'
                                  }
                                >
                                  {activeProgression.deltaKg >= 0 ? '+' : ''}
                                  {formatWeight(activeProgression.deltaKg, unit)} {unitText}
                                </strong>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              {activeProgression.entries.slice(-10).map((entry) => {
                                const barPct =
                                  activeProgression.peakMaxKg > 0
                                    ? Math.max(
                                        12,
                                        Math.round(
                                          (entry.maxWeightKg / activeProgression.peakMaxKg) * 100
                                        )
                                      )
                                    : 12;
                                return (
                                  <div
                                    key={entry.sessionId}
                                    className="p-2.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 space-y-1 text-xs"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-neutral-500 truncate">
                                        {new Date(entry.dateIso).toLocaleDateString(
                                          language === 'ar' ? 'ar-EG' : 'en-US',
                                          { month: 'short', day: 'numeric' }
                                        )}{' '}
                                        · {entry.workoutName}
                                      </span>
                                      <span className="font-mono tabular-nums font-semibold shrink-0">
                                        {formatWeight(entry.maxWeightKg, unit)} {unitText} ·{' '}
                                        {entry.bestReps} {t.common.reps}
                                      </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${barPct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Body Measurements + Goals + Athlete Meta */}
              {activeTab === 'body' && (
                <div className="space-y-5">
                  {/* Body Measurements */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <h4 className="text-xs font-bold flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-emerald-500" />
                      {t.apex.coachBodyMeasurements} ({athleteData.measurements.length})
                    </h4>

                    {athleteData.measurements.length === 0 ? (
                      <p className="text-xs text-neutral-500">{t.progress.noMeasurements}</p>
                    ) : (
                      <div className="space-y-2">
                        {athleteData.measurements.slice(0, 8).map((m) => (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                          >
                            <span className="font-mono text-neutral-500">{m.date}</span>
                            <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums">
                              {m.bodyWeightKg !== undefined && (
                                <span>
                                  {t.progress.bodyWeight}:{' '}
                                  <strong>
                                    {formatWeight(m.bodyWeightKg, unit)} {unitText}
                                  </strong>
                                </span>
                              )}
                              {m.chestCm !== undefined && (
                                <span>
                                  {t.progress.chestCircumference}: <strong>{m.chestCm} cm</strong>
                                </span>
                              )}
                              {m.armCm !== undefined && (
                                <span>
                                  {t.progress.armCircumference}: <strong>{m.armCm} cm</strong>
                                </span>
                              )}
                              {m.waistCm !== undefined && (
                                <span>
                                  {t.progress.waistCircumference}: <strong>{m.waistCm} cm</strong>
                                </span>
                              )}
                              {m.thighCm !== undefined && (
                                <span>
                                  {t.progress.thighCircumference}: <strong>{m.thighCm} cm</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Performance Goals */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <h4 className="text-xs font-bold flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-emerald-500" />
                      {t.apex.goalsTitle} ({athleteData.goals.length})
                    </h4>

                    {athleteData.goals.length > 0 && (
                      <div className="space-y-2">
                        {athleteData.goals.map((g) => (
                          <div
                            key={g.id}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{g.title}</p>
                              <p className="text-[11px] text-neutral-500 font-mono tabular-nums">
                                {language === 'ar' ? g.exerciseNameAr : g.exerciseNameEn}
                                {g.targetWeightKg
                                  ? ` · ${formatWeight(g.targetWeightKg, unit)} ${unitText}`
                                  : ''}
                                {' · '}
                                <span
                                  className={
                                    g.status === 'achieved'
                                      ? 'text-emerald-500 font-semibold'
                                      : 'text-neutral-500'
                                  }
                                >
                                  {g.status === 'achieved' ? t.apex.goalAchieved : t.apex.goalActive}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleGoal(g)}
                                className="min-h-[30px] px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-[11px] font-medium cursor-pointer"
                              >
                                {g.status === 'achieved' ? t.apex.goalActive : t.apex.goalAchieved}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGoal(g.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-500 cursor-pointer"
                                aria-label={t.common.delete}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        required
                        value={athGoalTitle}
                        onChange={(e) => setAthGoalTitle(e.target.value)}
                        placeholder={
                          language === 'ar' ? 'إضافة هدف جديد...' : 'New target title...'
                        }
                        className="sm:col-span-2 min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                      />
                      <select
                        value={athGoalExId}
                        onChange={(e) => setAthGoalExId(e.target.value)}
                        className="min-h-[38px] px-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                      >
                        {allExercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {language === 'ar' ? ex.nameAr : ex.nameEn}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          min={5}
                          value={athGoalWeight}
                          onChange={(e) => setAthGoalWeight(e.target.value)}
                          className="w-full min-h-[38px] px-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs tabular-nums"
                        />
                        <button
                          type="submit"
                          className="min-h-[38px] px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer shrink-0"
                          aria-label={t.common.add}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Editable Coaching Metadata & Lifecycle */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold">{t.apex.editAthleteInfo}</span>
                      <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(link.needsAttention)}
                          onChange={(e) => handleToggleAttention(e.target.checked)}
                          className="accent-amber-500"
                        />
                        {t.apex.needsAttention}
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <input
                        type="text"
                        value={editAthName}
                        onChange={(e) => setEditAthName(e.target.value)}
                        placeholder={t.profile.displayName}
                        className="sm:col-span-2 min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                      />
                      <select
                        value={editAthLevel}
                        onChange={(e) => setEditAthLevel(e.target.value as DifficultyLevel)}
                        className="min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
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
                        value={editAthWeeklyTarget}
                        onChange={(e) => setEditAthWeeklyTarget(Number(e.target.value) || 4)}
                        className="min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs tabular-nums"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <select
                        value={editAthGroupId}
                        onChange={(e) => setEditAthGroupId(e.target.value)}
                        className="min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                      >
                        <option value="">{language === 'ar' ? 'بدون مجموعة' : 'No squad'}</option>
                        {coachGroups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editAthGoalSummary}
                        onChange={(e) => setEditAthGoalSummary(e.target.value)}
                        placeholder={
                          language === 'ar' ? 'ملخص الهدف التدريبي' : 'Goal summary'
                        }
                        className="min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={coachNotesDraft}
                      onChange={(e) => setCoachNotesDraft(e.target.value)}
                      placeholder={t.apex.privateCoachNotes}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {link.status === 'archived' ? (
                          <button
                            type="button"
                            onClick={() => handleSetStatus('active')}
                            className="min-h-[34px] px-3 rounded-lg border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {t.apex.restoreLinkBtn}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetStatus('archived')}
                            className="min-h-[34px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            {t.apex.archiveLinkBtn}
                          </button>
                        )}

                        {confirmDelete ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleDeleteLink}
                              className="min-h-[34px] px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
                            >
                              {t.common.delete}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(false)}
                              className="min-h-[34px] px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs cursor-pointer"
                            >
                              {t.common.cancel}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="min-h-[34px] px-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t.apex.deleteLinkBtn}
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={savingMeta}
                        onClick={handleSaveMeta}
                        className="min-h-[36px] px-4 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold cursor-pointer"
                      >
                        {savingMeta ? t.common.loading : t.common.save}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
