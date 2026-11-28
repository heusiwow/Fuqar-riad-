import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Dumbbell,
  Link2,
  MessageSquare,
  Play,
  Plus,
  QrCode,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  UserCheck,
  X,
} from 'lucide-react';
import { QrScannerModal } from '../common/QrScannerModal';
import { useApp } from '../../context/AppContext';
import {
  GOAL_LABELS,
  MUSCLE_LABELS,
  SPLIT_LABELS,
  tLabel,
  WEEKDAYS,
} from '../../i18n/translations';
import {
  acceptCoachAssignment,
  claimCoachInviteCode,
  dismissCoachAssignment,
} from '../../services/firestoreService';
import { formatAppError } from '../../utils/errorMessages';
import {
  computeMuscleGroupStats,
  detectFatigueAndSpikes,
  evaluateGoalProgress,
  formatDuration,
  formatWeight,
  getLocalDateKey,
  getStartOfWeekIso,
} from '../../utils/calculations';

export const DashboardView: React.FC = () => {
  const {
    firebaseUser,
    isLocalDeviceMode,
    profile,
    isCoach,
    language,
    unit,
    t,
    allExercises,
    workouts,
    activeProgram,
    activeSession,
    sessions,
    personalRecords,
    goals,
    coachAssignments,
    athleteCoachLink,
    athleteGymSubscriptions,
    latestCoachCourseNotice,
    dismissCoachCourseNotice,
    pendingJoinCode,
    clearPendingJoinCode,
    setActiveSection,
    openHistorySession,
    openExerciseDetail,
    startWorkoutFromTemplate,
    startBlankWorkout,
    showToast,
    dataLoading,
  } = useApp();

  const [quickJoinCode, setQuickJoinCode] = React.useState(() => pendingJoinCode || '');
  const [joiningCoach, setJoiningCoach] = React.useState(false);
  const [scannerOpen, setScannerOpen] = React.useState(false);

  React.useEffect(() => {
    if (pendingJoinCode && !quickJoinCode) {
      setQuickJoinCode(pendingJoinCode);
    }
  }, [pendingJoinCode]);

  const jsDay = new Date().getDay();
  const mondayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const todaySchedule = activeProgram?.scheduledDays[mondayIdx];
  const todayWorkoutTemplate = todaySchedule?.workoutId
    ? workouts.find((w) => w.id === todaySchedule.workoutId)
    : undefined;

  const fatigueAlert = useMemo(() => detectFatigueAndSpikes(sessions), [sessions]);
  const pendingAssignments = useMemo(
    () => coachAssignments.filter((a) => a.status === 'assigned'),
    [coachAssignments]
  );
  const activeGoals = useMemo(() => goals.filter((g) => g.status === 'active'), [goals]);

  const handleAcceptAssignment = async (assignmentId: string) => {
    if (!firebaseUser) return;
    const target = pendingAssignments.find((a) => a.id === assignmentId);
    if (!target) return;
    try {
      await acceptCoachAssignment(firebaseUser.uid, target);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleDismissAssignment = async (assignmentId: string) => {
    try {
      await dismissCoachAssignment(assignmentId);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleQuickJoinCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !quickJoinCode.trim()) return;
    setJoiningCoach(true);
    try {
      await claimCoachInviteCode(
        firebaseUser.uid,
        profile?.displayName || (language === 'ar' ? 'رياضي' : 'Athlete'),
        quickJoinCode.trim()
      );
      setQuickJoinCode('');
      clearPendingJoinCode();
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setJoiningCoach(false);
    }
  };

  const stats = useMemo(() => {
    const weekStart = getStartOfWeekIso().getTime();
    const sessionsThisWeek = sessions.filter(
      (s) => new Date(s.completedAt).getTime() >= weekStart
    );
    const weeklyTarget = activeProgram?.weeklyFrequency || profile?.weeklyFrequency || 4;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const last30Sessions = sessions.filter(
      (s) => new Date(s.completedAt).getTime() >= thirtyDaysAgo
    );
    const uniqueTrainingDays30 = new Set(
      last30Sessions.map((s) => getLocalDateKey(new Date(s.completedAt)))
    ).size;
    const expected30Days = Math.max(1, Math.round((weeklyTarget / 7) * 30));
    const consistencyPct = Math.min(100, Math.round((uniqueTrainingDays30 / expected30Days) * 100));

    const muscleStats = computeMuscleGroupStats(last30Sessions, allExercises).filter(
      (m) => m.primarySets > 0
    );

    // Real recent strength improvements (latest max weight vs previous session max weight for same exercise)
    const improvements: {
      exerciseId: string;
      name: string;
      prevKg: number;
      currKg: number;
      deltaKg: number;
    }[] = [];

    const byExercise = new Map<string, { name: string; maxKg: number }[]>();
    const chronological = [...sessions].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    for (const s of chronological) {
      for (const ex of s.exercises) {
        if (ex.skipped) continue;
        const completed = ex.sets.filter((st) => st.completed && st.weightKg > 0);
        if (!completed.length) continue;
        const maxKg = Math.max(...completed.map((st) => st.weightKg));
        const list = byExercise.get(ex.exerciseId) || [];
        list.push({
          name: language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn,
          maxKg,
        });
        byExercise.set(ex.exerciseId, list);
      }
    }

    for (const [exId, entries] of byExercise.entries()) {
      if (entries.length >= 2) {
        const latest = entries[entries.length - 1];
        const prev = entries[entries.length - 2];
        if (latest.maxKg > prev.maxKg) {
          improvements.push({
            exerciseId: exId,
            name: latest.name,
            prevKg: prev.maxKg,
            currKg: latest.maxKg,
            deltaKg: Math.round((latest.maxKg - prev.maxKg) * 10) / 10,
          });
        }
      }
    }

    const prRecords = Object.values(personalRecords)
      .filter((pr) => pr.bestWeightKg > 0 || pr.bestReps > 0)
      .sort((a, b) => (b.bestWeightDate || '').localeCompare(a.bestWeightDate || ''));

    return {
      sessionsThisWeekCount: sessionsThisWeek.length,
      weeklyTarget,
      consistencyPct,
      uniqueTrainingDays30,
      totalSessions: sessions.length,
      muscleStats,
      improvements: improvements.slice(0, 4),
      prRecords: prRecords.slice(0, 5),
    };
  }, [sessions, activeProgram, profile, allExercises, personalRecords, language]);

  if (dataLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 rounded-2xl bg-neutral-200 dark:bg-[#121417]" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-2xl bg-neutral-200 dark:bg-[#121417]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Immediate Coach Course Notification Card */}
      {latestCoachCourseNotice && (
        <section className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-sm sm:text-base font-bold text-emerald-900 dark:text-emerald-200">
                {language === 'ar'
                  ? `الكابتن ${latestCoachCourseNotice.coachName} أعطاك هذا الكورس: «${latestCoachCourseNotice.programName}»`
                  : `Coach ${latestCoachCourseNotice.coachName} gave you this course: "${latestCoachCourseNotice.programName}"`}
              </p>
              {latestCoachCourseNotice.notes && (
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {latestCoachCourseNotice.notes}
                </p>
              )}
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {t.apex.courseAutoActivatedHint}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                dismissCoachCourseNotice();
                if (todayWorkoutTemplate) {
                  void startWorkoutFromTemplate(todayWorkoutTemplate, activeProgram);
                } else {
                  setActiveSection('live');
                }
              }}
              className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              {t.apex.startCourseTodayBtn}
            </button>
            <button
              type="button"
              onClick={() => {
                dismissCoachCourseNotice();
                setActiveSection('programs');
              }}
              className="min-h-[42px] px-3.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 text-xs font-medium cursor-pointer"
            >
              {t.apex.viewCourseBtn}
            </button>
            <button
              type="button"
              onClick={dismissCoachCourseNotice}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl hover:bg-emerald-500/15 text-neutral-600 dark:text-neutral-300 cursor-pointer"
              aria-label={t.common.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Top Focal Hero: Today's Planned Workout or Active Session */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {activeSession ? t.dashboard.resumeSession : t.dashboard.todaysWorkout}
            </p>
            {activeSession ? (
              <>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {activeSession.workoutName}
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                  {activeSession.exercises.length} {t.workouts.exercisesInWorkout}
                  {activeSession.programName ? ` · ${activeSession.programName}` : ''}
                </p>
              </>
            ) : activeProgram ? (
              todaySchedule && !todaySchedule.isRestDay && todaySchedule.workoutName ? (
                <>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {todaySchedule.workoutName}
                  </h1>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {activeProgram.name} · {tLabel(SPLIT_LABELS[activeProgram.splitType], language)}
                    {todayWorkoutTemplate
                      ? ` · ${todayWorkoutTemplate.exercises.length} ${t.workouts.exercisesInWorkout}`
                      : ''}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold tracking-tight">{t.dashboard.restDayTitle}</h1>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
                    {t.dashboard.restDayDesc}
                  </p>
                </>
              )
            ) : (
              <>
                <h1 className="text-xl font-bold tracking-tight">{t.dashboard.noProgramTitle}</h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
                  {t.dashboard.noProgramDesc}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {activeSession ? (
              <button
                onClick={() => setActiveSection('live')}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" />
                {t.dashboard.resumeSession}
              </button>
            ) : todayWorkoutTemplate ? (
              <button
                onClick={() => startWorkoutFromTemplate(todayWorkoutTemplate, activeProgram)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" />
                {t.dashboard.startTodayWorkout}
              </button>
            ) : (
              <>
                {!activeProgram && (
                  <button
                    onClick={() => setActiveSection('programs')}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {t.dashboard.createProgramBtn}
                  </button>
                )}
                <button
                  onClick={startBlankWorkout}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 text-emerald-500" />
                  {t.dashboard.quickStartEmpty}
                </button>
              </>
            )}
            <button
              onClick={() => setActiveSection('ai')}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {t.nav.ai}
            </button>
          </div>
        </div>
      </section>

      {/* Coach Connection Strip (Athletes or Deep-Link Invite Pending) */}
      {(!isCoach || Boolean(pendingJoinCode)) && (
        athleteCoachLink ? (
          <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t.apex.linkedCoachLabel}
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {athleteCoachLink.coachName}
                    {athleteCoachLink.assignedProgramName
                      ? ` · ${athleteCoachLink.assignedProgramName}`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSection('messaging')}
                  className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t.nav.messaging}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('programs')}
                  className="min-h-[40px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium cursor-pointer"
                >
                  {t.nav.programs}
                </button>
              </div>
            </div>

            {athleteGymSubscriptions.length > 0 && (() => {
              const latestSub = athleteGymSubscriptions[0];
              const todayStr = getLocalDateKey();
              const diffDays = Math.ceil(
                (new Date(latestSub.endDate + 'T00:00:00').getTime() -
                  new Date(todayStr + 'T00:00:00').getTime()) /
                  86400000
              );
              const isExpired = latestSub.status === 'expired' || diffDays < 0;
              const isExpiringSoon = !isExpired && diffDays <= 5;
              return (
                <div
                  className={`px-3.5 py-2.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
                    isExpired
                      ? 'bg-red-500/8 border-red-500/30 text-red-700 dark:text-red-300'
                      : isExpiringSoon
                        ? 'bg-amber-500/10 border-amber-500/35 text-amber-800 dark:text-amber-300'
                        : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span className="inline-flex items-center gap-2 font-medium">
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    {language === 'ar'
                      ? `اشتراك القاعة (${latestSub.tierName})`
                      : `Gym Subscription (${latestSub.tierName})`}
                  </span>
                  <span className="font-mono tabular-nums font-semibold">
                    {isExpired
                      ? language === 'ar'
                        ? `منتهي (${latestSub.endDate})`
                        : `Expired (${latestSub.endDate})`
                      : language === 'ar'
                        ? `ينتهي ${latestSub.endDate} (متبقي ${diffDays} يوم)`
                        : `Expires ${latestSub.endDate} (${diffDays}d left)`}
                  </span>
                </div>
              );
            })()}
          </section>
        ) : (
          <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-emerald-500 flex items-center justify-center shrink-0">
                <Link2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold">{t.apex.coachInviteTitle}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {language === 'ar'
                    ? 'امسح باركود الكابتن المعلّق في القاعة أو أدخل رمز الدعوة للتسجيل مباشرة'
                    : 'Scan the coach’s QR poster at the gym or enter an invite code to register'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <QrCode className="w-4 h-4" />
                {language === 'ar' ? 'امسح باركود الكابتن' : 'Scan Coach QR'}
              </button>
              <form onSubmit={handleQuickJoinCoach} className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickJoinCode}
                  onChange={(e) => setQuickJoinCode(e.target.value)}
                  placeholder="CAP-... / APEX-..."
                  className="w-36 sm:w-44 min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs uppercase"
                />
                <button
                  type="submit"
                  disabled={joiningCoach || !quickJoinCode.trim()}
                  className="min-h-[40px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  {joiningCoach ? t.common.loading : t.apex.joinCoachBtn}
                </button>
              </form>
            </div>
          </section>
        )
      )}

      {/* Contextual Fatigue / Volume Spike Warning */}
      {fatigueAlert && (
        <section className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {language === 'ar' ? fatigueAlert.titleAr : fatigueAlert.titleEn}
              </p>
              <p className="text-xs text-amber-700/90 dark:text-amber-200/80 leading-relaxed">
                {language === 'ar' ? fatigueAlert.messageAr : fatigueAlert.messageEn}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('ai')}
            className="min-h-[40px] px-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold shrink-0 cursor-pointer"
          >
            {t.apex.aiAnalysisTab}
          </button>
        </section>
      )}

      {/* Pending Coach Assigned Programs */}
      {pendingAssignments.length > 0 && (
        <section className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {t.apex.pendingAssignments} ({pendingAssignments.length})
            </p>
            {athleteCoachLink && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                {t.apex.linkedCoachLabel}: {athleteCoachLink.coachName}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {pendingAssignments.map((assign) => (
              <div
                key={assign.id}
                className="p-3 rounded-xl bg-white dark:bg-[#121417] border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{assign.programName}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {assign.coachName}
                    {assign.notes ? ` · ${assign.notes}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAcceptAssignment(assign.id)}
                    className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.apex.acceptAssignment}
                  </button>
                  <button
                    onClick={() => handleDismissAssignment(assign.id)}
                    className="min-h-[40px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t.apex.dismissAssignment}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3-Column KPI Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-1">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.dashboard.weeklyCompletion}</p>
          <p className="text-2xl font-bold font-mono tabular-nums">
            {stats.sessionsThisWeekCount}
            <span className="text-sm font-normal text-neutral-500"> / {stats.weeklyTarget}</span>
          </p>
          <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.round((stats.sessionsThisWeekCount / Math.max(1, stats.weeklyTarget)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-1">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.dashboard.totalSessions}</p>
          <p className="text-2xl font-bold font-mono tabular-nums">{stats.totalSessions}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.dashboard.sessionsUnit}</p>
        </div>

        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-1">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.dashboard.consistency}</p>
          <p className="text-2xl font-bold font-mono tabular-nums">{stats.consistencyPct}%</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
            {stats.uniqueTrainingDays30} {t.dashboard.sessionsUnit}
          </p>
        </div>
      </section>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Workout Activity */}
          <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t.dashboard.recentActivity}</h2>
              {sessions.length > 0 && (
                <button
                  onClick={() => setActiveSection('history')}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  {t.nav.history}
                  <ArrowUpRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
                </button>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="py-8 text-center space-y-3 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl px-4">
                <Dumbbell className="w-7 h-7 text-neutral-400 mx-auto" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                  {t.dashboard.noHistoryYet}
                </p>
                <button
                  onClick={() => setActiveSection('workouts')}
                  className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium"
                >
                  {t.workouts.newWorkout}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
                {sessions.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => openHistorySession(s.id)}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 cursor-pointer hover:opacity-85 transition-opacity"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.workoutName}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {new Date(s.completedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        · {formatDuration(s.durationSeconds)}
                      </p>
                    </div>
                    <div className="text-end font-mono tabular-nums text-sm font-semibold shrink-0">
                      {s.totalSets}{' '}
                      <span className="text-xs font-normal text-neutral-500">
                        {t.dashboard.setsUnit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Muscle Group Volume Distribution (Last 30 Days) */}
          <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t.dashboard.muscleDistribution}</h2>
              <button
                onClick={() => setActiveSection('analytics')}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                {t.nav.analytics}
                <ArrowUpRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
              </button>
            </div>

            {stats.muscleStats.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 py-6 text-center">
                {t.dashboard.noHistoryYet}
              </p>
            ) : (
              <div className="space-y-3">
                {stats.muscleStats.slice(0, 7).map((item) => {
                  const maxSets = stats.muscleStats[0]?.primarySets || 1;
                  const pct = Math.round((item.primarySets / maxSets) * 100);
                  return (
                    <div key={item.muscle} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{tLabel(MUSCLE_LABELS[item.muscle], language)}</span>
                        <span className="font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                          {item.primarySets} {t.dashboard.setsUnit}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Program & Upcoming 7-Day Schedule */}
          <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                {t.dashboard.upcomingSchedule}
              </h2>
              <button
                onClick={() => setActiveSection('programs')}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t.nav.programs}
              </button>
            </div>

            {!activeProgram ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 py-4">
                {t.dashboard.noProgramDesc}
              </p>
            ) : (
              <div className="space-y-3">
                <div className="pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <p className="text-sm font-semibold">{activeProgram.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                    {tLabel(GOAL_LABELS[activeProgram.goal], language)} · {activeProgram.completedSessions}{' '}
                    {t.dashboard.of} {activeProgram.durationWeeks * activeProgram.weeklyFrequency}{' '}
                    {t.dashboard.sessionsUnit}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {activeProgram.scheduledDays.map((day, idx) => {
                    const wd = WEEKDAYS[idx];
                    const isToday = idx === mondayIdx;
                    return (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs ${
                          isToday
                            ? 'bg-emerald-500/10 border border-emerald-500/30 font-medium'
                            : 'bg-neutral-50 dark:bg-[#090A0B]'
                        }`}
                      >
                        <span className={isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}>
                          {language === 'ar' ? wd.ar : wd.shortEn}
                        </span>
                        <span className="truncate max-w-[160px]">
                          {day.isRestDay ? t.programs.restDay : day.workoutName || t.programs.restDay}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Recent Strength Improvements */}
          <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              {t.dashboard.recentImprovements}
            </h2>
            {stats.improvements.length === 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 py-2">
                {t.dashboard.noHistoryYet}
              </p>
            ) : (
              <div className="space-y-2.5">
                {stats.improvements.map((imp) => (
                  <button
                    type="button"
                    key={imp.exerciseId}
                    onClick={() => openExerciseDetail(imp.exerciseId)}
                    className="w-full flex items-center justify-between gap-2 text-xs py-1.5 border-b last:border-none border-neutral-100 dark:border-neutral-800/70 hover:text-emerald-500 transition-colors cursor-pointer text-start"
                  >
                    <span className="font-medium truncate">{imp.name}</span>
                    <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 shrink-0">
                      +{formatWeight(imp.deltaKg, unit)} {unit === 'lb' ? t.common.lb : t.common.kg} (
                      {formatWeight(imp.currKg, unit)})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Active Performance Goals */}
          <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                {t.apex.goalsTitle}
              </h2>
              <button
                onClick={() => setActiveSection('analytics')}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {t.nav.analytics}
              </button>
            </div>
            {activeGoals.length === 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 py-2">
                {language === 'ar'
                  ? 'لا توجد أهداف نشطة حالياً. أضف هدفاً من صفحة التحليلات.'
                  : 'No active goals yet. Set strength or rep targets in Analytics.'}
              </p>
            ) : (
              <div className="space-y-3">
                {activeGoals.slice(0, 4).map((g) => {
                  const prog = evaluateGoalProgress(g, personalRecords);
                  const unitStr =
                    g.targetType === 'reps'
                      ? t.common.reps
                      : unit === 'lb'
                        ? t.common.lb
                        : t.common.kg;
                  return (
                    <div key={g.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium truncate">{g.title}</span>
                        <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 shrink-0">
                          {g.targetType === 'reps'
                            ? `${prog.currentVal} / ${prog.targetVal} ${unitStr}`
                            : `${formatWeight(prog.currentVal, unit)} / ${formatWeight(prog.targetVal, unit)} ${unitStr}`}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${prog.pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Personal Records */}
          <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-500" />
                {t.dashboard.recentPRs}
              </h2>
              {stats.prRecords.length > 0 && (
                <button
                  onClick={() => setActiveSection('analytics')}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {t.common.all}
                </button>
              )}
            </div>
            {stats.prRecords.length === 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 py-2">
                {t.dashboard.noPRsYet}
              </p>
            ) : (
              <div className="space-y-2.5">
                {stats.prRecords.map((pr) => (
                  <button
                    type="button"
                    key={pr.exerciseId}
                    onClick={() => openExerciseDetail(pr.exerciseId)}
                    className="w-full flex items-center justify-between gap-2 text-xs py-1.5 border-b last:border-none border-neutral-100 dark:border-neutral-800/70 hover:text-emerald-500 transition-colors cursor-pointer text-start"
                  >
                    <span className="font-medium truncate">
                      {language === 'ar' ? pr.exerciseNameAr : pr.exerciseNameEn}
                    </span>
                    <span className="font-mono tabular-nums font-semibold shrink-0">
                      {formatWeight(pr.bestWeightKg, unit)} {unit === 'lb' ? t.common.lb : t.common.kg} ×{' '}
                      {pr.bestWeightReps}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {scannerOpen && (
        <QrScannerModal
          onClose={() => setScannerOpen(false)}
          onSuccess={() => setQuickJoinCode('')}
        />
      )}
    </div>
  );
};
