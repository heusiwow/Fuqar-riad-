import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Minus,
  Plus,
  Search,
  SkipForward,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { ExerciseVideoViewer } from '../exercises/ExerciseVideoViewer';
import { MuscleDiagram } from '../common/MuscleDiagram';
import { useApp } from '../../context/AppContext';
import { EQUIPMENT_LABELS, MUSCLE_LABELS, SPLIT_LABELS, tLabel, WEEKDAYS } from '../../i18n/translations';
import {
  completeWorkoutSession,
  discardActiveSession,
  generateSafeId,
  updateActiveSessionState,
} from '../../services/firestoreService';
import {
  ActiveWorkoutSession,
  Exercise,
  LiveExerciseEntry,
  MuscleGroup,
  WorkoutSessionHistory,
  WorkoutTemplate,
} from '../../types/ironlog';
import {
  detectFatigueAndSpikes,
  formatDuration,
  formatWeight,
  getPreviousExercisePerformance,
  toDisplayWeight,
  toStorageKg,
} from '../../utils/calculations';
import { getExerciseBiomechanics } from '../../utils/exerciseBiomechanics';

const INTER_EXERCISE_REST_PRESETS = [180, 210, 240] as const; // 3:00, 3:30, 4:00
const DEFAULT_INTER_EXERCISE_REST = 210; // 3 minutes 30 seconds

function playRestChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore audio block
  }
}

function vibrateDevice() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([120, 60, 120]);
    } catch {
      // Ignore unsupported vibration
    }
  }
}

function getRepRangeLabel(ex: LiveExerciseEntry, lang: 'en' | 'ar'): string {
  const first = ex.sets[0];
  if (!first) return lang === 'ar' ? '8–12 عدة' : '8–12 reps';
  const minR = first.targetRepsMin ?? first.reps ?? 8;
  const maxR = first.targetRepsMax ?? first.reps ?? 12;
  if (minR === maxR) {
    return lang === 'ar' ? `${minR} عدة` : `${minR} reps`;
  }
  return lang === 'ar' ? `${minR}–${maxR} عدة` : `${minR}–${maxR} reps`;
}

function getSetsCountLabel(count: number, lang: 'en' | 'ar'): string {
  if (lang === 'en') return `${count} ${count === 1 ? 'set' : 'sets'}`;
  if (count === 1) return 'سيت واحد';
  if (count === 2) return 'سيتان';
  if (count >= 3 && count <= 10) return `${count} سيتات`;
  return `${count} سيت`;
}

export const LiveWorkoutView: React.FC = () => {
  const {
    firebaseUser,
    profile,
    language,
    unit,
    t,
    allExercises,
    workouts,
    activeProgram,
    activeSession,
    setActiveSessionLocal,
    sessions,
    personalRecords,
    goals,
    startWorkoutFromTemplate,
    startBlankWorkout,
    setActiveSection,
    showToast,
  } = useApp();

  // View state inside an active workout:
  // 'list' = Course ordered exercise list (mobile primary entry)
  // 'exercise' = Focused set-by-set logger for selected exercise
  // 'rest' = 3-4 minute inter-exercise countdown transition screen
  const [stage, setStage] = useState<'list' | 'exercise' | 'rest'>('list');
  const [selectedSetIdx, setSelectedSetIdx] = useState<number>(0);

  // Inter-exercise countdown state (3-4 minutes)
  const [interRestTotal, setInterRestTotal] = useState<number>(DEFAULT_INTER_EXERCISE_REST);
  const [interRestRemaining, setInterRestRemaining] = useState<number>(DEFAULT_INTER_EXERCISE_REST);
  const [interRestRunning, setInterRestRunning] = useState<boolean>(false);
  const [pendingNextExIdx, setPendingNextExIdx] = useState<number | null>(null);

  // Subtle between-set mini timer (non-blocking)
  const [setRestRemaining, setSetRestRemaining] = useState<number>(0);
  const [setRestRunning, setSetRestRunning] = useState<boolean>(false);

  // Modals & search
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideMode, setGuideMode] = useState<'video' | '2d'>('video');
  const [guideMuscle, setGuideMuscle] = useState<MuscleGroup | null>(null);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [exSearch, setExSearch] = useState('');
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [sessionRpe, setSessionRpe] = useState<number>(7);
  const [finishing, setFinishing] = useState(false);
  const [previewDayIdx, setPreviewDayIdx] = useState<number | null>(null);
  const [completedSummary, setCompletedSummary] = useState<{
    savedSession: WorkoutSessionHistory;
    unlockedPRs: { exerciseNameEn: string; exerciseNameAr: string; types: ('weight' | 'reps' | 'estimated_1rm')[] }[];
  } | null>(null);

  const syncTimeoutRef = useRef<number | null>(null);
  const lastSessionIdRef = useRef<string | null>(null);

  // Sync offline edits back to Firestore when connection returns
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (firebaseUser && activeSession) {
        updateActiveSessionState(firebaseUser.uid, activeSession).catch(() => {});
      }
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [firebaseUser, activeSession]);

  // Reset to clean course exercise list whenever a new workout starts
  useEffect(() => {
    if (!activeSession) {
      lastSessionIdRef.current = null;
      setStage('list');
      setInterRestRunning(false);
      setSetRestRunning(false);
      setPendingNextExIdx(null);
      return;
    }
    if (lastSessionIdRef.current !== activeSession.sessionId) {
      lastSessionIdRef.current = activeSession.sessionId;
      setStage(activeSession.exercises.length === 0 ? 'exercise' : 'list');
      setInterRestRunning(false);
      setSetRestRunning(false);
      setPendingNextExIdx(null);
    }
  }, [activeSession]);

  const currentExIdx = activeSession
    ? Math.min(Math.max(0, activeSession.currentExerciseIndex), Math.max(0, activeSession.exercises.length - 1))
    : 0;
  const currentExercise = activeSession?.exercises[currentExIdx] ?? null;

  // Keep selectedSetIdx aligned to the first incomplete set when switching exercises
  useEffect(() => {
    if (!currentExercise) {
      setSelectedSetIdx(0);
      return;
    }
    const nextPendingIdx = currentExercise.sets.findIndex((s) => !s.completed);
    setSelectedSetIdx(nextPendingIdx >= 0 ? nextPendingIdx : Math.max(0, currentExercise.sets.length - 1));
  }, [currentExercise?.itemId]);

  const persistSessionUpdate = (next: ActiveWorkoutSession) => {
    setActiveSessionLocal(next);
    if (!firebaseUser) return;
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = window.setTimeout(() => {
      updateActiveSessionState(firebaseUser.uid, next).catch(() => {});
    }, 350);
  };

  // Inter-exercise 3-4 minute countdown loop
  useEffect(() => {
    if (!interRestRunning) return;
    const id = window.setInterval(() => {
      setInterRestRemaining((prev) => {
        if (prev <= 1) {
          setInterRestRunning(false);
          playRestChime();
          vibrateDevice();
          if (activeSession && pendingNextExIdx !== null) {
            persistSessionUpdate({
              ...activeSession,
              currentExerciseIndex: pendingNextExIdx,
            });
            setPendingNextExIdx(null);
          }
          setStage('exercise');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [interRestRunning, pendingNextExIdx, activeSession]);

  // Subtle between-set timer loop
  useEffect(() => {
    if (!setRestRunning) return;
    const id = window.setInterval(() => {
      setSetRestRemaining((prev) => {
        if (prev <= 1) {
          setSetRestRunning(false);
          playRestChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [setRestRunning]);

  const previousExerciseData = useMemo(() => {
    if (!currentExercise) return null;
    return getPreviousExercisePerformance(currentExercise.exerciseId, sessions);
  }, [currentExercise?.exerciseId, sessions]);

  const currentCatalogExercise = useMemo(() => {
    if (!currentExercise) return null;
    return allExercises.find((e) => e.id === currentExercise.exerciseId) ?? null;
  }, [currentExercise?.exerciseId, allExercises]);

  const currentBiomechanics = useMemo(() => {
    if (!currentCatalogExercise) return null;
    return getExerciseBiomechanics(currentCatalogExercise);
  }, [currentCatalogExercise]);

  const fatigueAlert = useMemo(() => detectFatigueAndSpikes(sessions), [sessions]);

  const filteredPickerExercises = useMemo(() => {
    const q = exSearch.trim().toLowerCase();
    if (!q) return allExercises;
    return allExercises.filter(
      (ex) =>
        ex.nameEn.toLowerCase().includes(q) ||
        ex.nameAr.toLowerCase().includes(q) ||
        ex.primaryMuscles.some(
          (m) => MUSCLE_LABELS[m].en.toLowerCase().includes(q) || MUSCLE_LABELS[m].ar.includes(q)
        )
    );
  }, [allExercises, exSearch]);

  // Resolve active course schedule & today's workout
  const jsDay = new Date().getDay();
  const todayMondayIdx = jsDay === 0 ? 6 : jsDay - 1;

  const courseDaysWithWorkouts = useMemo(() => {
    if (!activeProgram) return [];
    return activeProgram.scheduledDays.map((day) => {
      const matchedWorkout =
        (day.workoutId ? workouts.find((w) => w.id === day.workoutId) : undefined) ||
        (day.workoutName
          ? workouts.find((w) => w.name.trim().toLowerCase() === day.workoutName?.trim().toLowerCase())
          : undefined);
      return { day, workout: matchedWorkout };
    });
  }, [activeProgram, workouts]);

  const defaultSelectedCourseDay = useMemo(() => {
    if (!courseDaysWithWorkouts.length) return null;
    if (previewDayIdx !== null) {
      return courseDaysWithWorkouts.find((item) => item.day.dayIndex === previewDayIdx) || null;
    }
    const todayMatch = courseDaysWithWorkouts.find(
      (item) => item.day.dayIndex === todayMondayIdx && !item.day.isRestDay && item.workout
    );
    if (todayMatch) return todayMatch;
    return (
      courseDaysWithWorkouts.find((item) => !item.day.isRestDay && item.workout) ||
      courseDaysWithWorkouts[todayMondayIdx] ||
      null
    );
  }, [courseDaysWithWorkouts, previewDayIdx, todayMondayIdx]);

  const updateCurrentExercise = (updater: (ex: LiveExerciseEntry) => LiveExerciseEntry) => {
    if (!activeSession || !currentExercise) return;
    const nextExercises = activeSession.exercises.map((ex, i) =>
      i === currentExIdx ? updater(ex) : ex
    );
    persistSessionUpdate({ ...activeSession, exercises: nextExercises });
  };

  const findNextIncompleteExerciseIdx = (exercises: LiveExerciseEntry[], afterIdx: number): number | null => {
    for (let i = afterIdx + 1; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!ex.skipped && ex.sets.some((s) => !s.completed)) return i;
    }
    for (let i = 0; i < afterIdx; i++) {
      const ex = exercises[i];
      if (!ex.skipped && ex.sets.some((s) => !s.completed)) return i;
    }
    return null;
  };

  const startInterExerciseRest = (nextIdx: number, presetDuration?: number) => {
    const dur = presetDuration ?? interRestTotal;
    setSetRestRunning(false);
    setPendingNextExIdx(nextIdx);
    setInterRestTotal(dur);
    setInterRestRemaining(dur);
    setInterRestRunning(true);
    setStage('rest');
  };

  const handleSkipInterRest = () => {
    setInterRestRunning(false);
    if (activeSession && pendingNextExIdx !== null) {
      persistSessionUpdate({
        ...activeSession,
        currentExerciseIndex: pendingNextExIdx,
      });
    }
    setPendingNextExIdx(null);
    setStage('exercise');
  };

  const handleOpenExercise = (idx: number) => {
    if (!activeSession) return;
    setInterRestRunning(false);
    setPendingNextExIdx(null);
    persistSessionUpdate({
      ...activeSession,
      currentExerciseIndex: idx,
    });
    setStage('exercise');
  };

  const handleSetFieldChange = (setIdx: number, field: 'weight' | 'reps', rawVal: string) => {
    const parsed = rawVal === '' ? null : Number(rawVal);
    updateCurrentExercise((ex) => ({
      ...ex,
      sets: ex.sets.map((s, i) => {
        if (i !== setIdx) return s;
        if (field === 'weight') {
          const displayNum = Math.max(0, parsed ?? 0);
          return { ...s, weightKg: toStorageKg(displayNum, unit) };
        }
        return { ...s, reps: Math.max(0, Math.round(parsed ?? 0)) };
      }),
    }));
  };

  const stepWeight = (setIdx: number, deltaDisplay: number) => {
    if (!currentExercise) return;
    const targetSet = currentExercise.sets[setIdx];
    if (!targetSet) return;
    const currentDisplay = toDisplayWeight(targetSet.weightKg, unit);
    const nextDisplay = Math.max(0, Math.round((currentDisplay + deltaDisplay) * 2) / 2);
    updateCurrentExercise((ex) => ({
      ...ex,
      sets: ex.sets.map((s, i) =>
        i === setIdx ? { ...s, weightKg: toStorageKg(nextDisplay, unit) } : s
      ),
    }));
  };

  const stepReps = (setIdx: number, deltaReps: number) => {
    if (!currentExercise) return;
    const targetSet = currentExercise.sets[setIdx];
    if (!targetSet) return;
    const nextReps = Math.max(0, (targetSet.reps || 0) + deltaReps);
    updateCurrentExercise((ex) => ({
      ...ex,
      sets: ex.sets.map((s, i) => (i === setIdx ? { ...s, reps: nextReps } : s)),
    }));
  };

  const handleCompleteCurrentSet = () => {
    if (!activeSession || !currentExercise) return;
    const activeSet = currentExercise.sets[selectedSetIdx];
    if (!activeSet) return;

    const updatedSets = currentExercise.sets.map((s, i) => {
      if (i === selectedSetIdx) {
        return { ...s, completed: true };
      }
      // Pre-fill next uncompleted set's weight if it's currently 0 so logging stays fast
      if (i === selectedSetIdx + 1 && !s.completed && s.weightKg === 0 && activeSet.weightKg > 0) {
        return { ...s, weightKg: activeSet.weightKg };
      }
      return s;
    });

    const nextExercises = activeSession.exercises.map((ex, i) =>
      i === currentExIdx ? { ...ex, sets: updatedSets } : ex
    );
    const nextSession: ActiveWorkoutSession = {
      ...activeSession,
      exercises: nextExercises,
    };
    persistSessionUpdate(nextSession);

    const nextPendingSetIdx = updatedSets.findIndex((s) => !s.completed);
    if (nextPendingSetIdx >= 0) {
      // More sets left inside this exercise: advance to next set and run subtle between-set timer
      setSelectedSetIdx(nextPendingSetIdx);
      const setRestSec = currentExercise.restSeconds || 90;
      if (setRestSec > 0) {
        setSetRestRemaining(setRestSec);
        setSetRestRunning(true);
      }
      return;
    }

    // All sets of this exercise are completed! Check for next exercise in course order.
    const nextExIdx = findNextIncompleteExerciseIdx(nextExercises, currentExIdx);
    if (nextExIdx !== null) {
      startInterExerciseRest(nextExIdx);
    } else {
      // Entire course workout completed!
      setSetRestRunning(false);
      setStage('list');
      setFinishModalOpen(true);
    }
  };

  const handleAddSet = () => {
    updateCurrentExercise((ex) => {
      const last = ex.sets[ex.sets.length - 1];
      const nextSets = [
        ...ex.sets,
        {
          setNumber: ex.sets.length + 1,
          targetRepsMin: last?.targetRepsMin ?? 8,
          targetRepsMax: last?.targetRepsMax ?? 12,
          weightKg: last ? last.weightKg : 0,
          reps: last ? last.reps : 10,
          rpe: null,
          rir: null,
          completed: false,
        },
      ];
      setSelectedSetIdx(nextSets.length - 1);
      return { ...ex, sets: nextSets };
    });
  };

  const handleRemoveSet = (setIdx: number) => {
    updateCurrentExercise((ex) => {
      if (ex.sets.length <= 1) return ex;
      const nextSets = ex.sets
        .filter((_, i) => i !== setIdx)
        .map((s, i) => ({ ...s, setNumber: i + 1 }));
      setSelectedSetIdx((prev) => Math.min(prev, nextSets.length - 1));
      return { ...ex, sets: nextSets };
    });
  };

  const handleSkipCurrentExercise = () => {
    if (!activeSession || !currentExercise) return;
    const nextSkipped = !currentExercise.skipped;
    const nextExercises = activeSession.exercises.map((ex, i) =>
      i === currentExIdx ? { ...ex, skipped: nextSkipped } : ex
    );
    persistSessionUpdate({ ...activeSession, exercises: nextExercises });
    if (nextSkipped) {
      const nextExIdx = findNextIncompleteExerciseIdx(nextExercises, currentExIdx);
      if (nextExIdx !== null) {
        persistSessionUpdate({
          ...activeSession,
          exercises: nextExercises,
          currentExerciseIndex: nextExIdx,
        });
      } else {
        setStage('list');
      }
    }
  };

  const handleAddExerciseMidSession = (ex: Exercise) => {
    if (!activeSession) return;
    const prev = getPreviousExercisePerformance(ex.id, sessions);
    const defaultSets = Array.from({ length: 3 }, (_, idx) => {
      const pSet = prev?.sets[idx] ?? prev?.sets[prev.sets.length - 1];
      return {
        setNumber: idx + 1,
        targetRepsMin: 8,
        targetRepsMax: 12,
        weightKg: pSet ? pSet.weightKg : 0,
        reps: pSet ? pSet.reps : 10,
        rpe: null,
        rir: null,
        completed: false,
      };
    });

    const newEntry: LiveExerciseEntry = {
      itemId: generateSafeId('lex'),
      exerciseId: ex.id,
      exerciseNameEn: ex.nameEn,
      exerciseNameAr: ex.nameAr,
      primaryMuscles: ex.primaryMuscles,
      secondaryMuscles: ex.secondaryMuscles,
      restSeconds: 90,
      notes: '',
      skipped: false,
      sets: defaultSets,
    };

    const nextExercises = [...activeSession.exercises, newEntry];
    persistSessionUpdate({
      ...activeSession,
      exercises: nextExercises,
      currentExerciseIndex: nextExercises.length - 1,
    });
    setAddExerciseOpen(false);
    setExSearch('');
    setStage('exercise');
  };

  const handleFinishSession = async () => {
    if (!firebaseUser || !activeSession || !profile) return;
    setFinishing(true);
    try {
      const durationSec = Math.max(
        60,
        Math.floor(
          (Date.now() - activeSession.startedAtMs - (activeSession.accumulatedPauseMs || 0)) / 1000
        )
      );
      const prevSimilar = sessions.find(
        (s) =>
          (activeSession.workoutId && s.workoutId === activeSession.workoutId) ||
          s.workoutName === activeSession.workoutName
      );
      const result = await completeWorkoutSession(
        firebaseUser.uid,
        activeSession,
        durationSec,
        personalRecords,
        profile.notificationSettings,
        activeProgram,
        { sessionRpe, coachId: profile.coachId, goals }
      );
      setFinishModalOpen(false);
      setInterRestRunning(false);
      setSetRestRunning(false);
      setActiveSessionLocal(null);
      setCompletedSummary({
        savedSession: result.savedSession,
        unlockedPRs: result.unlockedPRs,
      });
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setFinishing(false);
    }
  };

  const handleDiscardSession = async () => {
    if (!firebaseUser) return;
    setDiscardConfirmOpen(false);
    setInterRestRunning(false);
    setSetRestRunning(false);
    await discardActiveSession(firebaseUser.uid);
    setActiveSessionLocal(null);
  };

  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;
  const PrevChevron = language === 'ar' ? ChevronRight : ChevronLeft;
  const NextChevron = language === 'ar' ? ChevronLeft : ChevronRight;
  const unitText = unit === 'lb' ? t.common.lb : t.common.kg;

  // =========================================================================
  // 1. POST-WORKOUT SUMMARY
  // =========================================================================
  if (completedSummary) {
    const { savedSession, unlockedPRs } = completedSummary;
    const completedExercisesCount = savedSession.exercises.filter((e) => !e.skipped).length;
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className="bg-white dark:bg-[#121417] border border-emerald-500/40 rounded-2xl p-6 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">{savedSession.workoutName}</h1>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              {t.common.savedSuccess}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-start font-mono tabular-nums">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-sans text-neutral-500 block">{t.common.duration}</span>
              <strong className="text-sm">{formatDuration(savedSession.durationSeconds)}</strong>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-sans text-neutral-500 block">{t.common.sets}</span>
              <strong className="text-sm">{savedSession.totalSets}</strong>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-sans text-neutral-500 block">{t.workouts.exercisesInWorkout}</span>
              <strong className="text-sm">{completedExercisesCount}</strong>
            </div>
          </div>

          {unlockedPRs.length > 0 && (
            <div className="space-y-2 text-start">
              <p className="text-xs font-semibold text-emerald-500">{t.live.prUnlocked}</p>
              {unlockedPRs.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 text-sm"
                >
                  <span className="font-medium">
                    {language === 'ar' ? item.exerciseNameAr : item.exerciseNameEn}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {item.types
                      .map((tp) =>
                        tp === 'weight'
                          ? language === 'ar'
                            ? 'أعلى وزن'
                            : 'Max Weight'
                          : tp === 'reps'
                            ? language === 'ar'
                              ? 'أعلى عدات'
                              : 'Best Reps'
                            : language === 'ar'
                              ? 'أعلى 1RM'
                              : 'Est. 1RM'
                      )
                      .join(language === 'ar' ? '، ' : ', ')}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCompletedSummary(null);
                setActiveSection('history');
              }}
              className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
            >
              {t.nav.history}
            </button>
            <button
              onClick={() => {
                setCompletedSummary(null);
                setActiveSection('dashboard');
              }}
              className="flex-1 min-h-[44px] rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium cursor-pointer"
            >
              {t.nav.dashboard}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PRE-WORKOUT COURSE SELECTOR (!activeSession)
  // =========================================================================
  if (!activeSession) {
    const selectedDay = defaultSelectedCourseDay?.day;
    const selectedWorkout = defaultSelectedCourseDay?.workout;
    const selectedDayMeta = selectedDay ? WEEKDAYS.find((w) => w.index === selectedDay.dayIndex) : null;
    const isTodaySelected = selectedDay?.dayIndex === todayMondayIdx;

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Active Course Section */}
        {activeProgram ? (
          <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {activeProgram.name} · {tLabel(SPLIT_LABELS[activeProgram.splitType], language)}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {selectedWorkout
                    ? selectedWorkout.name
                    : selectedDay?.isRestDay
                      ? t.dashboard.restDayTitle
                      : t.live.noActiveTitle}
                </h1>
                {selectedDayMeta && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isTodaySelected
                      ? language === 'ar'
                        ? `حصّة اليوم (${selectedDayMeta.ar})`
                        : `Today (${selectedDayMeta.en})`
                      : language === 'ar'
                        ? `يوم ${selectedDayMeta.ar}`
                        : selectedDayMeta.en}
                    {selectedWorkout
                      ? ` · ${selectedWorkout.exercises.length} ${t.workouts.exercisesInWorkout}`
                      : ''}
                  </p>
                )}
              </div>

              {selectedWorkout && (
                <button
                  type="button"
                  onClick={() => startWorkoutFromTemplate(selectedWorkout, activeProgram)}
                  className="min-h-[48px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-colors"
                >
                  <Dumbbell className="w-4 h-4" />
                  <span>{language === 'ar' ? 'ابدأ التمرين بالترتيب' : 'Start Course Workout'}</span>
                </button>
              )}
            </div>

            {/* Course Day Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {courseDaysWithWorkouts.map(({ day, workout }) => {
                const wd = WEEKDAYS.find((w) => w.index === day.dayIndex);
                const isSelected = selectedDay?.dayIndex === day.dayIndex;
                const isToday = day.dayIndex === todayMondayIdx;
                return (
                  <button
                    key={day.dayIndex}
                    type="button"
                    onClick={() => setPreviewDayIdx(day.dayIndex)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-start transition-colors shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <p
                      className={`text-[11px] font-medium ${
                        isSelected ? 'text-emerald-100' : 'text-neutral-500'
                      }`}
                    >
                      {language === 'ar' ? wd?.ar : wd?.en}
                      {isToday ? (language === 'ar' ? ' · اليوم' : ' · Today') : ''}
                    </p>
                    <p className="text-xs font-semibold truncate max-w-[140px]">
                      {day.isRestDay
                        ? t.programs.restDay
                        : workout?.name || day.workoutName || (language === 'ar' ? 'تمرين' : 'Workout')}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Ordered Course Exercises Preview */}
            {selectedWorkout ? (
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-3">
                  {language === 'ar'
                    ? 'ترتيب التمارين المكتوبة في الكورس (من الأول للأخير):'
                    : 'Exercises in exact course order:'}
                </p>
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800/80 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/50 dark:bg-[#090A0B]">
                  {selectedWorkout.exercises.map((item, idx) => (
                    <div
                      key={item.itemId}
                      className="px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0 w-6">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm font-medium truncate">
                          {language === 'ar' ? item.exerciseNameAr : item.exerciseNameEn}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-500 font-mono tabular-nums whitespace-nowrap shrink-0">
                        {getSetsCountLabel(item.sets, language)} ·{' '}
                        {item.targetRepsMin === item.targetRepsMax
                          ? language === 'ar'
                            ? `${item.targetRepsMin} عدة`
                            : `${item.targetRepsMin} reps`
                          : language === 'ar'
                            ? `${item.targetRepsMin}–${item.targetRepsMax} عدة`
                            : `${item.targetRepsMin}–${item.targetRepsMax} reps`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                {language === 'ar'
                  ? 'هذا اليوم يوم راحة في الكورس. يمكنك اختيار أي يوم تدريبي آخر من الأعلى أو بدء جدول آخر أدناه.'
                  : 'This day is marked as Rest in your course. Pick another training day above or choose a saved workout below.'}
              </div>
            )}
          </section>
        ) : (
          <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {language === 'ar' ? 'اختر الكورس التدريبي أولاً' : 'Choose Your Training Course'}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
                {language === 'ar'
                  ? 'عند تفعيل كورس من البرامج التدريبية ستظهر تمارين كل يوم بالترتيب هنا تلقائياً، أو يمكنك البدء من جداولك أدناه.'
                  : 'Activate a program to load each day’s exercises automatically in order, or pick a saved workout below.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setActiveSection('programs')}
                className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
              >
                {t.nav.programs}
              </button>
              <button
                type="button"
                onClick={startBlankWorkout}
                className="min-h-[44px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium cursor-pointer"
              >
                {t.live.startBlank}
              </button>
            </div>
          </section>
        )}

        {/* Saved Workout Templates & Quick Free Workout */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {t.live.startFromTemplate}
            </h2>
            {activeProgram && (
              <button
                type="button"
                onClick={startBlankWorkout}
                className="min-h-[40px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium cursor-pointer"
              >
                {t.live.startBlank}
              </button>
            )}
          </div>

          {workouts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {workouts.map((w: WorkoutTemplate) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => startWorkoutFromTemplate(w, activeProgram)}
                  className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 rounded-2xl p-4 text-start space-y-1.5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm truncate">{w.name}</h3>
                    <NextChevron className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs text-neutral-500 font-mono tabular-nums">
                    {w.exercises.length} {t.workouts.exercisesInWorkout}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
              {t.workouts.noWorkouts}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. ACTIVE WORKOUT COMPUTED DATA
  // =========================================================================
  const completedSetsTotal = activeSession.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSetsPlanned = activeSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedExercisesCount = activeSession.exercises.filter(
    (ex) => !ex.skipped && ex.sets.length > 0 && ex.sets.every((s) => s.completed)
  ).length;

  const firstUnfinishedIdx = activeSession.exercises.findIndex(
    (ex) => !ex.skipped && ex.sets.some((s) => !s.completed)
  );
  const nextRecommendedIdx = firstUnfinishedIdx >= 0 ? firstUnfinishedIdx : currentExIdx;
  const allCourseExercisesFinished =
    activeSession.exercises.length > 0 &&
    activeSession.exercises.every((ex) => ex.skipped || ex.sets.every((s) => s.completed));

  const nextRestExercise =
    pendingNextExIdx !== null ? activeSession.exercises[pendingNextExIdx] ?? null : null;

  const activeSet = currentExercise?.sets[selectedSetIdx] ?? null;
  const remainingUnfinishedSetsInCurrent = currentExercise
    ? currentExercise.sets.filter((s, idx) => idx !== selectedSetIdx && !s.completed).length
    : 0;
  const isFinalSetOfCurrentExercise = remainingUnfinishedSetsInCurrent === 0;
  const nextExerciseAfterCurrent = findNextIncompleteExerciseIdx(activeSession.exercises, currentExIdx);

  // =========================================================================
  // 4. INTER-EXERCISE REST COUNTDOWN SCREEN (3–4 MINUTES)
  // =========================================================================
  const restProgressPct =
    interRestTotal > 0 ? Math.max(0, Math.min(100, (interRestRemaining / interRestTotal) * 100)) : 0;
  const ringRadius = 68;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - restProgressPct / 100);

  const renderCourseListPanel = (isDesktopSidebar: boolean) => (
    <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold">
            {language === 'ar' ? 'تمارين الكورس بالترتيب' : 'Course Exercise Order'}
          </h2>
          <p className="text-[11px] text-neutral-500 font-mono tabular-nums">
            {completedExercisesCount} / {activeSession.exercises.length}{' '}
            {language === 'ar' ? 'مكتمل' : 'done'}
          </p>
        </div>
        {!isDesktopSidebar && !allCourseExercisesFinished && activeSession.exercises[nextRecommendedIdx] && (
          <button
            type="button"
            onClick={() => handleOpenExercise(nextRecommendedIdx)}
            className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
          >
            {completedSetsTotal === 0
              ? language === 'ar'
                ? 'ابدأ التمرين الأول'
                : 'Start #1'
              : language === 'ar'
                ? 'متابعة التالي'
                : 'Continue Next'}
          </button>
        )}
      </div>

      {activeSession.exercises.length === 0 ? (
        <div className="p-6 text-center space-y-3">
          <p className="text-xs text-neutral-500">{t.workouts.pickExercise}</p>
          <button
            type="button"
            onClick={() => setAddExerciseOpen(true)}
            className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.live.addExerciseMidSession}
          </button>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
          {activeSession.exercises.map((ex, idx) => {
            const doneCount = ex.sets.filter((s) => s.completed).length;
            const totalCount = ex.sets.length;
            const isComplete = totalCount > 0 && doneCount === totalCount;
            const isSelected = idx === currentExIdx && (isDesktopSidebar ? stage !== 'rest' : stage === 'exercise');
            return (
              <button
                key={ex.itemId}
                type="button"
                onClick={() => handleOpenExercise(idx)}
                className={`w-full min-h-[60px] px-4 py-3 text-start flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 tabular-nums ${
                      isComplete
                        ? 'bg-emerald-600 text-white'
                        : isSelected
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                          : 'bg-neutral-100 dark:bg-[#090A0B] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {isComplete ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        ex.skipped ? 'line-through text-neutral-400' : ''
                      }`}
                    >
                      {language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums mt-0.5">
                      {getSetsCountLabel(totalCount, language)} · {getRepRangeLabel(ex, language)}
                      {doneCount > 0 && !isComplete
                        ? ` · ${doneCount}/${totalCount}`
                        : ex.skipped
                          ? ` · ${t.live.skipExercise}`
                          : ''}
                    </p>
                  </div>
                </div>
                <NextChevron
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-emerald-500' : 'text-neutral-400'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setAddExerciseOpen(true)}
          className="min-h-[40px] px-3 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.live.addExerciseMidSession}
        </button>

        <button
          type="button"
          onClick={() => setDiscardConfirmOpen(true)}
          className="min-h-[40px] px-3 rounded-xl text-xs text-neutral-500 hover:text-red-500 cursor-pointer"
        >
          {t.live.discardSession}
        </button>
      </div>
    </section>
  );

  const renderRestCountdownStage = () => (
    <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 text-center space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {language === 'ar' ? 'استراحة بين التمارين' : 'Rest Before Next Exercise'}
        </p>
        <h2 className="text-lg font-bold">
          {language === 'ar'
            ? 'أتممت التمرين بنجاح — استرح قبل الانتقال للتالي'
            : 'Exercise complete — recover before the next movement'}
        </h2>
      </div>

      {/* Circular Countdown Display */}
      <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={ringRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-neutral-200 dark:text-neutral-800"
          />
          <circle
            cx="80"
            cy="80"
            r={ringRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringOffset}
            className="text-emerald-500 transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-bold tabular-nums tracking-tight">
            {formatDuration(interRestRemaining)}
          </span>
          <span className="text-[11px] text-neutral-500 mt-1">
            {language === 'ar' ? 'تنازلي' : 'countdown'}
          </span>
        </div>
      </div>

      {/* 3:00 / 3:30 / 4:00 Presets + +/-30s */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setInterRestRemaining((prev) => Math.max(15, prev - 30))}
          className="min-h-[40px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-mono tabular-nums cursor-pointer"
        >
          {language === 'ar' ? '-30 ث' : '-30s'}
        </button>

        {INTER_EXERCISE_REST_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setInterRestTotal(preset);
              setInterRestRemaining(preset);
              setInterRestRunning(true);
            }}
            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-mono font-semibold tabular-nums border cursor-pointer ${
              interRestTotal === preset
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800'
            }`}
          >
            {formatDuration(preset)}
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            setInterRestTotal((prev) => Math.max(prev, interRestRemaining + 30));
            setInterRestRemaining((prev) => Math.min(600, prev + 30));
          }}
          className="min-h-[40px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-mono tabular-nums cursor-pointer"
        >
          {language === 'ar' ? '+30 ث' : '+30s'}
        </button>
      </div>

      {/* Next Up Preview */}
      {nextRestExercise && pendingNextExIdx !== null && (
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-start space-y-1">
          <p className="text-[11px] font-medium text-neutral-500">
            {language === 'ar'
              ? `التمرين التالي (${pendingNextExIdx + 1} من ${activeSession.exercises.length}):`
              : `Up Next (${pendingNextExIdx + 1} of ${activeSession.exercises.length}):`}
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold truncate">
              {language === 'ar' ? nextRestExercise.exerciseNameAr : nextRestExercise.exerciseNameEn}
            </p>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
              {getSetsCountLabel(nextRestExercise.sets.length, language)} ·{' '}
              {getRepRangeLabel(nextRestExercise, language)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleSkipInterRest}
          className="flex-1 min-h-[48px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
        >
          {language === 'ar' ? 'ابدأ التمرين التالي الآن' : 'Start Next Exercise Now'}
        </button>
        <button
          type="button"
          onClick={() => setStage('list')}
          className="min-h-[48px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium cursor-pointer"
        >
          {language === 'ar' ? 'عرض القائمة' : 'View List'}
        </button>
      </div>
    </section>
  );

  const renderActiveExerciseStage = () => {
    if (!currentExercise) {
      return (
        <div className="bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-neutral-500">{t.workouts.pickExercise}</p>
          <button
            type="button"
            onClick={() => setAddExerciseOpen(true)}
            className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.live.addExerciseMidSession}
          </button>
        </div>
      );
    }

    const doneInEx = currentExercise.sets.filter((s) => s.completed).length;
    const prevSetRef = previousExerciseData?.sets[selectedSetIdx];

    return (
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-5">
        {/* Exercise Title & Target Summary */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {language === 'ar'
                ? `تمرين ${currentExIdx + 1} من ${activeSession.exercises.length}`
                : `Exercise ${currentExIdx + 1} of ${activeSession.exercises.length}`}
              {' · '}
              <span className="font-sans">
                {currentExercise.primaryMuscles
                  .map((m) => tLabel(MUSCLE_LABELS[m], language))
                  .join(language === 'ar' ? '، ' : ', ')}
              </span>
            </p>
            <h2 className="text-lg sm:text-xl font-bold leading-snug">
              {language === 'ar' ? currentExercise.exerciseNameAr : currentExercise.exerciseNameEn}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
              {getSetsCountLabel(currentExercise.sets.length, language)} ·{' '}
              {getRepRangeLabel(currentExercise, language)} · {doneInEx}/{currentExercise.sets.length}{' '}
              {language === 'ar' ? 'منجز' : 'done'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="min-h-[40px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              {t.live.formGuide}
            </button>
            <button
              type="button"
              onClick={handleSkipCurrentExercise}
              className={`min-h-[40px] px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer ${
                currentExercise.skipped
                  ? 'border-amber-500/40 text-amber-500 bg-amber-500/10'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
              }`}
            >
              <SkipForward className="w-3.5 h-3.5" />
              {currentExercise.skipped ? t.live.unskipExercise : t.live.skipExercise}
            </button>
          </div>
        </div>

        {/* Non-blocking subtle between-set rest indicator */}
        {setRestRunning && setRestRemaining > 0 && (
          <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
              <Clock className="w-3.5 h-3.5" />
              {language === 'ar' ? 'استراحة بين السيتات:' : 'Set rest:'}{' '}
              <strong className="font-mono tabular-nums text-sm">
                {formatDuration(setRestRemaining)}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setSetRestRunning(false)}
              className="text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:underline cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Active Set Focused Step-by-Step Logger */}
        {activeSet && (
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold font-mono tabular-nums">
                  {language === 'ar'
                    ? `السيت ${activeSet.setNumber} من ${currentExercise.sets.length}`
                    : `Set ${activeSet.setNumber} of ${currentExercise.sets.length}`}
                </h3>
                <p className="text-xs text-neutral-500 font-mono tabular-nums">
                  {language === 'ar' ? 'المطلوب:' : 'Target:'}{' '}
                  {getRepRangeLabel(currentExercise, language)}
                  {prevSetRef
                    ? ` · ${language === 'ar' ? 'السابق:' : 'Last:'} ${formatWeight(prevSetRef.weightKg, unit)} ${unitText} × ${prevSetRef.reps}`
                    : ''}
                </p>
              </div>
              {activeSet.completed && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'ar' ? 'مسجّل (تعديل)' : 'Logged (editing)'}
                </span>
              )}
            </div>

            {/* Weight & Reps Large Ergonomic Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Weight */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  {t.live.weight} ({unitText})
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepWeight(selectedSetIdx, unit === 'lb' ? -5 : -2.5)}
                    className="min-h-[48px] min-w-[48px] rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 flex items-center justify-center cursor-pointer"
                    aria-label={language === 'ar' ? 'إنقاص الوزن' : 'Decrease weight'}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={activeSet.weightKg > 0 ? toDisplayWeight(activeSet.weightKg, unit) : ''}
                    placeholder={prevSetRef ? formatWeight(prevSetRef.weightKg, unit) : '0'}
                    onChange={(e) => handleSetFieldChange(selectedSetIdx, 'weight', e.target.value)}
                    className="flex-1 min-w-0 min-h-[48px] px-2 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 font-mono text-xl font-bold tabular-nums text-center focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => stepWeight(selectedSetIdx, unit === 'lb' ? 5 : 2.5)}
                    className="min-h-[48px] min-w-[48px] rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 flex items-center justify-center cursor-pointer"
                    aria-label={language === 'ar' ? 'زيادة الوزن' : 'Increase weight'}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reps */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  {language === 'ar' ? 'العدات اللي أخذتها' : 'Reps Completed'}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepReps(selectedSetIdx, -1)}
                    className="min-h-[48px] min-w-[48px] rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 flex items-center justify-center cursor-pointer"
                    aria-label={language === 'ar' ? 'إنقاص عدة' : 'Decrease reps'}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={activeSet.reps > 0 ? activeSet.reps : ''}
                    placeholder={prevSetRef ? String(prevSetRef.reps) : '10'}
                    onChange={(e) => handleSetFieldChange(selectedSetIdx, 'reps', e.target.value)}
                    className="flex-1 min-w-0 min-h-[48px] px-2 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 font-mono text-xl font-bold tabular-nums text-center focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => stepReps(selectedSetIdx, 1)}
                    className="min-h-[48px] min-w-[48px] rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 flex items-center justify-center cursor-pointer"
                    aria-label={language === 'ar' ? 'زيادة عدة' : 'Increase reps'}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Step Action */}
            <button
              type="button"
              onClick={handleCompleteCurrentSet}
              className="w-full min-h-[50px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {!isFinalSetOfCurrentExercise
                  ? language === 'ar'
                    ? `تسجيل السيت ${activeSet.setNumber} والانتقال للسيت التالي`
                    : `Log Set ${activeSet.setNumber} & Next Set`
                  : nextExerciseAfterCurrent !== null
                    ? language === 'ar'
                      ? 'إنهاء السيت الأخير وبدء الاستراحة (3–4 د)'
                      : 'Finish Exercise & Start Rest (3–4 min)'
                    : language === 'ar'
                      ? 'إتمام السيت الأخير وإنهاء التمرين'
                      : 'Complete Final Set & Finish Workout'}
              </span>
            </button>
          </div>
        )}

        {/* All Sets Clean List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {language === 'ar' ? 'السيتات' : 'Sets'}
            </p>
            <button
              type="button"
              onClick={handleAddSet}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.live.addSet}
            </button>
          </div>

          <div className="divide-y divide-neutral-200 dark:divide-neutral-800/80 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            {currentExercise.sets.map((s, idx) => {
              const isCurrent = idx === selectedSetIdx;
              return (
                <div
                  key={s.setNumber}
                  onClick={() => setSelectedSetIdx(idx)}
                  className={`px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-emerald-500/8'
                      : 'bg-white dark:bg-[#121417] hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 tabular-nums ${
                        s.completed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-neutral-100 dark:bg-[#090A0B] text-neutral-500'
                      }`}
                    >
                      {s.completed ? <Check className="w-3.5 h-3.5" /> : s.setNumber}
                    </span>
                    <span className="text-xs font-medium">
                      {language === 'ar' ? `سيت ${s.setNumber}` : `Set ${s.setNumber}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono tabular-nums text-neutral-600 dark:text-neutral-300">
                      {s.completed
                        ? `${formatWeight(s.weightKg, unit)} ${unitText} × ${s.reps}`
                        : isCurrent
                          ? language === 'ar'
                            ? 'الحالي'
                            : 'Current'
                          : `${getRepRangeLabel(currentExercise, language)}`}
                    </span>

                    {currentExercise.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSet(idx);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 cursor-pointer"
                        aria-label={t.live.removeSet}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Prev / Next Exercise Navigation */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            disabled={currentExIdx === 0}
            onClick={() => handleOpenExercise(Math.max(0, currentExIdx - 1))}
            className="min-h-[42px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-35 cursor-pointer"
          >
            <PrevChevron className="w-4 h-4" />
            {t.live.prevExercise}
          </button>

          {nextExerciseAfterCurrent !== null ? (
            <button
              type="button"
              onClick={() => startInterExerciseRest(nextExerciseAfterCurrent)}
              className="min-h-[42px] px-4 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              {language === 'ar' ? 'استراحة والتالي' : 'Rest & Next'}
              <NextChevron className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFinishModalOpen(true)}
              className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
            >
              {t.live.finishWorkout}
            </button>
          )}
        </div>
      </section>
    );
  };

  // =========================================================================
  // 5. MAIN ACTIVE WORKOUT LAYOUT
  // =========================================================================
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {fatigueAlert?.hasWarning && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-amber-600 dark:text-amber-400">
              {language === 'ar' ? fatigueAlert.titleAr : fatigueAlert.titleEn}
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {language === 'ar' ? fatigueAlert.messageAr : fatigueAlert.messageEn}
            </p>
          </div>
        </div>
      )}

      {/* Clean Minimal Session Header (No useless elapsed stopwatch) */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:px-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {stage !== 'list' && (
            <button
              type="button"
              onClick={() => setStage('list')}
              className="lg:hidden min-h-[40px] min-w-[40px] rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0 cursor-pointer"
              aria-label={language === 'ar' ? 'قائمة التمارين' : 'Exercise list'}
            >
              <BackArrow className="w-4 h-4" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold truncate">{activeSession.workoutName}</h1>
            <p
              className={`text-xs truncate ${
                isOnline ? 'text-neutral-500 dark:text-neutral-400' : 'text-amber-500 font-medium'
              }`}
            >
              {activeSession.programName ? `${activeSession.programName} · ` : ''}
              <span className="font-mono tabular-nums">
                {completedSetsTotal}/{totalSetsPlanned} {t.common.sets}
              </span>
              {!isOnline ? ` · ${t.live.offlineSaved}` : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setFinishModalOpen(true)}
          className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
        >
          {t.live.finishWorkout}
        </button>
      </section>

      {/* Mobile Stage View */}
      <div className="lg:hidden">
        {stage === 'list' && (
          <div className="space-y-4">
            {allCourseExercisesFinished && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {language === 'ar'
                    ? 'أتممت جميع تمارين الكورس لهذا اليوم!'
                    : 'All course exercises completed!'}
                </p>
                <button
                  type="button"
                  onClick={() => setFinishModalOpen(true)}
                  className="min-h-[40px] px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold shrink-0 cursor-pointer"
                >
                  {t.live.finishWorkout}
                </button>
              </div>
            )}
            {renderCourseListPanel(false)}
          </div>
        )}
        {stage === 'exercise' && renderActiveExerciseStage()}
        {stage === 'rest' && renderRestCountdownStage()}
      </div>

      {/* Desktop 2-Column Layout: Ordered Course List + Active Stage */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4">{renderCourseListPanel(true)}</div>
        <div className="lg:col-span-8">
          {stage === 'rest' ? renderRestCountdownStage() : renderActiveExerciseStage()}
        </div>
      </div>

      {/* Add Exercise Modal */}
      {addExerciseOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={exSearch}
                onChange={(e) => setExSearch(e.target.value)}
                placeholder={t.common.searchPlaceholder}
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAddExerciseOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredPickerExercises.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleAddExerciseMidSession(ex)}
                  className="w-full px-3.5 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-start flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {language === 'ar' ? ex.nameAr : ex.nameEn}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {ex.primaryMuscles
                        .map((m) => tLabel(MUSCLE_LABELS[m], language))
                        .join(language === 'ar' ? '، ' : ', ')}{' '}
                      · {tLabel(EQUIPMENT_LABELS[ex.equipment], language)}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Exercise Form Guide Modal */}
      {guideOpen && currentExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold truncate">
                  {language === 'ar' ? currentExercise.exerciseNameAr : currentExercise.exerciseNameEn}
                </h3>
                <p className="text-xs text-neutral-500 truncate">
                  {currentExercise.primaryMuscles
                    .map((m) => tLabel(MUSCLE_LABELS[m], language))
                    .join(language === 'ar' ? '، ' : ', ')}
                  {currentCatalogExercise
                    ? ` · ${tLabel(EQUIPMENT_LABELS[currentCatalogExercise.equipment], language)}`
                    : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              <div className="inline-flex rounded-xl p-1 bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setGuideMode('video')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                    guideMode === 'video'
                      ? 'bg-white dark:bg-[#1A1D22] text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  {t.apex.view3d}
                </button>
                <button
                  type="button"
                  onClick={() => setGuideMode('2d')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                    guideMode === '2d'
                      ? 'bg-white dark:bg-[#1A1D22] text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  {t.apex.view2d}
                </button>
              </div>

              {guideMode === 'video' && currentCatalogExercise && currentBiomechanics ? (
                <ExerciseVideoViewer
                  exercise={currentCatalogExercise}
                  movementPattern={currentBiomechanics.movementPattern}
                  stabilizerMuscles={currentBiomechanics.stabilizerMuscles}
                  language={language}
                  activeMuscle={guideMuscle}
                  onSelectMuscle={setGuideMuscle}
                  compact
                />
              ) : (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
                  <MuscleDiagram
                    primaryMuscles={currentExercise.primaryMuscles}
                    secondaryMuscles={currentExercise.secondaryMuscles}
                    stabilizerMuscles={currentBiomechanics?.stabilizerMuscles ?? []}
                    movementPattern={currentBiomechanics?.movementPattern}
                    language={language}
                    activeMuscle={guideMuscle}
                    onHoverMuscle={setGuideMuscle}
                    compact
                  />
                </div>
              )}

              {currentCatalogExercise && (
                <div className="space-y-4 text-sm">
                  {(language === 'ar'
                    ? currentCatalogExercise.startingPositionAr
                    : currentCatalogExercise.startingPositionEn) && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {t.exercises.startingPosition}
                      </h4>
                      <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                        {language === 'ar'
                          ? currentCatalogExercise.startingPositionAr
                          : currentCatalogExercise.startingPositionEn}
                      </p>
                    </div>
                  )}

                  {(language === 'ar'
                    ? currentCatalogExercise.instructionsAr
                    : currentCatalogExercise.instructionsEn
                  ).length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {t.exercises.executionSteps}
                      </h4>
                      <ol className="space-y-1.5 list-decimal list-inside text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {(language === 'ar'
                          ? currentCatalogExercise.instructionsAr
                          : currentCatalogExercise.instructionsEn
                        ).map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Discard Workout Confirmation Modal */}
      {discardConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold">
              {language === 'ar' ? 'إلغاء التمرين الحالي؟' : 'Cancel current workout?'}
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {language === 'ar'
                ? 'سيتم مسح التقدم غير المحفوظ لهذا التمرين دون إضافته للسجل.'
                : 'Unsaved sets in this active workout will be discarded.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDiscardConfirmOpen(false)}
                className="min-h-[40px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDiscardSession}
                className="min-h-[40px] px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
              >
                {t.live.discardSession}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Workout Confirmation Modal */}
      {finishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold">{t.live.confirmFinishTitle}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t.live.confirmFinishDesc}
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {t.apex.sessionRpeLabel}
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {[5, 6, 7, 8, 9, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSessionRpe(val)}
                    className={`min-h-[40px] rounded-xl font-mono text-xs font-bold border cursor-pointer ${
                      sessionRpe === val
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFinishModalOpen(false)}
                disabled={finishing}
                className="min-h-[42px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleFinishSession}
                disabled={finishing}
                className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
              >
                {finishing ? t.common.loading : t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
