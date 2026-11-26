import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onIdTokenChanged, signOut, User } from 'firebase/auth';
import { BUILTIN_EXERCISES } from '../data/exercises';
import { TRANSLATIONS } from '../i18n/translations';
import { auth } from '../lib/firebase';
import {
  acceptCoachAssignment,
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
  subscribeGymOrganizations,
  subscribeUserProfile,
  subscribeUserSubcollection,
  updateUserFavorites,
  updateUserProfileSettings,
} from '../services/firestoreService';
import {
  isLocalDeviceModeEnabled,
  LOCAL_DEVICE_UID,
  localEnsureUserProfile,
  setLocalDeviceModeEnabled,
} from '../services/localDeviceStore';
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
  GymOrganization,
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

export interface CoachCourseNotice {
  assignmentId: string;
  coachName: string;
  programName: string;
  notes?: string;
  programId?: string;
  receivedAtIso: string;
}

interface AppContextValue {
  firebaseUser: User | null;
  isLocalDeviceMode: boolean;
  authReady: boolean;
  dataLoading: boolean;
  profile: UserProfile | null;
  userRole: UserRole;
  isCoach: boolean;
  isAdmin: boolean;
  needsRoleOnboarding: boolean;
  completeRoleOnboarding: (role: 'athlete' | 'coach', displayName?: string) => Promise<void>;
  switchRole: (role: 'athlete' | 'coach') => Promise<void>;
  latestCoachCourseNotice: CoachCourseNotice | null;
  dismissCoachCourseNotice: () => void;
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
  selectedChatAthleteUid: string | null;
  openCoachChat: (athleteUid: string) => void;
  clearSelectedChatAthlete: () => void;
  pendingJoinCode: string | null;
  clearPendingJoinCode: () => void;
  activeOrg: GymOrganization | null;
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
  refreshAuthUser: () => Promise<boolean>;
  enterLocalDeviceMode: (displayName?: string) => void;
  signOutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function readInitialJoinCode(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('join');
    if (raw) {
      const clean = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
      if (clean.length >= 4 && clean.length <= 32) {
        sessionStorage.setItem('apex_pending_join_code', clean);
        params.delete('join');
        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
        window.history.replaceState({}, '', nextUrl);
        return clean;
      }
    }
    const stored = sessionStorage.getItem('apex_pending_join_code');
    return stored || null;
  } catch {
    return null;
  }
}

function safeGetLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
}

function safeRemoveLocal(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawFirebaseUser, setRawFirebaseUser] = useState<User | null>(null);
  const [localDeviceMode, setLocalDeviceMode] = useState<boolean>(() => isLocalDeviceModeEnabled());
  const [authRefreshTick, setAuthRefreshTick] = useState(0);
  const [authReady, setAuthReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestLang, setGuestLang] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('ironlog_lang');
      if (stored === 'ar' || stored === 'en') return stored;
      if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ar')) {
        return 'ar';
      }
      return 'en';
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
  const [selectedChatAthleteUid, setSelectedChatAthleteUid] = useState<string | null>(null);
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(() => readInitialJoinCode());

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
  const [orgs, setOrgs] = useState<GymOrganization[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [latestCoachCourseNotice, setLatestCoachCourseNotice] = useState<CoachCourseNotice | null>(null);

  const initialRoleRoutedUidRef = useRef<string | null>(null);
  const autoActivatingAssignmentIdsRef = useRef<Set<string>>(new Set());

  const language: Language = profile?.language ?? guestLang;
  const theme: ThemeMode = profile?.theme ?? guestTheme;
  const unit: WeightUnit = profile?.unit ?? 'kg';
  const t = language === 'ar' ? TRANSLATIONS.ar : TRANSLATIONS.en;

  const isLocalDeviceMode = !rawFirebaseUser && localDeviceMode;

  const firebaseUser: User | null = useMemo(() => {
    if (rawFirebaseUser) return rawFirebaseUser;
    if (localDeviceMode) {
      return {
        uid: LOCAL_DEVICE_UID,
        displayName: guestLang === 'ar' ? 'رياضي APEX' : 'APEX Athlete',
        email: '',
        emailVerified: true,
      } as unknown as User;
    }
    return null;
    // authRefreshTick ensures consumers re-evaluate mutated fields like emailVerified / displayName after reload()
  }, [rawFirebaseUser, localDeviceMode, guestLang, authRefreshTick]);

  const isAdmin =
    firebaseUser?.email?.toLowerCase() === 'abdulhamidraghad093@gmail.com' ||
    profile?.role === 'gym_admin';
  const userRole: UserRole = profile?.role ?? (isAdmin ? 'gym_admin' : 'athlete');
  const isCoach = userRole === 'coach' || isAdmin;
  const needsRoleOnboarding = Boolean(
    firebaseUser?.emailVerified &&
      profile &&
      !isAdmin &&
      profile.roleSelected !== true &&
      safeGetLocal(`apex_role_selected_${profile.uid}`) !== '1'
  );

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

  // Listen to Firebase Auth & ID token refreshes
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, (user) => {
      setRawFirebaseUser(user);
      if (user) {
        setLocalDeviceModeEnabled(false);
        setLocalDeviceMode(false);
      }
      setAuthReady(true);
      if (!user && !isLocalDeviceModeEnabled()) {
        initialRoleRoutedUidRef.current = null;
        autoActivatingAssignmentIdsRef.current.clear();
        setLatestCoachCourseNotice(null);
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
        setOrgs([]);
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
                    // Keep local recovery intact
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
  }, [firebaseUser, firebaseUser?.emailVerified, authRefreshTick]);

  // Role-specific Coaching, Gym Organization & Messaging Subscriptions
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

    if (isAdmin) {
      unsubs.push(subscribeGymOrganizations(uid, setOrgs));
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [firebaseUser, firebaseUser?.emailVerified, authRefreshTick, profile?.uid, userRole, isAdmin]);

  // Restore any unread coach course notice when user loads
  useEffect(() => {
    if (!firebaseUser?.emailVerified || !profile?.uid) return;
    const raw = safeGetLocal(`apex_course_notice_${profile.uid}`);
    if (raw) {
      try {
        setLatestCoachCourseNotice(JSON.parse(raw) as CoachCourseNotice);
      } catch {
        // ignore invalid stored notice
      }
    }
  }, [firebaseUser?.emailVerified, profile?.uid]);

  // Route coaches once to Coach Hub on initial sign-in after onboarding
  useEffect(() => {
    if (!firebaseUser?.emailVerified || !profile || needsRoleOnboarding) return;
    if (initialRoleRoutedUidRef.current === profile.uid) return;
    initialRoleRoutedUidRef.current = profile.uid;
    if ((profile.role === 'coach' || isAdmin) && activeSection === 'dashboard' && !pendingJoinCode) {
      setActiveSectionState('coach');
    }
  }, [firebaseUser?.emailVerified, profile, needsRoleOnboarding, isAdmin, activeSection, pendingJoinCode]);

  // Auto-activate incoming Coach Assignments & raise immediate notification banner + toast
  useEffect(() => {
    if (!firebaseUser?.emailVerified || !profile) return;
    const uid = firebaseUser.uid;
    const pendingForMe = coachAssignments.filter(
      (a) =>
        a.status === 'assigned' &&
        a.athleteUid === uid &&
        !autoActivatingAssignmentIdsRef.current.has(a.id)
    );
    if (pendingForMe.length === 0) return;

    const processIncoming = async () => {
      for (const assignment of pendingForMe) {
        autoActivatingAssignmentIdsRef.current.add(assignment.id);
        try {
          const newProgId = await acceptCoachAssignment(uid, assignment, programs);
          const notice: CoachCourseNotice = {
            assignmentId: assignment.id,
            coachName: assignment.coachName,
            programName: assignment.programName,
            notes: assignment.notes,
            programId: newProgId,
            receivedAtIso: new Date().toISOString(),
          };
          setLatestCoachCourseNotice(notice);
          safeSetLocal(`apex_course_notice_${uid}`, JSON.stringify(notice));

          const alertText =
            language === 'ar'
              ? `الكابتن ${assignment.coachName} أعطاك هذا الكورس: «${assignment.programName}» — تم تفعيله تلقائياً`
              : `Coach ${assignment.coachName} gave you this course: "${assignment.programName}" — activated automatically`;
          showToast(alertText, 'success');

          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              new Notification(language === 'ar' ? 'كورس تدريبي جديد من الكابتن' : 'New Coach Course', {
                body: alertText,
              });
            } catch {
              // Ignore unsupported notification context
            }
          }
        } catch (err) {
          console.error('Auto-activate coach assignment failed:', err);
          autoActivatingAssignmentIdsRef.current.delete(assignment.id);
        }
      }
    };

    void processIncoming();
  }, [firebaseUser?.uid, firebaseUser?.emailVerified, profile, coachAssignments, programs, language, showToast]);

  const activeOrg = useMemo(() => orgs[0] ?? null, [orgs]);

  const athleteCoachLink = useMemo(() => {
    if (profile && profile.coachId === '') return null;
    return (
      athleteCoachLinks.find(
        (l) => l.status === 'active' && (!profile?.coachId || l.coachId === profile.coachId)
      ) ?? null
    );
  }, [athleteCoachLinks, profile]);

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

  // Trigger optional daily scheduled workout reminder once per session
  useEffect(() => {
    if (!firebaseUser?.emailVerified || !profile || !activeProgram || activeProgram.status !== 'active') return;
    if (!profile.notificationSettings?.programSchedule) return;

    const jsDay = new Date().getDay();
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
        titleAr: `حصة اليوم المجدولة: ${todaySchedule.workoutName}`,
        messageEn: `Part of your active program "${activeProgram.name}".`,
        messageAr: `ضمن برنامجك التدريبي النشط «${activeProgram.name}».`,
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
        updateUserProfileSettings(firebaseUser.uid, { language: lang }).catch(() => {});
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
        updateUserProfileSettings(firebaseUser.uid, { theme: nextTheme }).catch(() => {});
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
        updateUserProfileSettings(firebaseUser.uid, { unit: nextUnit }).catch(() => {});
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

  const openCoachChat = useCallback((athleteUid: string) => {
    setSelectedChatAthleteUid(athleteUid);
    setActiveSectionState('messaging');
  }, []);

  const clearSelectedChatAthlete = useCallback(() => {
    setSelectedChatAthleteUid(null);
  }, []);

  const clearPendingJoinCode = useCallback(() => {
    setPendingJoinCode(null);
    try {
      sessionStorage.removeItem('apex_pending_join_code');
    } catch {
      // ignore
    }
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
      workoutName: language === 'ar' ? 'تمرين حر' : 'Free Workout',
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

  const refreshAuthUser = useCallback(async (): Promise<boolean> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      setRawFirebaseUser(auth.currentUser);
      setAuthRefreshTick((n) => n + 1);
      return Boolean(auth.currentUser.emailVerified);
    }
    return false;
  }, []);

  const enterLocalDeviceMode = useCallback(
    (displayName?: string) => {
      localEnsureUserProfile(displayName || '', {
        language: guestLang,
        theme: guestTheme,
        unit: 'kg',
      });
      setLocalDeviceModeEnabled(true);
      setLocalDeviceMode(true);
      setAuthReady(true);
    },
    [guestLang, guestTheme]
  );

  const signOutUser = useCallback(async () => {
    if (auth.currentUser) {
      await signOut(auth);
    }
    initialRoleRoutedUidRef.current = null;
    autoActivatingAssignmentIdsRef.current.clear();
    setLatestCoachCourseNotice(null);
    setLocalDeviceModeEnabled(false);
    setLocalDeviceMode(false);
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
    setOrgs([]);
  }, []);

  const completeRoleOnboarding = useCallback(
    async (role: 'athlete' | 'coach', displayName?: string) => {
      if (!firebaseUser?.emailVerified) return;
      const uid = firebaseUser.uid;
      const cleanName = (displayName ?? '').trim();
      await updateUserProfileSettings(uid, {
        role,
        roleSelected: true,
        ...(cleanName ? { displayName: cleanName } : {}),
      });
      safeSetLocal(`apex_role_selected_${uid}`, '1');
      initialRoleRoutedUidRef.current = uid;
      setProfile((prev) => {
        if (!prev) return prev;
        const next: UserProfile = {
          ...prev,
          role,
          roleSelected: true,
          ...(cleanName ? { displayName: cleanName } : {}),
        };
        saveCachedProfile(uid, next);
        return next;
      });
      setActiveSectionState(role === 'coach' ? 'coach' : 'dashboard');
    },
    [firebaseUser]
  );

  const switchRole = useCallback(
    async (role: 'athlete' | 'coach') => {
      if (!firebaseUser?.emailVerified) return;
      const uid = firebaseUser.uid;
      await updateUserProfileSettings(uid, { role, roleSelected: true });
      safeSetLocal(`apex_role_selected_${uid}`, '1');
      setProfile((prev) => {
        if (!prev) return prev;
        const next: UserProfile = { ...prev, role, roleSelected: true };
        saveCachedProfile(uid, next);
        return next;
      });
      if (role === 'coach') {
        setActiveSectionState('coach');
      } else {
        setActiveSectionState('dashboard');
      }
    },
    [firebaseUser]
  );

  const dismissCoachCourseNotice = useCallback(() => {
    setLatestCoachCourseNotice(null);
    if (firebaseUser?.uid) {
      safeRemoveLocal(`apex_course_notice_${firebaseUser.uid}`);
    }
  }, [firebaseUser?.uid]);

  const value: AppContextValue = {
    firebaseUser,
    isLocalDeviceMode,
    authReady,
    dataLoading,
    profile,
    userRole,
    isCoach,
    isAdmin,
    needsRoleOnboarding,
    completeRoleOnboarding,
    switchRole,
    latestCoachCourseNotice,
    dismissCoachCourseNotice,
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
    selectedChatAthleteUid,
    openCoachChat,
    clearSelectedChatAthlete,
    pendingJoinCode,
    clearPendingJoinCode,
    activeOrg,
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
    enterLocalDeviceMode,
    signOutUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
