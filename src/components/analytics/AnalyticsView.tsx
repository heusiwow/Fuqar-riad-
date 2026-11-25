import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Plus,
  Target,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MUSCLE_LABELS, tLabel } from '../../i18n/translations';
import {
  deletePerformanceGoal,
  generateSafeId,
  savePerformanceGoal,
} from '../../services/firestoreService';
import { PerformanceGoal } from '../../types/ironlog';
import {
  computeMuscleGroupStats,
  evaluateGoalProgress,
  filterSessionsByCustomRange,
  filterSessionsByPeriod,
  formatWeight,
  getExerciseHistoryPoints,
  toDisplayWeight,
  toStorageKg,
} from '../../utils/calculations';
import { SimpleBarChart, TrendLineChart } from '../common/Charts';
import { MuscleDiagram } from '../common/MuscleDiagram';

type PeriodKey = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom';

export const AnalyticsView: React.FC = () => {
  const {
    firebaseUser,
    profile,
    language,
    unit,
    t,
    allExercises,
    sessions,
    personalRecords,
    goals,
    openHistorySession,
    showToast,
  } = useApp();

  const [period, setPeriod] = useState<PeriodKey>('90d');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedPrId, setExpandedPrId] = useState<string | null>(null);

  // Performance goal form state
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState<PerformanceGoal['targetType']>('weight');
  const [goalExId, setGoalExId] = useState('barbell-bench-press');
  const [goalTargetWeight, setGoalTargetWeight] = useState('100');
  const [goalTargetReps, setGoalTargetReps] = useState('10');
  const [goalDate, setGoalDate] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  // Exercises that actually appear in logged sessions first
  const loggedExerciseIds = useMemo(() => {
    const ids = new Set<string>();
    for (const s of sessions) {
      for (const ex of s.exercises) {
        if (!ex.skipped) ids.add(ex.exerciseId);
      }
    }
    return Array.from(ids);
  }, [sessions]);

  const selectableExercises = useMemo(() => {
    if (loggedExerciseIds.length > 0) {
      return allExercises.filter((e) => loggedExerciseIds.includes(e.id));
    }
    return allExercises.slice(0, 12);
  }, [allExercises, loggedExerciseIds]);

  const [selectedExId, setSelectedExId] = useState<string>(selectableExercises[0]?.id || 'barbell-bench-press');
  const [compareExA, setCompareExA] = useState<string>(selectableExercises[0]?.id || 'barbell-bench-press');
  const [compareExB, setCompareExB] = useState<string>(
    selectableExercises[1]?.id || selectableExercises[0]?.id || 'barbell-back-squat'
  );

  // Sync defaults once logged sessions arrive from Firestore
  useEffect(() => {
    if (loggedExerciseIds.length === 0) return;
    if (!loggedExerciseIds.includes(selectedExId)) {
      setSelectedExId(loggedExerciseIds[0]);
    }
    if (!loggedExerciseIds.includes(compareExA)) {
      setCompareExA(loggedExerciseIds[0]);
    }
    if (!loggedExerciseIds.includes(compareExB)) {
      setCompareExB(loggedExerciseIds[1] || loggedExerciseIds[0]);
    }
  }, [loggedExerciseIds]);

  const periodSessions = useMemo(
    () =>
      period === 'custom'
        ? filterSessionsByCustomRange(sessions, fromDate, toDate)
        : filterSessionsByPeriod(sessions, period),
    [sessions, period, fromDate, toDate]
  );

  const exerciseHistoryRaw = useMemo(
    () => getExerciseHistoryPoints(selectedExId, periodSessions),
    [selectedExId, periodSessions]
  );

  const strengthPoints = useMemo(() => {
    return exerciseHistoryRaw.map((pt) => ({
      label: new Date(pt.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: toDisplayWeight(pt.maxWeightKg, unit),
      secondaryValue: pt.estimated1RMKg !== null ? toDisplayWeight(pt.estimated1RMKg, unit) : undefined,
    }));
  }, [exerciseHistoryRaw, unit, language]);

  const sessionMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sessions) {
      map.set(s.id, s.workoutName);
    }
    return map;
  }, [sessions]);

  const volumeTrendPoints = useMemo(() => {
    const ordered = [...periodSessions].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    return ordered.map((s) => ({
      label: new Date(s.completedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: Math.round(toDisplayWeight(s.totalVolumeKg, unit)),
    }));
  }, [periodSessions, unit, language]);

  const weeklyFrequencyBars = useMemo(() => {
    // Last 8 weeks
    const now = new Date();
    const bars: { label: string; value: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const count = sessions.filter((s) => {
        const ts = new Date(s.completedAt).getTime();
        return ts >= start.getTime() && ts < end.getTime();
      }).length;
      bars.push({
        label: start.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
          month: 'numeric',
          day: 'numeric',
        }),
        value: count,
      });
    }
    return bars;
  }, [sessions, language]);

  const monthlyConsistencyBars = useMemo(() => {
    const now = new Date();
    const bars: { label: string; value: number }[] = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = sessions.filter((s) => s.completedAt.startsWith(ym)).length;
      bars.push({
        label: d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' }),
        value: count,
      });
    }
    return bars;
  }, [sessions, language]);

  const muscleStats = useMemo(
    () => computeMuscleGroupStats(periodSessions, allExercises),
    [periodSessions, allExercises]
  );

  const comparisonData = useMemo(() => {
    const ptsA = getExerciseHistoryPoints(compareExA, periodSessions);
    const ptsB = getExerciseHistoryPoints(compareExB, periodSessions);
    const exA = allExercises.find((e) => e.id === compareExA);
    const exB = allExercises.find((e) => e.id === compareExB);
    const summarize = (pts: ReturnType<typeof getExerciseHistoryPoints>) => {
      if (!pts.length) return { maxKg: 0, totalSets: 0, totalVolKg: 0, sessions: 0 };
      return {
        maxKg: Math.max(...pts.map((p) => p.maxWeightKg)),
        totalSets: pts.reduce((acc, p) => acc + p.setsCount, 0),
        totalVolKg: pts.reduce((acc, p) => acc + p.volumeKg, 0),
        sessions: pts.length,
      };
    };
    return {
      a: { name: exA ? (language === 'ar' ? exA.nameAr : exA.nameEn) : '—', ...summarize(ptsA) },
      b: { name: exB ? (language === 'ar' ? exB.nameAr : exB.nameEn) : '—', ...summarize(ptsB) },
    };
  }, [compareExA, compareExB, periodSessions, allExercises, language]);

  const prList = useMemo(
    () =>
      Object.values(personalRecords).sort((a, b) =>
        (b.bestWeightDate || '').localeCompare(a.bestWeightDate || '')
      ),
    [personalRecords]
  );

  const unitText = unit === 'lb' ? t.common.lb : t.common.kg;

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !goalTitle.trim()) return;
    setSavingGoal(true);
    try {
      const ex = allExercises.find((item) => item.id === goalExId);
      await savePerformanceGoal(
        firebaseUser.uid,
        {
          id: generateSafeId('goal'),
          title: goalTitle.trim(),
          targetType: goalType,
          exerciseId: ex?.id || goalExId,
          exerciseNameEn: ex?.nameEn || '',
          exerciseNameAr: ex?.nameAr || '',
          targetWeightKg:
            goalType === 'weight' || goalType === 'estimated_1rm'
              ? toStorageKg(Number(goalTargetWeight) || 0, unit)
              : undefined,
          targetReps: goalType === 'reps' ? Number(goalTargetReps) || 10 : undefined,
          targetDate: goalDate || undefined,
          status: 'active',
        },
        false,
        profile?.coachId
      );
      setGoalTitle('');
      setGoalFormOpen(false);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSavingGoal(false);
    }
  };

  const handleToggleGoalStatus = async (g: PerformanceGoal) => {
    if (!firebaseUser) return;
    try {
      await savePerformanceGoal(
        firebaseUser.uid,
        { ...g, status: g.status === 'achieved' ? 'active' : 'achieved' },
        true,
        profile?.coachId
      );
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!firebaseUser) return;
    try {
      await deletePerformanceGoal(firebaseUser.uid, goalId);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const heatmapMuscles = useMemo(() => {
    const active = muscleStats.filter((m) => m.primarySets > 0);
    return {
      primary: active.slice(0, 3).map((m) => m.muscle),
      secondary: active.slice(3, 6).map((m) => m.muscle),
    };
  }, [muscleStats]);

  const periods: { id: PeriodKey; label: string }[] = [
    { id: '7d', label: t.analytics.period7d },
    { id: '30d', label: t.analytics.period30d },
    { id: '90d', label: t.analytics.period90d },
    { id: '1y', label: t.analytics.period1y },
    { id: 'all', label: t.analytics.periodAll },
    { id: 'custom', label: t.apex.customRange },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.analytics.title}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{t.analytics.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 shrink-0">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                period === p.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {period === 'custom' && (
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 shrink-0">{t.history.filterFrom}</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="flex-1 min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 shrink-0">{t.history.filterTo}</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="flex-1 min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* Performance Goals & Targets */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            {t.apex.goalsTitle}
          </h2>
          <button
            type="button"
            onClick={() => setGoalFormOpen((prev) => !prev)}
            className="min-h-[36px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.apex.newGoal}
          </button>
        </div>

        {goalFormOpen && (
          <form
            onSubmit={handleCreateGoal}
            className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
          >
            <div className="lg:col-span-2">
              <label className="block text-[11px] text-neutral-500 mb-1">
                {language === 'ar' ? 'عنوان الهدف' : 'Goal Title'}
              </label>
              <input
                type="text"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: بنش برس 100 كجم' : 'e.g., 100 kg Bench Press'}
                className="w-full min-h-[40px] px-3 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">{t.exercises.title}</label>
              <select
                value={goalExId}
                onChange={(e) => setGoalExId(e.target.value)}
                className="w-full min-h-[40px] px-2.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
              >
                {allExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {language === 'ar' ? ex.nameAr : ex.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">
                {goalType === 'reps' ? t.common.reps : `${t.apex.targetWeight} (${unitText})`}
              </label>
              <div className="flex gap-1.5">
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as PerformanceGoal['targetType'])}
                  className="min-h-[40px] px-2 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-[11px]"
                >
                  <option value="weight">{unitText}</option>
                  <option value="reps">{t.common.reps}</option>
                  <option value="estimated_1rm">1RM</option>
                </select>
                {goalType === 'reps' ? (
                  <input
                    type="number"
                    min={1}
                    value={goalTargetReps}
                    onChange={(e) => setGoalTargetReps(e.target.value)}
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                  />
                ) : (
                  <input
                    type="number"
                    min={1}
                    step="0.5"
                    value={goalTargetWeight}
                    onChange={(e) => setGoalTargetWeight(e.target.value)}
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="flex-1 min-h-[40px] px-2.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-[11px]"
              />
              <button
                type="submit"
                disabled={savingGoal}
                className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shrink-0"
              >
                {t.common.save}
              </button>
            </div>
          </form>
        )}

        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goals.map((g) => {
              const prog = evaluateGoalProgress(g, personalRecords);
              return (
                <div
                  key={g.id}
                  className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{g.title}</p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {language === 'ar' ? g.exerciseNameAr : g.exerciseNameEn}
                        {g.targetDate ? ` · ${g.targetDate}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleGoalStatus(g)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 ${
                          g.status === 'achieved'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : 'border border-neutral-200 dark:border-neutral-800 text-neutral-500'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {g.status === 'achieved' ? t.apex.goalAchieved : t.apex.goalActive}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(g.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${prog.pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono tabular-nums text-neutral-500">
                    <span>
                      {g.targetType === 'reps'
                        ? `${prog.currentVal} / ${prog.targetVal} ${t.common.reps}`
                        : `${formatWeight(prog.currentVal, unit)} / ${formatWeight(prog.targetVal, unit)} ${unitText}`}
                    </span>
                    <span className="text-emerald-500 font-semibold">{prog.pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Strength Progression Chart */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{t.analytics.strengthProgression}</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t.analytics.est1rmDisclaimer}
            </p>
          </div>
          <select
            value={selectedExId}
            onChange={(e) => setSelectedExId(e.target.value)}
            className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-medium max-w-xs"
          >
            {selectableExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {language === 'ar' ? ex.nameAr : ex.nameEn}
              </option>
            ))}
          </select>
        </div>

        <TrendLineChart
          points={strengthPoints}
          unitLabel={unitText}
          primaryLabel={t.analytics.maxWeightLabel}
          secondaryLabel={t.analytics.est1rmLabel}
          emptyMessage={t.analytics.noAnalyticsData}
        />

        {exerciseHistoryRaw.length > 0 && (
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5">
            <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {t.analytics.exerciseHistoryTitle}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                    <th className="py-2 pe-3 text-start font-medium">{t.common.date}</th>
                    <th className="py-2 px-3 text-start font-medium">{t.analytics.workoutName}</th>
                    <th className="py-2 px-3 text-end font-medium">{t.common.sets}</th>
                    <th className="py-2 px-3 text-end font-medium">{t.analytics.maxWeightLabel}</th>
                    <th className="py-2 px-3 text-end font-medium">{t.analytics.est1rmLabel}</th>
                    <th className="py-2 ps-3 text-end font-medium">{t.common.volume}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-mono tabular-nums">
                  {[...exerciseHistoryRaw].reverse().slice(0, 10).map((pt) => (
                    <tr key={pt.sessionId}>
                      <td className="py-2.5 pe-3 text-neutral-500 whitespace-nowrap">
                        {new Date(pt.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <button
                          type="button"
                          onClick={() => openHistorySession(pt.sessionId)}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer text-start"
                        >
                          <span className="truncate max-w-[160px]">{pt.workoutName}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-end">{pt.setsCount}</td>
                      <td className="py-2.5 px-3 text-end font-semibold">
                        {formatWeight(pt.maxWeightKg, unit)} {unitText} × {pt.bestReps}
                      </td>
                      <td className="py-2.5 px-3 text-end">
                        {pt.estimated1RMKg !== null
                          ? `${formatWeight(pt.estimated1RMKg, unit)} ${unitText}`
                          : '—'}
                      </td>
                      <td className="py-2.5 ps-3 text-end">
                        {Math.round(toDisplayWeight(pt.volumeKg, unit))} {unitText}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Frequency & Consistency Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
          <h2 className="text-base font-semibold">{t.analytics.weeklyFrequencyChart}</h2>
          <SimpleBarChart
            bars={weeklyFrequencyBars}
            unitLabel={t.dashboard.sessionsUnit}
            emptyMessage={t.analytics.noAnalyticsData}
          />
        </section>

        <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
          <h2 className="text-base font-semibold">{t.analytics.monthlyConsistency}</h2>
          <SimpleBarChart
            bars={monthlyConsistencyBars}
            unitLabel={t.dashboard.sessionsUnit}
            emptyMessage={t.analytics.noAnalyticsData}
          />
        </section>
      </div>

      {/* Session Volume Trend & Muscle Group Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
          <h2 className="text-base font-semibold">{t.analytics.volumeTrends}</h2>
          <TrendLineChart
            points={volumeTrendPoints}
            unitLabel={unitText}
            primaryLabel={t.common.volume}
            emptyMessage={t.analytics.noAnalyticsData}
          />
        </section>

        <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-semibold">{t.analytics.muscleVolumeBreakdown}</h2>
          {muscleStats.every((m) => m.primarySets === 0) ? (
            <p className="text-sm text-neutral-500 py-10 text-center">{t.analytics.noAnalyticsData}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
                <MuscleDiagram
                  primaryMuscles={heatmapMuscles.primary}
                  secondaryMuscles={heatmapMuscles.secondary}
                  language={language}
                  compact
                />
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pe-1">
                {muscleStats
                  .filter((m) => m.primarySets > 0 || m.secondarySets > 0)
                  .map((m) => {
                    const maxPrimary = Math.max(...muscleStats.map((x) => x.primarySets), 1);
                    const pct = Math.round((m.primarySets / maxPrimary) * 100);
                    return (
                      <div key={m.muscle} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{tLabel(MUSCLE_LABELS[m.muscle], language)}</span>
                          <span className="font-mono tabular-nums text-neutral-500">
                            {m.primarySets} {t.dashboard.setsUnit} ·{' '}
                            {Math.round(toDisplayWeight(m.volumeKg, unit))} {unitText}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Exercise Performance Comparison */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-base font-semibold">{t.analytics.exerciseComparison}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">{t.analytics.compareExerciseA}</label>
            <select
              value={compareExA}
              onChange={(e) => setCompareExA(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
            >
              {allExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {language === 'ar' ? ex.nameAr : ex.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">{t.analytics.compareExerciseB}</label>
            <select
              value={compareExB}
              onChange={(e) => setCompareExB(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
            >
              {allExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {language === 'ar' ? ex.nameAr : ex.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[comparisonData.a, comparisonData.b].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-2"
            >
              <p className="text-sm font-semibold truncate">{item.name}</p>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums pt-1">
                <div>
                  <span className="text-neutral-500 block text-[11px]">{t.analytics.testedMaxWeight}</span>
                  <strong>{formatWeight(item.maxKg, unit)} {unitText}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">{t.common.sets}</span>
                  <strong>{item.totalSets}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">{t.common.volume}</span>
                  <strong>{Math.round(toDisplayWeight(item.totalVolKg, unit))} {unitText}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Records Directory */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-500" />
            {t.analytics.prDirectory}
          </h2>
          <p className="text-[11px] text-neutral-500 inline-flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            {t.apex.testedVsEstNote}
          </p>
        </div>
        {prList.length === 0 ? (
          <p className="text-sm text-neutral-500 py-6 text-center">{t.dashboard.noPRsYet}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                  <th className="py-2.5 pe-4 text-start font-medium">{t.exercises.title}</th>
                  <th className="py-2.5 px-3 text-end font-medium">{t.analytics.testedMaxWeight}</th>
                  <th className="py-2.5 px-3 text-end font-medium">{t.analytics.bestRepsPerf}</th>
                  <th className="py-2.5 px-3 text-end font-medium">{t.analytics.est1rmLabel}</th>
                  <th className="py-2.5 px-3 text-end font-medium">{t.common.date}</th>
                  <th className="py-2.5 ps-3 text-end font-medium">{t.analytics.viewMilestones}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-mono tabular-nums">
                {prList.map((pr) => {
                  const isExpanded = expandedPrId === pr.exerciseId;
                  const linkedWorkoutName = pr.bestWeightSessionId
                    ? sessionMap.get(pr.bestWeightSessionId)
                    : undefined;
                  return (
                    <React.Fragment key={pr.exerciseId}>
                      <tr className="hover:bg-neutral-50/70 dark:hover:bg-[#090A0B]/50">
                        <td className="py-3 pe-4 font-sans font-medium">
                          <div>{language === 'ar' ? pr.exerciseNameAr : pr.exerciseNameEn}</div>
                          {linkedWorkoutName && pr.bestWeightSessionId && (
                            <button
                              type="button"
                              onClick={() => openHistorySession(pr.bestWeightSessionId)}
                              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                            >
                              {linkedWorkoutName}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-3 text-end text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatWeight(pr.bestWeightKg, unit)} {unitText} × {pr.bestWeightReps}
                        </td>
                        <td className="py-3 px-3 text-end">
                          {pr.bestReps} @ {formatWeight(pr.bestRepsWeightKg, unit)} {unitText}
                        </td>
                        <td className="py-3 px-3 text-end">
                          {pr.estimated1RMKg > 0 ? `${formatWeight(pr.estimated1RMKg, unit)} ${unitText}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-end text-neutral-500">
                          {pr.bestWeightDate
                            ? new Date(pr.bestWeightDate).toLocaleDateString(
                                language === 'ar' ? 'ar-EG' : 'en-US'
                              )
                            : '—'}
                        </td>
                        <td className="py-3 ps-3 text-end">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPrId((prev) => (prev === pr.exerciseId ? null : pr.exerciseId))
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[11px] font-sans hover:border-emerald-500/40 cursor-pointer"
                          >
                            <span>{pr.milestones?.length || 0}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="py-3 px-3 bg-neutral-50 dark:bg-[#090A0B]">
                            {!pr.milestones || pr.milestones.length === 0 ? (
                              <p className="text-xs font-sans text-neutral-500 text-center py-2">
                                {t.analytics.noMilestones}
                              </p>
                            ) : (
                              <div className="space-y-1.5">
                                {pr.milestones.slice(0, 10).map((m, idx) => {
                                  const wName = m.sessionId ? sessionMap.get(m.sessionId) : undefined;
                                  const label =
                                    m.type === 'weight'
                                      ? t.analytics.testedMaxWeight
                                      : m.type === 'reps'
                                        ? t.analytics.bestRepsPerf
                                        : t.analytics.est1rmLabel;
                                  return (
                                    <div
                                      key={idx}
                                      className="flex flex-wrap items-center justify-between gap-2 text-[11px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800"
                                    >
                                      <span className="font-sans text-neutral-600 dark:text-neutral-300">
                                        {label}:{' '}
                                        <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                                          {m.type === 'reps'
                                            ? `${m.reps ?? m.value} @ ${formatWeight(m.weightKg ?? 0, unit)} ${unitText}`
                                            : `${formatWeight(m.value, unit)} ${unitText}${m.reps !== undefined ? ` (${m.reps} ${t.common.reps})` : ''}`}
                                        </strong>
                                      </span>
                                      <div className="flex items-center gap-3">
                                        <span className="text-neutral-500">
                                          {new Date(m.date).toLocaleDateString(
                                            language === 'ar' ? 'ar-EG' : 'en-US'
                                          )}
                                        </span>
                                        {m.sessionId && sessionMap.has(m.sessionId) && (
                                          <button
                                            type="button"
                                            onClick={() => openHistorySession(m.sessionId)}
                                            className="font-sans text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                          >
                                            {wName || t.analytics.viewSession}
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
