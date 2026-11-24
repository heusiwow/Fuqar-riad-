import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { BUILTIN_EXERCISES } from '../data/exercises';
import { TRANSLATIONS } from '../i18n/translations';
import { auth } from '../lib/firebase';
import {
  createActiveSession,
  createReminder,
  ensureUserProfile,
  generateSafeId,
  loadCachedProfile,
  loadLocalActiveSession,
  saveCachedProfile,
  saveLocalActiveSession,
  subscribeActiveSession,
  subscribeAthleteCoachLinks,
  subscribeCoachAssignmentsForAthlete,
  subscribeCoachAssignmentsForCoach,
  subscribeCoachGroups,
  subscribeCoachMessages,
  subscribeCoachRoster,
  subscribeUserProfile,
  subscribeUserSubcollection,
  updateUserFavorites,
  updateUserProfileSettings,
} from '../services/firestoreService';
import {
  ActiveWorkoutSession,
  AppSection,
  BodyMeasurement,
  CoachAssignment,
  CoachGroup,
  CoachingLink,
  CoachMessage,
  Exercise,
  ExerciseNote,
  Language,
  LiveExerciseEntry,
  LiveSetEntry,
  ManualMacroLog,
  PerformanceGoal,
  PersonalRecord,
  ThemeMode,
  TrainingProgram,
  UserProfile,
  UserReminder,
  UserRole,
  WeightUnit,
  WorkoutSessionHistory,
  WorkoutTemplate,
} from '../types/ironlog';
import { getLocalDateKey, getPreviousExercisePerformance } from '../utils/calculations';
import { getExerciseBiomechanics } from '../utils/exerciseBiomechanics';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface AppContextValue {
  firebaseUser: User | null;
  authReady: boolean;
  dataLoading: boolean;
  profile: UserProfile | null;
  userRole: UserRole;
  isCoach: boolean;
  isAdmin: boolean;
  switchRole: (role: 'athlete' | 'coach') => Promise<void>;
  language: Language;
  theme: ThemeMode;
  unit: WeightUnit;
  t: (typeof TRANSLATIONS)['en'] | (typeof TRANSLATIONS)['ar'];
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  selectedExerciseId: string | null;
  openExerciseDetail: (exerciseId: string) => void;
  clearSelectedExercise: () => void;
  selectedHistorySessionId: string | null;
  openHistorySession: (sessionId: string) => void;
  clearSelectedHistorySession: () => void;
  allExercises: Exercise[];
  customExercises: Exercise[];
  exerciseNotes: Record<string, ExerciseNote>;
  workouts: WorkoutTemplate[];
  programs: TrainingProgram[];
  activeProgram: TrainingProgram | null;
  activeSession: ActiveWorkoutSession | null;
  setActiveSessionLocal: (session: ActiveWorkoutSession | null) => void;
  sessions: WorkoutSessionHistory[];
  personalRecords: Record<string, PersonalRecord>;
  goals: PerformanceGoal[];
  measurements: BodyMeasurement[];
  macros: ManualMacroLog[];
  reminders: UserReminder[];
  coachGroups: CoachGroup[];
  coachRoster: CoachingLink[];
  athleteCoachLink: CoachingLink | null;
  coachAssignments: CoachAssignment[];
  coachMessages: CoachMessage[];
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  setLanguage: (lang: Language) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setUnit: (unit: WeightUnit) => Promise<void>;
  toggleFavoriteExercise: (exerciseId: string) => Promise<void>;
  startWorkoutFromTemplate: (workout: WorkoutTemplate, program?: TrainingProgram | null) => Promise<void>;
  startBlankWorkout: () => Promise<void>;
  refreshAuthUser: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestLang, setGuestLang] = useState<Language>(() => {
    try {
      return (localStorage.getItem('ironlog_lang') as Language) === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });
  const [guestTheme, setGuestTheme] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('ironlog_theme') as ThemeMode) === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [activeSection, setActiveSectionState] = useState<AppSection>('dashboard');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState<string | null>(null);

  const setActiveSection = useCallback((section: AppSection) => {
    if (section === 'exercises') {
      setSelectedExerciseId(null);
    }
    setActiveSectionState(section);
  }, []);

  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [exerciseNotesList, setExerciseNotesList] = useState<ExerciseNote[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveWorkoutSession | null>(null);
  const [sessions, setSessions] = useState<WorkoutSessionHistory[]>([]);
  const [prList, setPrList] = useState<PersonalRecord[]>([]);
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [macros, setMacros] = useState<ManualMacroLog[]>([]);
  const [reminders, setReminders] = useState<UserReminder[]>([]);
  const [coachGroups, setCoachGroups] = useState<CoachGroup[]>([]);
  const [coachRoster, setCoachRoster] = useState<CoachingLink[]>([]);
  const [athleteCoachLinks, setAthleteCoachLinks] = useState<CoachingLink[]>([]);
  const [coachAssignments, setCoachAssignments] = useState<CoachAssignment[]>([]);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const language: Language = profile?.language ?? guestLang;
  const theme: ThemeMode = profile?.theme ?? guestTheme;
  const unit: WeightUnit = profile?.unit ?? 'kg';
  const t = language === 'ar' ? TRANSLATIONS.ar : TRANSLATIONS.en;

  const isAdmin =
    firebaseUser?.email?.toLowerCase() === 'abdulhamidraghad093@gmail.com' ||
    profile?.role === 'gym_admin';
  const userRole: UserRole = profile?.role ?? (isAdmin ? 'gym_admin' : 'athlete');
  const isCoach = userRole === 'coach' || isAdmin;

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = generateSafeId('toast');
    setToasts((prev) => [...prev.slice(-3), { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  // Apply HTML theme & dir attributes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.lang = language;
    try {
      localStorage.setItem('ironlog_lang', language);
      localStorage.setItem('ironlog_theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme, language]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (!user) {
        setProfile(null);
        setCustomExercises([]);
        setExerciseNotesList([]);
        setWorkouts([]);
        setPrograms([]);
        setActiveSession(null);
        setSessions([]);
        setPrList([]);
        setGoals([]);
        setMeasurements([]);
        setMacros([]);
        setReminders([]);
        setCoachGroups([]);
        setCoachRoster([]);
        setAthleteCoachLinks([]);
        setCoachAssignments([]);
        setCoachMessages([]);
      }
    });
    return () => unsub();
  }, []);

  // Bootstrap profile and subscribe to user collections when verified
  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified) {
      setDataLoading(false);
      return;
    }

    let cancelled = false;
    setDataLoading(true);
    const uid = firebaseUser.uid;

    // Immediately restore local cached profile & active session while Firestore syncs
    const cachedProfile = loadCachedProfile(uid);
    if (cachedProfile) {
      setProfile(cachedProfile);
      setDataLoading(false);
    }
    const localRecovered = loadLocalActiveSession(uid);
    if (localRecovered) {
      setActiveSession(localRecovered);
    }

    const unsubs: (() => void)[] = [];

    ensureUserProfile(
      uid,
      firebaseUser.displayName || '',
      firebaseUser.email || '',
      { language: guestLang, theme: guestTheme, unit: 'kg' }
    )
      .then((initialProfile) => {
        if (cancelled) return;
        setProfile((prev) => prev ?? initialProfile);
        unsubs.push(
          subscribeUserProfile(uid, (p) => {
            if (p) {
              saveCachedProfile(uid, p);
              setProfile(p);
            }
            setDataLoading(false);
          })
        );
        unsubs.push(
          subscribeUserSubcollection<Exercise>(
            uid,
            'customExercises',
            (items) => setCustomExercises(items.map((e) => ({ ...e, isCustom: true }))),
            'updatedAt',
            'desc'
          )
        );
        unsubs.push(
          subscribeUserSubcollection<ExerciseNote>(uid, 'exerciseNotes', setExerciseNotesList, 'updatedAt', 'desc')
        );
        unsubs.push(
          subscribeUserSubcollection<WorkoutTemplate>(uid, 'workouts', setWorkouts, 'updatedAt', 'desc')
        );
        unsubs.push(
          subscribeUserSubcollection<TrainingProgram>(uid, 'programs', setPrograms, 'updatedAt', 'desc')
        );
        unsubs.push(
          subscribeActiveSession(uid, (remoteSession) => {
            if (remoteSession) {
              setActiveSession(remoteSession);
            } else {
              const cached = loadLocalActiveSession(uid);
              if (cached) {
                setActiveSession(cached);
                if (navigator.onLine) {
                  createActiveSession(uid, cached).catch(() => {
                    // Keep local recovery intact if still offline
                  });
                }
              } else {
                setActiveSession(null);
              }
            }
          })
        );
        unsubs.push(
          subscribeUserSubcollection<WorkoutSessionHistory>(uid, 'sessions', setSessions, 'completedAt', 'desc')
        );
        unsubs.push(
          subscribeUserSubcollection<PersonalRecord>(uid, 'personalRecords', setPrList, 'updatedAt', 'desc')
        );
        unsubs.push(
          subscribeUserSubcollection<PerformanceGoal>(uid, 'goals', setGoals, 'updatedAt', 'desc')
        );
        unsubs.push(
          subscribeUserSubcollection<BodyMeasurement>(uid, 'measurements', setMeasurements, 'date', 'desc')
        );
        unsubs.push(
          subscribeUserSubcollection<ManualMacroLog>(uid, 'macros', setMacros, 'dateKey', 'desc')
        );
        unsubs.push(
          subscribeUserSubcollection<UserReminder>(uid, 'reminders', setReminders, 'createdAt', 'desc')
        );
      })
      .catch((err) => {
        console.error(err);
        setDataLoading(false);
      });

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [firebaseUser, firebaseUser?.emailVerified]);

  // Role-specific Coaching & Messaging Subscriptions
  useEffect(() => {
    if (!firebaseUser || !firebaseUser.emailVerified || !profile) return;
    const uid = firebaseUser.uid;
    const unsubs: (() => void)[] = [];

    if (userRole === 'coach' || userRole === 'gym_admin') {
      unsubs.push(subscribeCoachGroups(uid, setCoachGroups));
      unsubs.push(subscribeCoachRoster(uid, setCoachRoster));
      unsubs.push(subscribeCoachAssignmentsForCoach(uid, setCoachAssignments));
      unsubs.push(subscribeCoachMessages(uid, 'coach', setCoachMessages));
    } else {
      unsubs.push(subscribeAthleteCoachLinks(uid, setAthleteCoachLinks));
      unsubs.push(subscribeCoachAssignmentsForAthlete(uid, setCoachAssignments));
      unsubs.push(subscribeCoachMessages(uid, 'athlete', setCoachMessages));
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [firebaseUser, firebaseUser?.emailVerified, profile?.uid, userRole]);

  const athleteCoachLink = useMemo(
    () => athleteCoachLinks.find((l) => l.status === 'active') ?? null,
    [athleteCoachLinks]
  );

  const allExercises = useMemo(() => [...customExercises, ...BUILTIN_EXERCISES], [customExercises]);

  const exerciseNotes = useMemo(() => {
    const map: Record<string, ExerciseNote> = {};
    for (const note of exerciseNotesList) {
      map[note.exerciseId] = note;
    }
    return map;
  }, [exerciseNotesList]);

  const personalRecords = useMemo(() => {
    const map: Record<string, PersonalRecord> = {};
    for (const pr of prList) {
      map[pr.exerciseId] = pr;
    }
    return map;
  }, [prList]);

  const activeProgram = useMemo(() => {
    if (!programs.length) return null;
    if (profile?.activeProgramId) {
      const matched = programs.find((p) => p.id === profile.activeProgramId && p.status !== 'archived');
      if (matched) return matched;
    }
    return programs.find((p) => p.status === 'active') ?? null;
  }, [programs, profile?.activeProgramId]);

  // Trigger optional daily scheduled workout reminder once per session when active program has a workout today
  useEffect(() => {
    if (!firebaseUser?.emailVerified || !profile || !activeProgram || activeProgram.status !== 'active') return;
    if (!profile.notificationSettings?.programSchedule) return;

    const jsDay = new Date().getDay(); // 0=Sun..6=Sat
    const mondayIdx = jsDay === 0 ? 6 : jsDay - 1;
    const todaySchedule = activeProgram.scheduledDays[mondayIdx];
    if (!todaySchedule || todaySchedule.isRestDay || !todaySchedule.workoutName) return;

    const todayKey = getLocalDateKey();
    const guardKey = `ironlog_rem_${firebaseUser.uid}_${todayKey}_${activeProgram.id}`;
    try {
      if (sessionStorage.getItem(guardKey)) return;
      sessionStorage.setItem(guardKey, '1');
    } catch {
      // ignore
    }

    const alreadyLoggedToday = sessions.some((s) => getLocalDateKey(new Date(s.completedAt)) === todayKey);
    if (alreadyLoggedToday) return;

    const remId = `sched-${todayKey}-${activeProgram.id}`.slice(0, 120);
    const exists = reminders.some((r) => r.id === remId);
    if (!exists) {
      createReminder(firebaseUser.uid, {
        id: remId,
        type: 'program_schedule',
        titleEn: `Today's scheduled session: ${todaySchedule.workoutName}`,
        titleAr: `تمرين اليوم المجدول: ${todaySchedule.workoutName}`,
        messageEn: `Part of your active program "${activeProgram.name}".`,
        messageAr: `ضمن برنامجك النشط "${activeProgram.name}".`,
        read: false,
      }).catch(() => {
        // non-blocking
      });
    }
  }, [firebaseUser?.uid, firebaseUser?.emailVerified, profile, activeProgram, sessions, reminders]);

  const setLanguage = useCallback(
    async (lang: Language) => {
      setGuestLang(lang);
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, language: lang };
        saveCachedProfile(prev.uid, next);
        return next;
      });
      if (firebaseUser?.emailVerified) {
        updateUserProfileSettings(firebaseUser.uid, { language: lang }).catch(() => {
          // Queued locally via offline persistence
        });
      }
    },
    [firebaseUser]
  );

  const setTheme = useCallback(
    async (nextTheme: ThemeMode) => {
      setGuestTheme(nextTheme);
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, theme: nextTheme };
        saveCachedProfile(prev.uid, next);
        return next;
      });
      if (firebaseUser?.emailVerified) {
        updateUserProfileSettings(firebaseUser.uid, { theme: nextTheme }).catch(() => {
          // Queued locally via offline persistence
        });
      }
    },
    [firebaseUser]
  );

  const setUnit = useCallback(
    async (nextUnit: WeightUnit) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, unit: nextUnit };
        saveCachedProfile(prev.uid, next);
        return next;
      });
      if (firebaseUser?.emailVerified) {
        updateUserProfileSettings(firebaseUser.uid, { unit: nextUnit }).catch(() => {
          // Queued locally via offline persistence
        });
      }
    },
    [firebaseUser]
  );

  const toggleFavoriteExercise = useCallback(
    async (exerciseId: string) => {
      if (!firebaseUser?.emailVerified || !profile) return;
      const current = profile.favoriteExerciseIds ?? [];
      const exists = current.includes(exerciseId);
      const next = exists ? current.filter((id) => id !== exerciseId) : [...current, exerciseId];
      await updateUserFavorites(firebaseUser.uid, next);
    },
    [firebaseUser, profile]
  );

  const openExerciseDetail = useCallback((exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setActiveSectionState('exercises');
  }, []);

  const clearSelectedExercise = useCallback(() => {
    setSelectedExerciseId(null);
  }, []);

  const openHistorySession = useCallback((sessionId: string) => {
    setSelectedHistorySessionId(sessionId);
    setActiveSectionState('history');
  }, []);

  const clearSelectedHistorySession = useCallback(() => {
    setSelectedHistorySessionId(null);
  }, []);

  const startWorkoutFromTemplate = useCallback(
    async (workout: WorkoutTemplate, program?: TrainingProgram | null) => {
      if (!firebaseUser?.emailVerified) return;
      const catalogMap = new Map(allExercises.map((e) => [e.id, e]));

      const liveExercises: LiveExerciseEntry[] = workout.exercises.map((item) => {
        const refEx = catalogMap.get(item.exerciseId);
        const bio = refEx ? getExerciseBiomechanics(refEx) : null;
        const prev = getPreviousExercisePerformance(item.exerciseId, sessions);
        const warmupCount = Math.max(0, item.warmupSets || 0);
        const workingCount = Math.max(1, item.sets || 3);
        const prevWorking = prev?.sets.filter((s) => s.setType !== 'warmup') ?? [];

        const sets: LiveSetEntry[] = [];
        for (let i = 0; i < warmupCount; i++) {
          const baseW = item.targetWeightKg ?? prevWorking[0]?.weightKg ?? 0;
          sets.push({
            setNumber: i + 1,
            setType: 'warmup',
            targetWeightKg: baseW > 0 ? Math.round(baseW * 0.5 * 2) / 2 : 0,
            targetRepsMin: 8,
            targetRepsMax: 12,
            targetRpe: 5,
            targetRir: 5,
            weightKg: baseW > 0 ? Math.round(baseW * 0.5 * 2) / 2 : 0,
            reps: 10,
            rpe: null,
            rir: null,
            completed: false,
          });
        }
        for (let i = 0; i < workingCount; i++) {
          const prevSet = prevWorking[i] ?? prevWorking[prevWorking.length - 1];
          const isLastDrop = item.technique === 'drop_set' && i === workingCount - 1 && workingCount > 1;
          const targetW = item.targetWeightKg ?? (prevSet ? prevSet.weightKg : 0);
          sets.push({
            setNumber: warmupCount + i + 1,
            setType: isLastDrop ? 'drop' : 'working',
            targetWeightKg: targetW,
            targetRepsMin: item.targetRepsMin || 8,
            targetRepsMax: item.targetRepsMax || 12,
            targetRpe: item.targetRpe ?? null,
            targetRir: item.targetRir ?? null,
            weightKg: targetW,
            reps: prevSet ? prevSet.reps : item.targetRepsMin || 10,
            rpe: null,
            rir: null,
            completed: false,
          });
        }

        return {
          itemId: item.itemId || generateSafeId('item'),
          exerciseId: item.exerciseId,
          exerciseNameEn: item.exerciseNameEn,
          exerciseNameAr: item.exerciseNameAr,
          primaryMuscles: refEx?.primaryMuscles ?? ['chest'],
          secondaryMuscles: refEx?.secondaryMuscles ?? [],
          stabilizerMuscles: bio?.stabilizerMuscles ?? [],
          technique: item.technique ?? 'standard',
          supersetGroup: item.supersetGroup ?? '',
          restSeconds: item.restSeconds ?? 90,
          notes: item.notes ?? '',
          skipped: false,
          sets,
        };
      });

      const newSession: ActiveWorkoutSession = {
        sessionId: generateSafeId('sess'),
        userId: firebaseUser.uid,
        workoutId: workout.id,
        workoutName: workout.name,
        programId: program?.id ?? activeProgram?.id ?? '',
        programName: program?.name ?? activeProgram?.name ?? '',
        startedAtMs: Date.now(),
        pausedAtMs: null,
        accumulatedPauseMs: 0,
        isPaused: false,
        currentExerciseIndex: 0,
        notes: '',
        exercises: liveExercises,
      };

      setActiveSession(newSession);
      setActiveSection('live');
      await createActiveSession(firebaseUser.uid, newSession);
    },
    [firebaseUser, allExercises, sessions, activeProgram]
  );

  const startBlankWorkout = useCallback(async () => {
    if (!firebaseUser?.emailVerified) return;
    const newSession: ActiveWorkoutSession = {
      sessionId: generateSafeId('sess'),
      userId: firebaseUser.uid,
      workoutId: '',
      workoutName: language === 'ar' ? 'جلسة تمرين حرة' : 'Open Training Session',
      programId: activeProgram?.id ?? '',
      programName: activeProgram?.name ?? '',
      startedAtMs: Date.now(),
      pausedAtMs: null,
      accumulatedPauseMs: 0,
      isPaused: false,
      currentExerciseIndex: 0,
      notes: '',
      exercises: [],
    };
    setActiveSession(newSession);
    setActiveSection('live');
    await createActiveSession(firebaseUser.uid, newSession);
  }, [firebaseUser, language, activeProgram]);

  const setActiveSessionLocal = useCallback(
    (next: ActiveWorkoutSession | null) => {
      setActiveSession(next);
      if (firebaseUser) {
        saveLocalActiveSession(firebaseUser.uid, next);
      }
    },
    [firebaseUser]
  );

  const refreshAuthUser = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setFirebaseUser({ ...auth.currentUser } as User);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const switchRole = useCallback(
    async (role: 'athlete' | 'coach') => {
      if (!firebaseUser?.emailVerified) return;
      await updateUserProfileSettings(firebaseUser.uid, { role });
      if (role === 'coach') {
        setActiveSectionState('coach');
      } else {
        setActiveSectionState('dashboard');
      }
    },
    [firebaseUser]
  );

  const value: AppContextValue = {
    firebaseUser,
    authReady,
    dataLoading,
    profile,
    userRole,
    isCoach,
    isAdmin,
    switchRole,
    language,
    theme,
    unit,
    t,
    activeSection,
    setActiveSection,
    selectedExerciseId,
    openExerciseDetail,
    clearSelectedExercise,
    selectedHistorySessionId,
    openHistorySession,
    clearSelectedHistorySession,
    allExercises,
    customExercises,
    exerciseNotes,
    workouts,
    programs,
    activeProgram,
    activeSession,
    setActiveSessionLocal,
    sessions,
    personalRecords,
    goals,
    measurements,
    macros,
    reminders,
    coachGroups,
    coachRoster,
    athleteCoachLink,
    coachAssignments,
    coachMessages,
    toasts,
    showToast,
    setLanguage,
    setTheme,
    setUnit,
    toggleFavoriteExercise,
    startWorkoutFromTemplate,
    startBlankWorkout,
    refreshAuthUser,
    signOutUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
