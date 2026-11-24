import {
  Exercise,
  Language,
  LiveExerciseEntry,
  MuscleGroup,
  PersonalRecord,
  PRMilestone,
  WeightUnit,
  WorkoutSessionHistory,
} from '../types/ironlog';

const KG_TO_LB = 2.2046226218;

export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  if (!Number.isFinite(kg)) return 0;
  const val = unit === 'lb' ? kg * KG_TO_LB : kg;
  return Math.round(val * 10) / 10;
}

export function toStorageKg(displayValue: number, unit: WeightUnit): number {
  if (!Number.isFinite(displayValue) || displayValue < 0) return 0;
  const kg = unit === 'lb' ? displayValue / KG_TO_LB : displayValue;
  return Math.round(kg * 100) / 100;
}

export function formatWeight(kg: number, unit: WeightUnit): string {
  const val = toDisplayWeight(kg, unit);
  return `${val}`;
}

export function formatVolume(volumeKg: number, unit: WeightUnit, language: Language = 'en'): string {
  const val = unit === 'lb' ? volumeKg * KG_TO_LB : volumeKg;
  if (val >= 1000) {
    const scaled = (val / 1000).toFixed(1);
    return language === 'ar' ? `${scaled} ألف` : `${scaled}k`;
  }
  return `${Math.round(val)}`;
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Epley estimated 1-rep max formula, only computed when reps are between 2 and 10
 * and weight > 0. Never conflated with a tested 1-rep max.
 */
export function calculateEstimated1RM(weightKg: number, reps: number): number | null {
  if (weightKg <= 0 || reps < 2 || reps > 10) return null;
  const est = weightKg * (1 + reps / 30);
  return Math.round(est * 10) / 10;
}

export function getPreviousExercisePerformance(
  exerciseId: string,
  history: WorkoutSessionHistory[]
): LiveExerciseEntry | null {
  for (const session of history) {
    const found = session.exercises.find(
      (ex) => ex.exerciseId === exerciseId && !ex.skipped && ex.sets.some((s) => s.completed)
    );
    if (found) return found;
  }
  return null;
}

export interface DetectedPRResult {
  updatedRecord: PersonalRecord;
  unlockedMessages: { en: string; ar: string }[];
  prExerciseIds: Set<string>;
}

export function evaluatePersonalRecord(
  existing: PersonalRecord | undefined,
  exerciseId: string,
  exerciseNameEn: string,
  exerciseNameAr: string,
  sets: { weightKg: number; reps: number; completed: boolean }[],
  sessionId: string,
  dateIso: string,
  userId: string
): { record: PersonalRecord; newPRTypes: ('weight' | 'reps' | 'estimated_1rm')[] } {
  const completedSets = sets.filter((s) => s.completed && s.reps > 0);
  const prevBestWeight = existing?.bestWeightKg ?? 0;
  const prevBestWeightReps = existing?.bestWeightReps ?? 0;
  const prevBestReps = existing?.bestReps ?? 0;
  const prevBestRepsWeight = existing?.bestRepsWeightKg ?? 0;
  const prevEst1RM = existing?.estimated1RMKg ?? 0;

  let bestWeightKg = prevBestWeight;
  let bestWeightReps = prevBestWeightReps;
  let bestWeightDate = existing?.bestWeightDate ?? '';
  let bestWeightSessionId = existing?.bestWeightSessionId ?? '';

  let bestReps = prevBestReps;
  let bestRepsWeightKg = prevBestRepsWeight;
  let bestRepsDate = existing?.bestRepsDate ?? '';
  let bestRepsSessionId = existing?.bestRepsSessionId ?? '';

  let estimated1RMKg = prevEst1RM;
  let estimated1RMWeightKg = existing?.estimated1RMWeightKg ?? 0;
  let estimated1RMReps = existing?.estimated1RMReps ?? 0;
  let estimated1RMDate = existing?.estimated1RMDate ?? '';
  let estimated1RMSessionId = existing?.estimated1RMSessionId ?? '';

  const milestones: PRMilestone[] = existing?.milestones ? [...existing.milestones] : [];
  const newPRTypes: ('weight' | 'reps' | 'estimated_1rm')[] = [];

  for (const s of completedSets) {
    if (s.weightKg > bestWeightKg || (s.weightKg === bestWeightKg && s.weightKg > 0 && s.reps > bestWeightReps)) {
      if (s.weightKg > bestWeightKg) {
        if (!newPRTypes.includes('weight')) newPRTypes.push('weight');
        milestones.unshift({
          type: 'weight',
          value: s.weightKg,
          reps: s.reps,
          weightKg: s.weightKg,
          date: dateIso,
          sessionId,
        });
      }
      bestWeightKg = s.weightKg;
      bestWeightReps = s.reps;
      bestWeightDate = dateIso;
      bestWeightSessionId = sessionId;
    }

    if (s.reps > bestReps || (s.reps === bestReps && s.weightKg > bestRepsWeightKg)) {
      if (s.reps > bestReps) {
        if (!newPRTypes.includes('reps')) newPRTypes.push('reps');
        milestones.unshift({
          type: 'reps',
          value: s.reps,
          reps: s.reps,
          weightKg: s.weightKg,
          date: dateIso,
          sessionId,
        });
      }
      bestReps = s.reps;
      bestRepsWeightKg = s.weightKg;
      bestRepsDate = dateIso;
      bestRepsSessionId = sessionId;
    }

    const est = calculateEstimated1RM(s.weightKg, s.reps);
    if (est !== null && est > estimated1RMKg) {
      if (!newPRTypes.includes('estimated_1rm')) newPRTypes.push('estimated_1rm');
      estimated1RMKg = est;
      estimated1RMWeightKg = s.weightKg;
      estimated1RMReps = s.reps;
      estimated1RMDate = dateIso;
      estimated1RMSessionId = sessionId;
      milestones.unshift({
        type: 'estimated_1rm',
        value: est,
        reps: s.reps,
        weightKg: s.weightKg,
        date: dateIso,
        sessionId,
      });
    }
  }

  return {
    record: {
      exerciseId,
      userId,
      exerciseNameEn: exerciseNameEn.slice(0, 120),
      exerciseNameAr: exerciseNameAr.slice(0, 120),
      bestWeightKg,
      bestWeightReps,
      bestWeightDate,
      bestWeightSessionId,
      bestReps,
      bestRepsWeightKg,
      bestRepsDate,
      bestRepsSessionId,
      estimated1RMKg,
      estimated1RMWeightKg,
      estimated1RMReps,
      estimated1RMDate,
      estimated1RMSessionId,
      milestones: milestones.slice(0, 50),
    },
    newPRTypes,
  };
}

export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getStartOfWeekIso(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun, 1 = Mon
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function filterSessionsByPeriod(
  sessions: WorkoutSessionHistory[],
  period: '7d' | '30d' | '90d' | '1y' | 'all'
): WorkoutSessionHistory[] {
  if (period === 'all') return sessions;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return sessions.filter((s) => new Date(s.completedAt).getTime() >= cutoff);
}

export interface MuscleVolumeStat {
  muscle: MuscleGroup;
  primarySets: number;
  secondarySets: number;
  effectiveSets: number;
  volumeKg: number;
}

export function computeMuscleGroupStats(
  sessions: WorkoutSessionHistory[],
  exerciseCatalog: Exercise[]
): MuscleVolumeStat[] {
  const map = new Map<MuscleGroup, MuscleVolumeStat>();
  const allMuscles: MuscleGroup[] = [
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'forearms',
    'quadriceps',
    'hamstrings',
    'glutes',
    'calves',
    'abdominals',
  ];
  for (const m of allMuscles) {
    map.set(m, { muscle: m, primarySets: 0, secondarySets: 0, effectiveSets: 0, volumeKg: 0 });
  }

  const catalogById = new Map(exerciseCatalog.map((e) => [e.id, e]));

  for (const session of sessions) {
    for (const ex of session.exercises) {
      if (ex.skipped) continue;
      const completedSets = ex.sets.filter((s) => s.completed);
      if (completedSets.length === 0) continue;

      const setCount = completedSets.length;
      const vol = completedSets.reduce((acc, s) => acc + s.weightKg * s.reps, 0);

      const ref = catalogById.get(ex.exerciseId);
      const primaries = ex.primaryMuscles?.length ? ex.primaryMuscles : ref?.primaryMuscles ?? [];
      const secondaries = ex.secondaryMuscles?.length ? ex.secondaryMuscles : ref?.secondaryMuscles ?? [];

      for (const m of primaries) {
        const entry = map.get(m);
        if (entry) {
          entry.primarySets += setCount;
          entry.effectiveSets += setCount;
          entry.volumeKg += vol;
        }
      }
      for (const m of secondaries) {
        const entry = map.get(m);
        if (entry) {
          entry.secondarySets += setCount;
          entry.effectiveSets += setCount * 0.5;
          entry.volumeKg += vol * 0.5;
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.primarySets - a.primarySets || b.volumeKg - a.volumeKg);
}

export function getExerciseHistoryPoints(
  exerciseId: string,
  sessions: WorkoutSessionHistory[]
): {
  date: string;
  sessionId: string;
  workoutName: string;
  maxWeightKg: number;
  bestReps: number;
  estimated1RMKg: number | null;
  volumeKg: number;
  setsCount: number;
}[] {
  const ordered = [...sessions].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );
  const points: {
    date: string;
    sessionId: string;
    workoutName: string;
    maxWeightKg: number;
    bestReps: number;
    estimated1RMKg: number | null;
    volumeKg: number;
    setsCount: number;
  }[] = [];

  for (const session of ordered) {
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId && !e.skipped);
    if (!ex) continue;
    const completed = ex.sets.filter((s) => s.completed && s.reps > 0);
    if (completed.length === 0) continue;

    let maxWeightKg = 0;
    let bestReps = 0;
    let bestEst1RM: number | null = null;
    let volumeKg = 0;

    for (const s of completed) {
      if (s.weightKg > maxWeightKg) maxWeightKg = s.weightKg;
      if (s.reps > bestReps) bestReps = s.reps;
      volumeKg += s.weightKg * s.reps;
      const est = calculateEstimated1RM(s.weightKg, s.reps);
      if (est !== null && (bestEst1RM === null || est > bestEst1RM)) {
        bestEst1RM = est;
      }
    }

    points.push({
      date: session.completedAt,
      sessionId: session.id,
      workoutName: session.workoutName,
      maxWeightKg,
      bestReps,
      estimated1RMKg: bestEst1RM,
      volumeKg: Math.round(volumeKg * 10) / 10,
      setsCount: completed.length,
    });
  }

  return points;
}

export function filterSessionsByCustomRange(
  sessions: WorkoutSessionHistory[],
  fromDate: string,
  toDate: string
): WorkoutSessionHistory[] {
  const fromMs = fromDate ? new Date(fromDate).getTime() : 0;
  const toMs = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
  return sessions.filter((s) => {
    const ms = new Date(s.completedAt).getTime();
    return ms >= fromMs && ms <= toMs;
  });
}

export interface FatigueAlert {
  hasWarning: boolean;
  level: 'caution' | 'spike';
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
}

/**
 * Evaluates real logged sessions for acute weekly volume spikes (>30% above 4-week rolling baseline)
 * or consecutive high-RPE (>= 9) training sessions so athletes can manage fatigue safely.
 */
export function detectFatigueAndSpikes(sessions: WorkoutSessionHistory[]): FatigueAlert | null {
  if (sessions.length < 3) return null;
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const twentyEightDaysMs = 28 * 24 * 60 * 60 * 1000;

  const last7Days = sessions.filter((s) => now - new Date(s.completedAt).getTime() <= sevenDaysMs);
  const prior21Days = sessions.filter((s) => {
    const age = now - new Date(s.completedAt).getTime();
    return age > sevenDaysMs && age <= twentyEightDaysMs;
  });

  const last7Vol = last7Days.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
  const priorWeeklyAvg =
    prior21Days.length > 0
      ? prior21Days.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0) / 3
      : 0;

  if (priorWeeklyAvg > 500 && last7Vol > priorWeeklyAvg * 1.35) {
    const pct = Math.round(((last7Vol - priorWeeklyAvg) / priorWeeklyAvg) * 100);
    return {
      hasWarning: true,
      level: 'spike',
      titleEn: `Workload Spike Detected (+${pct}%)`,
      titleAr: `ارتفاع مفاجئ في الحمل التدريبي (+${pct}٪)`,
      messageEn: `Your 7-day volume is ${pct}% above your recent weekly average. Consider keeping 2–3 reps in reserve today to avoid excessive fatigue.`,
      messageAr: `حجم التمرين خلال آخر 7 أيام أعلى بنسبة ${pct}٪ من متوسطك الأسبوعي الأخير. يُنصح بالإبقاء على تكرارين إلى 3 تكرارات احتياط اليوم.`,
    };
  }

  const recentHighRpe = sessions.slice(0, 3).filter((s) => (s.sessionRpe ?? 0) >= 9).length;
  if (recentHighRpe >= 3) {
    return {
      hasWarning: true,
      level: 'caution',
      titleEn: 'Consecutive High-Intensity Sessions',
      titleAr: 'جلسات متتالية عالية الشدة',
      messageEn: 'Your last 3 completed workouts averaged RPE 9+. Prioritize warm-up quality and consider a deload or lighter effort if bar speed drops.',
      messageAr: 'آخر 3 جلسات مكتملة كانت بشدة RPE 9 فأعلى. ركّز على الإحماء الجيد وفكر في تخفيف الشدة إذا لاحظت إرهاقاً.',
    };
  }

  return null;
}

export function evaluateGoalProgress(
  goal: {
    targetType: 'weight' | 'reps' | 'estimated_1rm' | 'milestone';
    exerciseId?: string;
    targetWeightKg?: number;
    targetReps?: number;
    status: 'active' | 'achieved' | 'paused';
  },
  prs: Record<string, PersonalRecord>
): { currentVal: number; targetVal: number; pct: number } {
  if (goal.status === 'achieved') return { currentVal: 100, targetVal: 100, pct: 100 };
  const pr = goal.exerciseId ? prs[goal.exerciseId] : undefined;
  if (!pr) {
    return { currentVal: 0, targetVal: goal.targetWeightKg ?? goal.targetReps ?? 100, pct: 0 };
  }
  if (goal.targetType === 'reps') {
    const target = Math.max(1, goal.targetReps ?? 1);
    const cur = pr.bestReps || 0;
    return { currentVal: cur, targetVal: target, pct: Math.min(100, Math.round((cur / target) * 100)) };
  }
  if (goal.targetType === 'estimated_1rm') {
    const target = Math.max(1, goal.targetWeightKg ?? 1);
    const cur = pr.estimated1RMKg || 0;
    return { currentVal: cur, targetVal: target, pct: Math.min(100, Math.round((cur / target) * 100)) };
  }
  const target = Math.max(1, goal.targetWeightKg ?? 1);
  const cur = pr.bestWeightKg || 0;
  return { currentVal: cur, targetVal: target, pct: Math.min(100, Math.round((cur / target) * 100)) };
}

