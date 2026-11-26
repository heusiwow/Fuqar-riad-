import {
  BodyMeasurement,
  CoachAssignment,
  PerformanceGoal,
  PersonalRecord,
  ProgramDaySchedule,
  TrainingProgram,
  WorkoutSessionHistory,
  WorkoutTemplate,
} from '../../types/ironlog';
import { getLocalDateKey } from '../../utils/calculations';

export interface AthleteBundle {
  sessions: WorkoutSessionHistory[];
  programs: TrainingProgram[];
  workouts: WorkoutTemplate[];
  prs: PersonalRecord[];
  goals: PerformanceGoal[];
  measurements: BodyMeasurement[];
}

export interface ResolvedAthleteToday {
  activeProgram: TrainingProgram | Omit<TrainingProgram, 'userId' | 'createdAt' | 'updatedAt'> | null;
  workoutsPool: (WorkoutTemplate | Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'>)[];
  todaySchedule: ProgramDaySchedule | null;
  todayWorkout: WorkoutTemplate | Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'> | null;
  todaySessions: WorkoutSessionHistory[];
  completedToday: boolean;
  isRestDayToday: boolean;
  hasScheduledToday: boolean;
}

export function getTodayMondayIndex(date: Date = new Date()): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

export function resolveAthleteTodayStatus(
  bundle?: AthleteBundle | null,
  latestAssignment?: CoachAssignment | null,
  referenceDate: Date = new Date()
): ResolvedAthleteToday {
  const mondayIdx = getTodayMondayIndex(referenceDate);
  const todayKey = getLocalDateKey(referenceDate);

  const bundleActiveProg =
    bundle?.programs.find((p) => p.status === 'active') ||
    bundle?.programs.find((p) => p.status !== 'archived') ||
    null;

  // Prefer newly sent assignment if not yet reflected in bundle or if status is assigned
  const activeProgram =
    latestAssignment && latestAssignment.status === 'assigned'
      ? latestAssignment.programData
      : bundleActiveProg || latestAssignment?.programData || null;

  const workoutsPool: (WorkoutTemplate | Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'>)[] = [
    ...(latestAssignment?.workoutsData ?? []),
    ...(bundle?.workouts ?? []),
  ];

  const todaySchedule = activeProgram?.scheduledDays?.[mondayIdx] ?? null;

  let todayWorkout: WorkoutTemplate | Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'> | null = null;
  if (todaySchedule && !todaySchedule.isRestDay) {
    if (todaySchedule.workoutId) {
      todayWorkout = workoutsPool.find((w) => w.id === todaySchedule.workoutId) ?? null;
    }
    if (!todayWorkout && todaySchedule.workoutName) {
      todayWorkout = workoutsPool.find((w) => w.name === todaySchedule.workoutName) ?? null;
    }
  }

  const todaySessions = (bundle?.sessions ?? []).filter(
    (s) => getLocalDateKey(new Date(s.completedAt)) === todayKey
  );

  const completedToday = todaySessions.length > 0;
  const isRestDayToday = Boolean(activeProgram && (!todaySchedule || todaySchedule.isRestDay));
  const hasScheduledToday = Boolean(
    activeProgram && todaySchedule && !todaySchedule.isRestDay && (todaySchedule.workoutName || todayWorkout)
  );

  return {
    activeProgram,
    workoutsPool,
    todaySchedule,
    todayWorkout,
    todaySessions,
    completedToday,
    isRestDayToday,
    hasScheduledToday,
  };
}

export interface ExerciseProgressionEntry {
  sessionId: string;
  dateIso: string;
  workoutName: string;
  maxWeightKg: number;
  bestReps: number;
  totalVolumeKg: number;
  completedSetsCount: number;
}

export interface ExerciseProgressionSeries {
  exerciseId: string;
  nameEn: string;
  nameAr: string;
  entries: ExerciseProgressionEntry[];
  earliestMaxKg: number;
  latestMaxKg: number;
  deltaKg: number;
  peakMaxKg: number;
}

export function buildExerciseProgressionList(
  sessions: WorkoutSessionHistory[]
): ExerciseProgressionSeries[] {
  const chronological = [...sessions].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const byEx = new Map<
    string,
    { nameEn: string; nameAr: string; entries: ExerciseProgressionEntry[] }
  >();

  for (const s of chronological) {
    for (const ex of s.exercises) {
      if (ex.skipped) continue;
      const doneSets = ex.sets.filter((st) => st.completed);
      if (doneSets.length === 0) continue;

      const maxWeightKg = Math.max(...doneSets.map((st) => st.weightKg || 0));
      const bestReps = Math.max(...doneSets.map((st) => st.reps || 0));
      const totalVolumeKg = Math.round(
        doneSets.reduce((acc, st) => acc + (st.weightKg || 0) * (st.reps || 0), 0)
      );

      const cur = byEx.get(ex.exerciseId) || {
        nameEn: ex.exerciseNameEn,
        nameAr: ex.exerciseNameAr,
        entries: [],
      };
      cur.entries.push({
        sessionId: s.id,
        dateIso: s.completedAt,
        workoutName: s.workoutName,
        maxWeightKg,
        bestReps,
        totalVolumeKg,
        completedSetsCount: doneSets.length,
      });
      byEx.set(ex.exerciseId, cur);
    }
  }

  return Array.from(byEx.entries())
    .map(([exerciseId, data]) => {
      const earliestMaxKg = data.entries[0]?.maxWeightKg ?? 0;
      const latestMaxKg = data.entries[data.entries.length - 1]?.maxWeightKg ?? 0;
      const peakMaxKg = Math.max(...data.entries.map((e) => e.maxWeightKg), 0);
      return {
        exerciseId,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        entries: data.entries,
        earliestMaxKg,
        latestMaxKg,
        deltaKg: Math.round((latestMaxKg - earliestMaxKg) * 10) / 10,
        peakMaxKg,
      };
    })
    .sort((a, b) => b.entries.length - a.entries.length);
}
