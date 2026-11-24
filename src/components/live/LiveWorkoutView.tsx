import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Trash2,
  Trophy,
  X,
  Search,
} from 'lucide-react';
import { ExerciseVideoViewer } from '../exercises/ExerciseVideoViewer';
import { MuscleDiagram } from '../common/MuscleDiagram';
import { useApp } from '../../context/AppContext';
import { EQUIPMENT_LABELS, MUSCLE_LABELS, tLabel } from '../../i18n/translations';
import {
  completeWorkoutSession,
  discardActiveSession,
  generateSafeId,
  updateActiveSessionState,
} from '../../services/firestoreService';
import { ActiveWorkoutSession, Exercise, LiveExerciseEntry, MuscleGroup, WorkoutSessionHistory } from '../../types/ironlog';
import {
  detectFatigueAndSpikes,
  formatDuration,
  formatVolume,
  formatWeight,
  getPreviousExercisePerformance,
  toDisplayWeight,
  toStorageKg,
} from '../../utils/calculations';
import { getExerciseBiomechanics } from '../../utils/exerciseBiomechanics';

function playRestChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Ignore audio context block
  }
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

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restRemaining, setRestRemaining] = useState<number>(0);
  const [restDuration, setRestDuration] = useState<number>(90);
  const [restRunning, setRestRunning] = useState(false);
  const [restJustFinished, setRestJustFinished] = useState(false);

  const [effortMode, setEffortMode] = useState<'rpe' | 'rir'>('rpe');
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideMode, setGuideMode] = useState<'video' | '2d'>('video');
  const [guideMuscle, setGuideMuscle] = useState<MuscleGroup | null>(null);
  const [rpeGuideOpen, setRpeGuideOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [exSearch, setExSearch] = useState('');
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [sessionRpe, setSessionRpe] = useState<number>(7);
  const [finishing, setFinishing] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<{
    savedSession: WorkoutSessionHistory;
    prevVolumeKg: number | null;
    unlockedPRs: { exerciseNameEn: string; exerciseNameAr: string; types: ('weight' | 'reps' | 'estimated_1rm')[] }[];
  } | null>(null);

  const syncTimeoutRef = useRef<number | null>(null);

  // Sync locally protected active session back to Firestore when connection returns
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (firebaseUser && activeSession) {
        updateActiveSessionState(firebaseUser.uid, activeSession).catch(() => {
          // Will retry on next edit
        });
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

  // Elapsed timer loop
  useEffect(() => {
    if (!activeSession) return;
    const tick = () => {
      const now = Date.now();
      const pausedDelta =
        activeSession.isPaused && activeSession.pausedAtMs ? now - activeSession.pausedAtMs : 0;
      const elapsedMs = Math.max(
        0,
        now - activeSession.startedAtMs - (activeSession.accumulatedPauseMs || 0) - pausedDelta
      );
      setElapsedSeconds(Math.floor(elapsedMs / 1000));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [activeSession]);

  // Rest timer loop
  useEffect(() => {
    if (!restRunning) return;
    const id = window.setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          setRestRunning(false);
          setRestJustFinished(true);
          playRestChime();
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
              navigator.vibrate([120, 60, 120]);
            } catch {
              // ignore unsupported vibrate
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [restRunning]);

  const currentExIdx = activeSession
    ? Math.min(Math.max(0, activeSession.currentExerciseIndex), Math.max(0, activeSession.exercises.length - 1))
    : 0;
  const currentExercise = activeSession?.exercises[currentExIdx] ?? null;

  useEffect(() => {
    if (currentExercise && !restRunning) {
      setRestDuration(currentExercise.restSeconds || 90);
    }
  }, [currentExercise?.itemId, currentExercise?.restSeconds, restRunning]);

  const persistSessionUpdate = (next: ActiveWorkoutSession) => {
    setActiveSessionLocal(next);
    if (!firebaseUser) return;
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = window.setTimeout(() => {
      updateActiveSessionState(firebaseUser.uid, next).catch(() => {
        // Local persistence still preserves session if momentarily offline
      });
    }, 350);
  };

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
        ex.primaryMuscles.some((m) => MUSCLE_LABELS[m].en.toLowerCase().includes(q) || MUSCLE_LABELS[m].ar.includes(q))
    );
  }, [allExercises, exSearch]);

  const updateCurrentExercise = (updater: (ex: LiveExerciseEntry) => LiveExerciseEntry) => {
    if (!activeSession || !currentExercise) return;
    const nextExercises = activeSession.exercises.map((ex, i) =>
      i === currentExIdx ? updater(ex) : ex
    );
    persistSessionUpdate({ ...activeSession, exercises: nextExercises });
  };

  const handleSetFieldChange = (
    setIdx: number,
    field: 'weight' | 'reps' | 'rpe' | 'rir',
    rawVal: string
  ) => {
    const parsed = rawVal === '' ? null : Number(rawVal);
    updateCurrentExercise((ex) => ({
      ...ex,
      sets: ex.sets.map((s, i) => {
        if (i !== setIdx) return s;
        if (field === 'weight') {
          const displayNum = Math.max(0, parsed ?? 0);
          return { ...s, weightKg: toStorageKg(displayNum, unit) };
        }
        if (field === 'reps') {
          return { ...s, reps: Math.max(0, Math.round(parsed ?? 0)) };
        }
        if (field === 'rpe') {
          return { ...s, rpe: parsed === null ? null : Math.min(10, Math.max(1, parsed)) };
        }
        return { ...s, rir: parsed === null ? null : Math.min(10, Math.max(0, parsed)) };
      }),
    }));
  };

  const toggleSetCompleted = (setIdx: number) => {
    if (!currentExercise) return;
    const wasCompleted = currentExercise.sets[setIdx]?.completed;
    updateCurrentExercise((ex) => ({
      ...ex,
      sets: ex.sets.map((s, i) => (i === setIdx ? { ...s, completed: !s.completed } : s)),
    }));
    if (!wasCompleted && (currentExercise.restSeconds || restDuration) > 0) {
      const targetRest = currentExercise.restSeconds || restDuration || 90;
      setRestDuration(targetRest);
      setRestRemaining(targetRest);
      setRestRunning(true);
      setRestJustFinished(false);
    }
  };

  const handleAddSet = () => {
    updateCurrentExercise((ex) => {
      const last = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [
          ...ex.sets,
          {
            setNumber: ex.sets.length + 1,
            weightKg: last ? last.weightKg : 0,
            reps: last ? last.reps : 10,
            rpe: null,
            rir: null,
            completed: false,
          },
        ],
      };
    });
  };

  const handleRemoveSet = (setIdx: number) => {
    updateCurrentExercise((ex) => {
      if (ex.sets.length <= 1) return ex;
      const nextSets = ex.sets
        .filter((_, i) => i !== setIdx)
        .map((s, i) => ({ ...s, setNumber: i + 1 }));
      return { ...ex, sets: nextSets };
    });
  };

  const handleAddExerciseMidSession = (ex: Exercise) => {
    if (!activeSession) return;
    const prev = getPreviousExercisePerformance(ex.id, sessions);
    const defaultSets = Array.from({ length: 3 }, (_, idx) => {
      const pSet = prev?.sets[idx] ?? prev?.sets[prev.sets.length - 1];
      return {
        setNumber: idx + 1,
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
  };

  const handleTogglePause = () => {
    if (!activeSession) return;
    const now = Date.now();
    if (activeSession.isPaused) {
      const extraPause = activeSession.pausedAtMs ? now - activeSession.pausedAtMs : 0;
      persistSessionUpdate({
        ...activeSession,
        isPaused: false,
        pausedAtMs: null,
        accumulatedPauseMs: (activeSession.accumulatedPauseMs || 0) + extraPause,
      });
    } else {
      persistSessionUpdate({
        ...activeSession,
        isPaused: true,
        pausedAtMs: now,
      });
    }
  };

  const handleFinishSession = async () => {
    if (!firebaseUser || !activeSession || !profile) return;
    setFinishing(true);
    try {
      const prevSimilar = sessions.find(
        (s) =>
          (activeSession.workoutId && s.workoutId === activeSession.workoutId) ||
          s.workoutName === activeSession.workoutName
      );
      const result = await completeWorkoutSession(
        firebaseUser.uid,
        activeSession,
        elapsedSeconds,
        personalRecords,
        profile.notificationSettings,
        activeProgram,
        { sessionRpe, coachId: profile.coachId, goals }
      );
      setFinishModalOpen(false);
      setActiveSessionLocal(null);
      setCompletedSummary({
        savedSession: result.savedSession,
        prevVolumeKg: prevSimilar ? prevSimilar.totalVolumeKg : null,
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
    await discardActiveSession(firebaseUser.uid);
    setActiveSessionLocal(null);
  };

  const adjustRest = (delta: number) => {
    const next = Math.max(15, Math.min(600, (restRunning ? restRemaining : restDuration) + delta));
    setRestDuration(next);
    if (restRunning) setRestRemaining(next);
  };

  if (completedSummary) {
    const { savedSession, prevVolumeKg, unlockedPRs } = completedSummary;
    const volDeltaKg = prevVolumeKg !== null ? savedSession.totalVolumeKg - prevVolumeKg : null;
    const unitLabel = unit === 'lb' ? t.common.lb : t.common.kg;
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className="bg-white dark:bg-[#121417] border border-emerald-500/50 rounded-2xl p-6 text-center space-y-5">
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
              <span className="text-[11px] font-sans text-neutral-500 block">{t.common.volume}</span>
              <strong className="text-sm">
                {formatVolume(savedSession.totalVolumeKg, unit, language)} {unitLabel}
              </strong>
            </div>
          </div>

          {volDeltaKg !== null && (
            <p className="text-xs text-neutral-500 font-mono tabular-nums">
              {language === 'ar' ? 'مقارنة بالجلسة المماثلة السابقة:' : 'Vs. previous similar session:'}{' '}
              <span className={volDeltaKg >= 0 ? 'text-emerald-500 font-semibold' : 'text-amber-500 font-semibold'}>
                {volDeltaKg >= 0 ? '+' : ''}
                {formatVolume(volDeltaKg, unit, language)} {unitLabel}
              </span>
            </p>
          )}

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
                              ? 'أعلى تكرارات'
                              : 'Best Reps'
                            : language === 'ar'
                              ? 'أعلى 1RM مقدّر'
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
                setActiveSection('analytics');
              }}
              className="flex-1 min-h-[44px] rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium cursor-pointer"
            >
              {t.nav.analytics}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No active workout screen
  if (!activeSession) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">{t.live.noActiveTitle}</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
              {t.live.noActiveDesc}
            </p>
          </div>
          <button
            onClick={startBlankWorkout}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            {t.live.startBlank}
          </button>
        </div>

        {workouts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold">{t.live.startFromTemplate}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {workouts.map((w) => (
                <button
                  key={w.id}
                  onClick={() => startWorkoutFromTemplate(w, activeProgram)}
                  className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 rounded-2xl p-4 text-start space-y-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm truncate">{w.name}</h3>
                    <Play className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs text-neutral-500">
                    {w.exercises.length} {t.workouts.exercisesInWorkout}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const PrevChevron = language === 'ar' ? ChevronRight : ChevronLeft;
  const NextChevron = language === 'ar' ? ChevronLeft : ChevronRight;
  const unitText = unit === 'lb' ? t.common.lb : t.common.kg;

  const completedSetsTotal = activeSession.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSetsPlanned = activeSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <div className="space-y-5">
      {fatigueAlert?.hasWarning && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3">
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

      {/* Top Session Control Strip */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">{activeSession.workoutName}</h1>
            <p className={`text-xs ${isOnline ? 'text-neutral-500 dark:text-neutral-400' : 'text-amber-500 font-medium'}`}>
              {isOnline ? t.live.autosaved : t.live.offlineSaved}
              {activeSession.programName ? ` · ${activeSession.programName}` : ''} ·{' '}
              <span className="font-mono tabular-nums">
                {completedSetsTotal}/{totalSetsPlanned} {t.common.sets}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#090A0B] font-mono text-sm font-semibold tabular-nums inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              {formatDuration(elapsedSeconds)}
            </div>

            <button
              onClick={handleTogglePause}
              className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              {activeSession.isPaused ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5" />}
              {activeSession.isPaused ? t.live.resumeSession : t.live.pauseSession}
            </button>

            <button
              onClick={() => setFinishModalOpen(true)}
              className="min-h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
            >
              {t.live.finishWorkout}
            </button>
          </div>
        </div>

        {/* Adjustable Rest Timer */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-neutral-500">{t.live.restTimer}:</span>
            <span
              className={`font-mono text-lg font-bold tabular-nums ${
                restRunning ? 'text-emerald-500' : restJustFinished ? 'text-amber-500' : ''
              }`}
            >
              {formatDuration(restRunning ? restRemaining : restDuration)}
            </span>
            {restJustFinished && (
              <span className="text-xs text-amber-500 font-medium">{t.live.restComplete}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustRest(-15)}
              className="min-h-[34px] px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-mono cursor-pointer"
            >
              {language === 'ar' ? '-15 ث' : '-15s'}
            </button>
            <button
              type="button"
              onClick={() => adjustRest(15)}
              className="min-h-[34px] px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-mono cursor-pointer"
            >
              {language === 'ar' ? '+15 ث' : '+15s'}
            </button>
            {!restRunning ? (
              <button
                type="button"
                onClick={() => {
                  setRestRemaining(restDuration);
                  setRestRunning(true);
                  setRestJustFinished(false);
                }}
                className="min-h-[34px] px-3 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium cursor-pointer"
              >
                {t.live.startRest}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRestRunning(false)}
                className="min-h-[34px] px-3 rounded-lg bg-amber-600 text-white text-xs font-medium cursor-pointer"
              >
                {t.live.stopRest}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setRestRunning(false);
                setRestRemaining(restDuration);
                setRestJustFinished(false);
              }}
              className="min-h-[34px] px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
              aria-label={t.live.resetRest}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Exercise Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {activeSession.exercises.map((ex, idx) => {
          const allDone = ex.sets.length > 0 && ex.sets.every((s) => s.completed);
          const isCurr = idx === currentExIdx;
          return (
            <button
              key={ex.itemId}
              onClick={() => persistSessionUpdate({ ...activeSession, currentExerciseIndex: idx })}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-colors shrink-0 cursor-pointer ${
                isCurr
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : allDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : ex.skipped
                      ? 'border-neutral-200 dark:border-neutral-800 text-neutral-400 line-through'
                      : 'bg-white dark:bg-[#121417] border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {idx + 1}. {language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn}
            </button>
          );
        })}

        <button
          onClick={() => setAddExerciseOpen(true)}
          className="min-h-[38px] px-3.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:border-emerald-500 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.live.addExerciseMidSession}
        </button>
      </div>

      {/* Active Exercise Execution Card */}
      {currentExercise ? (
        <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">
                  {language === 'ar' ? currentExercise.exerciseNameAr : currentExercise.exerciseNameEn}
                </h2>
                {currentExercise.technique && currentExercise.technique !== 'standard' && (
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {currentExercise.technique === 'superset'
                      ? `${t.apex.techSuperset}${currentExercise.supersetGroup ? ` ${currentExercise.supersetGroup}` : ''}`
                      : currentExercise.technique === 'circuit'
                        ? t.apex.techCircuit
                        : t.apex.techDropSet}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {currentExercise.primaryMuscles.map((m) => tLabel(MUSCLE_LABELS[m], language)).join(', ')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                {t.live.formGuide}
              </button>
              <button
                type="button"
                onClick={() =>
                  updateCurrentExercise((ex) => ({ ...ex, skipped: !ex.skipped }))
                }
                className={`min-h-[38px] px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer ${
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

          {/* Side-by-Side Previous Performance Reference */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-1.5">
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              {t.live.previousSession}
            </p>
            {previousExerciseData ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                {previousExerciseData.sets
                  .filter((s) => s.completed)
                  .map((s) => (
                    <span key={s.setNumber}>
                      {t.live.set} {s.setNumber}:{' '}
                      <strong className="text-neutral-900 dark:text-neutral-100">
                        {formatWeight(s.weightKg, unit)} {unitText} × {s.reps}
                      </strong>
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">{t.live.noPreviousData}</p>
            )}
          </div>

          {/* Sets Logging Table */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-12 gap-2 px-1 items-center text-[11px] font-medium text-neutral-500">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">{t.live.weight} ({unitText})</div>
              <div className="col-span-3">{t.live.reps}</div>
              <div className="col-span-2 flex items-center justify-center gap-1">
                <div className="inline-flex rounded-lg bg-neutral-100 dark:bg-[#090A0B] p-0.5 border border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setEffortMode('rpe')}
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold cursor-pointer ${
                      effortMode === 'rpe'
                        ? 'bg-white dark:bg-[#1A1D22] text-emerald-600 dark:text-emerald-400'
                        : 'text-neutral-500'
                    }`}
                  >
                    {t.live.rpe}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEffortMode('rir')}
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold cursor-pointer ${
                      effortMode === 'rir'
                        ? 'bg-white dark:bg-[#1A1D22] text-emerald-600 dark:text-emerald-400'
                        : 'text-neutral-500'
                    }`}
                  >
                    {t.live.rir}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setRpeGuideOpen(true)}
                  aria-label={t.apex.rpeGuideTitle}
                  className="text-neutral-400 hover:text-emerald-500 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="col-span-3 text-end">{t.live.done}</div>
            </div>

            {currentExercise.sets.map((setItem, sIdx) => {
              const prevSet = previousExerciseData?.sets[sIdx];
              const setLabel =
                setItem.setType === 'warmup'
                  ? language === 'ar'
                    ? 'إحماء'
                    : 'W'
                  : setItem.setType === 'drop'
                    ? language === 'ar'
                      ? 'دروب'
                      : 'D'
                    : String(setItem.setNumber);
              return (
                <div
                  key={setItem.setNumber}
                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-colors ${
                    setItem.completed
                      ? 'bg-emerald-500/8 border-emerald-500/35'
                      : setItem.setType === 'warmup'
                        ? 'bg-amber-500/5 border-amber-500/25'
                        : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="col-span-1 text-center font-mono text-xs font-semibold tabular-nums">
                    <span>{setLabel}</span>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={setItem.weightKg > 0 ? toDisplayWeight(setItem.weightKg, unit) : ''}
                      placeholder={prevSet ? formatWeight(prevSet.weightKg, unit) : '0'}
                      onChange={(e) => handleSetFieldChange(sIdx, 'weight', e.target.value)}
                      className="w-full min-h-[44px] px-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 font-mono text-sm tabular-nums text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={setItem.reps > 0 ? setItem.reps : ''}
                      placeholder={prevSet ? String(prevSet.reps) : '10'}
                      onChange={(e) => handleSetFieldChange(sIdx, 'reps', e.target.value)}
                      className="w-full min-h-[44px] px-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 font-mono text-sm tabular-nums text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="col-span-2">
                    {effortMode === 'rpe' ? (
                      <input
                        type="number"
                        min={1}
                        max={10}
                        step="0.5"
                        aria-label={t.live.rpe}
                        value={setItem.rpe ?? ''}
                        placeholder="—"
                        onChange={(e) => handleSetFieldChange(sIdx, 'rpe', e.target.value)}
                        className="w-full min-h-[44px] px-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 font-mono text-xs tabular-nums text-center focus:outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={1}
                        aria-label={t.live.rir}
                        value={setItem.rir ?? ''}
                        placeholder="—"
                        onChange={(e) => handleSetFieldChange(sIdx, 'rir', e.target.value)}
                        className="w-full min-h-[44px] px-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-700 font-mono text-xs tabular-nums text-center focus:outline-none focus:border-emerald-500"
                      />
                    )}
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-1">
                    {currentExercise.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(sIdx)}
                        className="min-h-[44px] min-w-[32px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-500 cursor-pointer"
                        aria-label={t.live.removeSet}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleSetCompleted(sIdx)}
                      className={`min-h-[44px] flex-1 max-w-[52px] px-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        setItem.completed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-emerald-500/20'
                      }`}
                      aria-label={t.live.done}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleAddSet}
              className="w-full min-h-[42px] rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.live.addSet}
            </button>
          </div>

          {/* Exercise Notes & Session Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <input
              type="text"
              value={currentExercise.notes}
              onChange={(e) => updateCurrentExercise((ex) => ({ ...ex, notes: e.target.value }))}
              placeholder={t.workouts.exerciseNotes}
              className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
            />
            <input
              type="text"
              value={activeSession.notes}
              onChange={(e) => persistSessionUpdate({ ...activeSession, notes: e.target.value })}
              placeholder={t.live.sessionNotes}
              className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
            />
          </div>

          {/* Bottom Prev / Next Exercise Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={currentExIdx === 0}
              onClick={() =>
                persistSessionUpdate({
                  ...activeSession,
                  currentExerciseIndex: Math.max(0, currentExIdx - 1),
                })
              }
              className="min-h-[42px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-35 cursor-pointer"
            >
              <PrevChevron className="w-4 h-4" />
              {t.live.prevExercise}
            </button>

            <button
              type="button"
              onClick={handleDiscardSession}
              className="text-xs text-neutral-500 hover:text-red-500 px-2 py-1 cursor-pointer"
            >
              {t.live.discardSession}
            </button>

            <button
              type="button"
              disabled={currentExIdx >= activeSession.exercises.length - 1}
              onClick={() =>
                persistSessionUpdate({
                  ...activeSession,
                  currentExerciseIndex: Math.min(
                    activeSession.exercises.length - 1,
                    currentExIdx + 1
                  ),
                })
              }
              className="min-h-[42px] px-4 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-35 cursor-pointer"
            >
              {t.live.nextExercise}
              <NextChevron className="w-4 h-4" />
            </button>
          </div>
        </section>
      ) : (
        <div className="bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-neutral-500">{t.workouts.pickExercise}</p>
          <button
            onClick={() => setAddExerciseOpen(true)}
            className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.live.addExerciseMidSession}
          </button>
        </div>
      )}

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
                onClick={() => setAddExerciseOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredPickerExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleAddExerciseMidSession(ex)}
                  className="w-full px-3.5 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-start flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {language === 'ar' ? ex.nameAr : ex.nameEn}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {ex.primaryMuscles.map((m) => tLabel(MUSCLE_LABELS[m], language)).join(', ')} ·{' '}
                      {tLabel(EQUIPMENT_LABELS[ex.equipment], language)}
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
                  {currentExercise.primaryMuscles.map((m) => tLabel(MUSCLE_LABELS[m], language)).join(', ')}
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
              <div className="flex items-center justify-between gap-2">
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

              {currentBiomechanics && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {t.apex.gripStanceTitle}
                    </h4>
                    <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {language === 'ar'
                        ? currentBiomechanics.gripStanceAr
                        : currentBiomechanics.gripStanceEn}
                    </p>
                  </div>
                  {currentBiomechanics.phases.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentBiomechanics.phases.map((ph, idx) => (
                        <div
                          key={ph.phase}
                          className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs space-y-0.5"
                        >
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {String(idx + 1).padStart(2, '0')} · {language === 'ar' ? ph.labelAr : ph.labelEn}
                          </p>
                          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {language === 'ar' ? ph.cueAr : ph.cueEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentCatalogExercise ? (
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

                  {(language === 'ar'
                    ? currentCatalogExercise.breathingAr
                    : currentCatalogExercise.breathingEn) && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                        {t.exercises.breathing}
                      </h4>
                      <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {language === 'ar'
                          ? currentCatalogExercise.breathingAr
                          : currentCatalogExercise.breathingEn}
                      </p>
                    </div>
                  )}

                  {(language === 'ar'
                    ? currentCatalogExercise.safetyAr
                    : currentCatalogExercise.safetyEn) && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {t.exercises.safety}
                      </h4>
                      <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {language === 'ar'
                          ? currentCatalogExercise.safetyAr
                          : currentCatalogExercise.safetyEn}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 text-center py-2">
                  {currentExercise.primaryMuscles.map((m) => tLabel(MUSCLE_LABELS[m], language)).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RPE vs RIR Educational Guide Modal */}
      {rpeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{t.apex.rpeGuideTitle}</h3>
              <button
                type="button"
                onClick={() => setRpeGuideOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
                <strong className="block text-emerald-500 mb-1">RPE (1–10)</strong>
                <p>{t.apex.rpeDesc}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
                <strong className="block text-amber-500 mb-1">RIR (0–10)</strong>
                <p>{t.apex.rirDesc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRpeGuideOpen(false)}
              className="w-full min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
            >
              {t.common.close}
            </button>
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
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 6, 7, 8, 9, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSessionRpe(val)}
                    className={`min-h-[38px] rounded-xl font-mono text-xs font-bold border cursor-pointer ${
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
                onClick={() => setFinishModalOpen(false)}
                disabled={finishing}
                className="min-h-[42px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
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
