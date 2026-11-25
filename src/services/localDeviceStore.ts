import {
  ActiveWorkoutSession,
  CoachAssignment,
  CoachGroup,
  CoachingLink,
  CoachMessage,
  Language,
  PerformanceGoal,
  PersonalRecord,
  ThemeMode,
  TrainingProgram,
  UserProfile,
  UserRole,
  WeightUnit,
  WorkoutSessionHistory,
  WorkoutTemplate,
} from '../types/ironlog';

export const LOCAL_DEVICE_UID = 'local-device-athlete';
const LOCAL_MODE_KEY = 'apex_local_device_mode';
const LOCAL_PREFIX = 'apex_local_db_';

export function isLocalDeviceUid(uid: string | null | undefined): boolean {
  return Boolean(uid && (uid === LOCAL_DEVICE_UID || uid.startsWith('local-demo-')));
}

export function isLocalDeviceModeEnabled(): boolean {
  try {
    return localStorage.getItem(LOCAL_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setLocalDeviceModeEnabled(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(LOCAL_MODE_KEY, '1');
    } else {
      localStorage.removeItem(LOCAL_MODE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LOCAL_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(LOCAL_PREFIX + key);
    } else {
      localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value));
    }
  } catch {
    // Ignore storage quota errors
  }
}

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function subscribeChannel(channel: string, listener: Listener): () => void {
  let set = listeners.get(channel);
  if (!set) {
    set = new Set();
    listeners.set(channel, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
  };
}

function notifyChannel(channel: string): void {
  const set = listeners.get(channel);
  if (!set) return;
  for (const fn of set) {
    try {
      fn();
    } catch {
      // Ignore subscriber errors
    }
  }
}

export function localGetProfile(): UserProfile | null {
  return readJson<UserProfile | null>('profile', null);
}

export function localEnsureUserProfile(
  displayName: string,
  defaults?: { language?: Language; theme?: ThemeMode; unit?: WeightUnit; role?: UserRole }
): UserProfile {
  const existing = localGetProfile();
  if (existing) {
    return {
      ...existing,
      role: existing.role ?? 'athlete',
      ageGroup: existing.ageGroup ?? 'adult',
    };
  }
  const nowIso = new Date().toISOString();
  const initialProfile: UserProfile = {
    uid: LOCAL_DEVICE_UID,
    displayName: (displayName || '').trim() || (defaults?.language === 'ar' ? 'بطل APEX' : 'APEX Athlete'),
    role: defaults?.role ?? 'athlete',
    ageGroup: 'adult',
    language: defaults?.language ?? 'en',
    theme: defaults?.theme ?? 'dark',
    unit: defaults?.unit ?? 'kg',
    experienceLevel: 'intermediate',
    weeklyFrequency: 4,
    trainingGoal: 'hypertrophy',
    preferredSplit: 'push_pull_legs',
    favoriteExerciseIds: [],
    notificationSettings: {
      scheduledWorkout: true,
      programSchedule: true,
      personalRecord: true,
      workoutCompletion: true,
      coachFeedback: true,
      programChange: true,
      goalMilestone: true,
      missedWorkout: true,
      teamAnnouncement: true,
      checkinReminder: true,
    },
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  writeJson('profile', initialProfile);
  notifyChannel('profile');
  return initialProfile;
}

export function localUpdateProfile(updates: Partial<UserProfile>): void {
  const current = localGetProfile() ?? localEnsureUserProfile('');
  const next: UserProfile = {
    ...current,
    ...updates,
    uid: LOCAL_DEVICE_UID,
    updatedAt: new Date().toISOString(),
  };
  writeJson('profile', next);
  notifyChannel('profile');
}

export function localSubscribeProfile(cb: (profile: UserProfile | null) => void): () => void {
  cb(localGetProfile());
  return subscribeChannel('profile', () => {
    cb(localGetProfile());
  });
}

export function localGetActiveSession(): ActiveWorkoutSession | null {
  return readJson<ActiveWorkoutSession | null>('activeSession', null);
}

export function localSetActiveSession(session: ActiveWorkoutSession | null): void {
  writeJson('activeSession', session);
  notifyChannel('activeSession');
}

export function localSubscribeActiveSession(cb: (session: ActiveWorkoutSession | null) => void): () => void {
  cb(localGetActiveSession());
  return subscribeChannel('activeSession', () => {
    cb(localGetActiveSession());
  });
}

function getSubcollectionList<T extends Record<string, unknown>>(name: string): T[] {
  return readJson<T[]>(`sub_${name}`, []);
}

function saveSubcollectionList<T extends Record<string, unknown>>(name: string, list: T[]): void {
  writeJson(`sub_${name}`, list);
  notifyChannel(`sub_${name}`);
}

export function localGetSubcollection<T extends Record<string, unknown>>(name: string): T[] {
  return getSubcollectionList<T>(name);
}

export function localUpsertSubcollectionItem<T extends Record<string, unknown>>(
  subcollectionName: string,
  idKey: string,
  item: T
): void {
  const list = getSubcollectionList<T>(subcollectionName);
  const itemId = item[idKey];
  const idx = list.findIndex((row) => row[idKey] === itemId);
  const nowIso = new Date().toISOString();
  const stamped = {
    ...item,
    userId: item.userId ?? LOCAL_DEVICE_UID,
    createdAt: (idx >= 0 ? list[idx].createdAt : undefined) ?? item.createdAt ?? nowIso,
    updatedAt: nowIso,
  } as T;
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...stamped };
  } else {
    list.unshift(stamped);
  }
  saveSubcollectionList(subcollectionName, list);
}

export function localPatchSubcollectionItem(
  subcollectionName: string,
  idKey: string,
  id: string,
  patch: Record<string, unknown>
): void {
  const list = getSubcollectionList<Record<string, unknown>>(subcollectionName);
  const idx = list.findIndex((row) => row[idKey] === id);
  if (idx < 0) return;
  list[idx] = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  saveSubcollectionList(subcollectionName, list);
}

export function localDeleteSubcollectionItem(subcollectionName: string, idKey: string, id: string): void {
  const list = getSubcollectionList<Record<string, unknown>>(subcollectionName);
  const next = list.filter((row) => row[idKey] !== id);
  saveSubcollectionList(subcollectionName, next);
}

export function localSubscribeSubcollection<T extends object>(
  subcollectionName: string,
  cb: (items: T[]) => void,
  orderField?: string,
  orderDir: 'asc' | 'desc' = 'desc'
): () => void {
  const emit = () => {
    const list = [...getSubcollectionList<Record<string, unknown>>(subcollectionName)];
    if (orderField) {
      list.sort((a, b) => {
        const av = a[orderField];
        const bv = b[orderField];
        const aVal = typeof av === 'string' ? av : Number(av ?? 0);
        const bVal = typeof bv === 'string' ? bv : Number(bv ?? 0);
        if (aVal < bVal) return orderDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return orderDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    cb(list as unknown as T[]);
  };
  emit();
  return subscribeChannel(`sub_${subcollectionName}`, emit);
}

// Top-level Coaching & Organization Collections for Local/Offline Mode
function getColList<T extends Record<string, unknown>>(colName: string): T[] {
  return readJson<T[]>(`col_${colName}`, []);
}

function saveColList<T extends Record<string, unknown>>(colName: string, list: T[]): void {
  writeJson(`col_${colName}`, list);
  notifyChannel(`col_${colName}`);
}

export function localGetCollection<T extends Record<string, unknown>>(colName: string): T[] {
  return getColList<T>(colName);
}

export function localUpsertCollectionItem<T extends Record<string, unknown>>(
  colName: string,
  idKey: string,
  item: T
): void {
  const list = getColList<T>(colName);
  const itemId = item[idKey];
  const idx = list.findIndex((row) => row[idKey] === itemId);
  const nowIso = new Date().toISOString();
  const stamped = {
    ...item,
    createdAt: (idx >= 0 ? list[idx].createdAt : undefined) ?? item.createdAt ?? nowIso,
    updatedAt: nowIso,
  } as T;
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...stamped };
  } else {
    list.unshift(stamped);
  }
  saveColList(colName, list);
}

export function localPatchCollectionItem(
  colName: string,
  idKey: string,
  id: string,
  patch: Record<string, unknown>
): void {
  const list = getColList<Record<string, unknown>>(colName);
  const idx = list.findIndex((row) => row[idKey] === id);
  if (idx < 0) return;
  list[idx] = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  saveColList(colName, list);
}

export function localDeleteCollectionItem(colName: string, idKey: string, id: string): void {
  const list = getColList<Record<string, unknown>>(colName);
  const next = list.filter((row) => row[idKey] !== id);
  saveColList(colName, next);
}

export function localSubscribeCollection<T extends object>(
  colName: string,
  cb: (items: T[]) => void,
  filterFn?: (item: T) => boolean,
  orderField?: string,
  orderDir: 'asc' | 'desc' = 'desc'
): () => void {
  const emit = () => {
    let list = [...getColList<Record<string, unknown>>(colName)] as unknown as T[];
    if (filterFn) {
      list = list.filter(filterFn);
    }
    if (orderField) {
      list.sort((a, b) => {
        const av = (a as Record<string, unknown>)[orderField];
        const bv = (b as Record<string, unknown>)[orderField];
        const aVal = typeof av === 'string' ? av : Number(av ?? 0);
        const bVal = typeof bv === 'string' ? bv : Number(bv ?? 0);
        if (aVal < bVal) return orderDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return orderDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    cb(list);
  };
  emit();
  return subscribeChannel(`col_${colName}`, emit);
}

// Per-athlete simulated subcollections for Local/Demo Coach Inspection
export interface LocalAthleteBundle {
  sessions: WorkoutSessionHistory[];
  programs: TrainingProgram[];
  workouts: WorkoutTemplate[];
  prs: PersonalRecord[];
  goals: PerformanceGoal[];
}

export function localGetAthleteBundle(athleteUid: string): LocalAthleteBundle {
  if (athleteUid === LOCAL_DEVICE_UID) {
    return {
      sessions: getSubcollectionList<WorkoutSessionHistory & Record<string, unknown>>('sessions'),
      programs: getSubcollectionList<TrainingProgram & Record<string, unknown>>('programs'),
      workouts: getSubcollectionList<WorkoutTemplate & Record<string, unknown>>('workouts'),
      prs: getSubcollectionList<PersonalRecord & Record<string, unknown>>('personalRecords'),
      goals: getSubcollectionList<PerformanceGoal & Record<string, unknown>>('goals'),
    };
  }
  return readJson<LocalAthleteBundle>(`ath_bundle_${athleteUid}`, {
    sessions: [],
    programs: [],
    workouts: [],
    prs: [],
    goals: [],
  });
}

export function localSaveAthleteBundle(athleteUid: string, bundle: LocalAthleteBundle): void {
  if (athleteUid === LOCAL_DEVICE_UID) {
    saveSubcollectionList('sessions', bundle.sessions as unknown as Record<string, unknown>[]);
    saveSubcollectionList('programs', bundle.programs as unknown as Record<string, unknown>[]);
    saveSubcollectionList('workouts', bundle.workouts as unknown as Record<string, unknown>[]);
    saveSubcollectionList('personalRecords', bundle.prs as unknown as Record<string, unknown>[]);
    saveSubcollectionList('goals', bundle.goals as unknown as Record<string, unknown>[]);
    return;
  }
  writeJson(`ath_bundle_${athleteUid}`, bundle);
}

export function seedLocalCoachDemoCohort(
  coachUid: string,
  coachName: string,
  language: Language
): void {
  const isAr = language === 'ar';
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const isoAgo = (days: number) => new Date(now - days * dayMs).toISOString();

  const grpStrengthId = 'grp-demo-strength';
  const grpHyperId = 'grp-demo-hypertrophy';

  const demoGroups: CoachGroup[] = [
    {
      id: grpStrengthId,
      coachId: coachUid,
      name: isAr ? 'فريق القوة والأوزان' : 'Strength & Power Squad',
      description: isAr ? 'تركيز على التمارين المركبة وتطوير 1RM' : 'Compound lifts and peak strength development',
    },
    {
      id: grpHyperId,
      coachId: coachUid,
      name: isAr ? 'فريق التضخيم واللياقة' : 'Hypertrophy & Physique',
      description: isAr ? 'بناء العضلات والتناسق البدني 4-5 أيام' : 'Muscle hypertrophy and progressive volume',
    },
  ];

  demoGroups.forEach((g) => localUpsertCollectionItem('coachGroups', 'id', g as unknown as Record<string, unknown>));

  const ath1 = 'local-demo-omar';
  const ath2 = 'local-demo-sara';
  const ath3 = 'local-demo-tariq';

  const demoLinks: CoachingLink[] = [
    {
      id: 'APEX-OMAR88',
      coachId: coachUid,
      coachName,
      athleteUid: ath1,
      athleteName: isAr ? 'عمر خالد' : 'Omar Khalid',
      inviteCode: 'APEX-OMAR88',
      groupId: grpStrengthId,
      status: 'active',
      goalSummary: isAr ? 'الوصول إلى 120 كجم بنش برس وزيادة الكتلة العضلية' : 'Hit 120kg Bench Press & add lean mass',
      experienceLevel: 'advanced',
      weeklyTarget: 4,
      privateNotes: isAr ? 'استجابة ممتازة في تمارين الدفع، حافظ على RPE 8.' : 'Great pressing recovery. Keep compound sets at RPE 8.',
      assignedProgramName: isAr ? 'دفع / سحب / أرجل متقدم' : 'Upper / Lower Strength Focus',
      lastSessionAt: isoAgo(1),
      completedSessionsCount: 14,
      recentAdherencePct: 94,
      recentPrText: isAr ? 'بنش برس 105 كجم × 5' : 'Bench Press 105kg × 5',
      needsAttention: false,
    },
    {
      id: 'APEX-SARA42',
      coachId: coachUid,
      coachName,
      athleteUid: ath2,
      athleteName: isAr ? 'سارة منصور' : 'Sara Mansour',
      inviteCode: 'APEX-SARA42',
      groupId: grpHyperId,
      status: 'active',
      goalSummary: isAr ? 'تناسق الجسم ورفع اللياقة الأساسية' : 'Body recomposition & core stability',
      experienceLevel: 'intermediate',
      weeklyTarget: 4,
      privateNotes: isAr ? 'تغيب آخر 6 أيام — تحتاج رسالة متابعة.' : 'Missed last 6 days — follow up on schedule recovery.',
      assignedProgramName: isAr ? 'برنامج كامل الجسم 4 أيام' : '4-Day Balanced Hypertrophy',
      lastSessionAt: isoAgo(6),
      completedSessionsCount: 8,
      recentAdherencePct: 63,
      recentPrText: isAr ? 'سكوات بالبار 70 كجم × 8' : 'Barbell Squat 70kg × 8',
      needsAttention: true,
    },
    {
      id: 'APEX-TARIQ19',
      coachId: coachUid,
      coachName,
      athleteUid: ath3,
      athleteName: isAr ? 'طارق العلي' : 'Tariq Al-Ali',
      inviteCode: 'APEX-TARIQ19',
      groupId: grpHyperId,
      status: 'active',
      goalSummary: isAr ? 'بناء عضلات الظهر والكتفين' : 'Upper body hypertrophy & posture',
      experienceLevel: 'beginner',
      weeklyTarget: 3,
      privateNotes: isAr ? 'مبتدئ ملتزم، ركّز على التكنيك والتحكم بالمدى الحركي.' : 'Consistent beginner, focus on eccentric tempo.',
      assignedProgramName: isAr ? 'تأسيس شامل للمبتدئين' : 'Full Body Foundation',
      lastSessionAt: isoAgo(2),
      completedSessionsCount: 9,
      recentAdherencePct: 88,
      recentPrText: isAr ? 'سحب أرضي رومان 85 كجم × 8' : 'Romanian Deadlift 85kg × 8',
      needsAttention: false,
    },
    {
      id: 'APEX-DEMO',
      coachId: coachUid,
      coachName,
      athleteUid: '',
      athleteName: isAr ? 'لاعب جديد (كود تجريبي)' : 'Walk-In Trial Member',
      inviteCode: 'APEX-DEMO',
      groupId: grpStrengthId,
      status: 'pending',
      goalSummary: isAr ? 'جاهز للربط باستخدام كود APEX-DEMO' : 'Ready to link with code APEX-DEMO',
      experienceLevel: 'intermediate',
      weeklyTarget: 4,
      privateNotes: '',
      completedSessionsCount: 0,
      needsAttention: false,
    },
  ];

  demoLinks.forEach((l) => localUpsertCollectionItem('coachingLinks', 'id', l as unknown as Record<string, unknown>));

  const buildSampleSession = (
    id: string,
    athleteUid: string,
    workoutName: string,
    daysAgo: number,
    volKg: number,
    rpe: number,
    exId: string,
    exEn: string,
    exAr: string,
    weightKg: number,
    reps: number
  ): WorkoutSessionHistory => ({
    id,
    userId: athleteUid,
    coachId: coachUid,
    workoutName,
    status: 'completed',
    startedAt: isoAgo(daysAgo),
    completedAt: isoAgo(daysAgo),
    durationSeconds: 3120,
    totalSets: 14,
    totalVolumeKg: volKg,
    sessionRpe: rpe,
    notes: isAr ? 'تركيز ممتاز وتحكم بالنزول.' : 'Solid bar speed and controlled eccentric.',
    exercises: [
      {
        itemId: `${id}-ex1`,
        exerciseId: exId,
        exerciseNameEn: exEn,
        exerciseNameAr: exAr,
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps'],
        restSeconds: 120,
        notes: '',
        skipped: false,
        sets: [
          { setNumber: 1, setType: 'working', weightKg, reps, completed: true, rpe },
          { setNumber: 2, setType: 'working', weightKg, reps, completed: true, rpe },
          { setNumber: 3, setType: 'working', weightKg: Math.max(20, weightKg - 5), reps: reps + 2, completed: true, rpe },
        ],
      },
    ],
  });

  localSaveAthleteBundle(ath1, {
    sessions: [
      buildSampleSession('demo-s1', ath1, isAr ? 'يوم الدفع - القوة' : 'Upper Strength A', 1, 7840, 8, 'barbell-bench-press', 'Barbell Bench Press', 'بنش برس بالبار', 105, 5),
      buildSampleSession('demo-s2', ath1, isAr ? 'يوم الأرجل' : 'Lower Power B', 3, 9420, 8.5, 'barbell-back-squat', 'Barbell Back Squat', 'سكوات خلفي بالبار', 135, 5),
      buildSampleSession('demo-s3', ath1, isAr ? 'يوم السحب' : 'Pull & Posterior', 5, 7100, 7.5, 'barbell-bent-over-row', 'Barbell Bent-Over Row', 'تجديف بالبار', 90, 8),
      buildSampleSession('demo-s4', ath1, isAr ? 'يوم الدفع - حجم' : 'Upper Volume', 8, 8250, 8, 'barbell-bench-press', 'Barbell Bench Press', 'بنش برس بالبار', 100, 6),
    ],
    programs: [
      {
        id: 'demo-prog-1',
        userId: ath1,
        name: isAr ? 'دفع / سحب / أرجل متقدم' : 'Upper / Lower Strength Focus',
        durationWeeks: 8,
        goal: 'strength',
        level: 'advanced',
        weeklyFrequency: 4,
        splitType: 'upper_lower',
        status: 'active',
        scheduledDays: [
          { dayIndex: 0, label: 'Monday', isRestDay: false, workoutName: isAr ? 'علوي قوة' : 'Upper Strength' },
          { dayIndex: 1, label: 'Tuesday', isRestDay: false, workoutName: isAr ? 'سفلي قوة' : 'Lower Strength' },
          { dayIndex: 2, label: 'Wednesday', isRestDay: true },
          { dayIndex: 3, label: 'Thursday', isRestDay: false, workoutName: isAr ? 'علوي ضخامة' : 'Upper Hypertrophy' },
          { dayIndex: 4, label: 'Friday', isRestDay: false, workoutName: isAr ? 'سفلي ضخامة' : 'Lower Hypertrophy' },
          { dayIndex: 5, label: 'Saturday', isRestDay: true },
          { dayIndex: 6, label: 'Sunday', isRestDay: true },
        ],
        completedSessions: 14,
      },
    ],
    workouts: [],
    prs: [
      {
        exerciseId: 'barbell-bench-press',
        userId: ath1,
        exerciseNameEn: 'Barbell Bench Press',
        exerciseNameAr: 'بنش برس بالبار',
        bestWeightKg: 105,
        bestWeightReps: 5,
        bestWeightDate: isoAgo(1),
        bestWeightSessionId: 'demo-s1',
        bestReps: 10,
        bestRepsWeightKg: 90,
        bestRepsDate: isoAgo(8),
        bestRepsSessionId: 'demo-s4',
        estimated1RMKg: 122.5,
        estimated1RMWeightKg: 105,
        estimated1RMReps: 5,
        estimated1RMDate: isoAgo(1),
        estimated1RMSessionId: 'demo-s1',
        milestones: [],
      },
      {
        exerciseId: 'barbell-back-squat',
        userId: ath1,
        exerciseNameEn: 'Barbell Back Squat',
        exerciseNameAr: 'سكوات خلفي بالبار',
        bestWeightKg: 135,
        bestWeightReps: 5,
        bestWeightDate: isoAgo(3),
        bestWeightSessionId: 'demo-s2',
        bestReps: 8,
        bestRepsWeightKg: 120,
        bestRepsDate: isoAgo(10),
        bestRepsSessionId: 'demo-s2',
        estimated1RMKg: 157.5,
        estimated1RMWeightKg: 135,
        estimated1RMReps: 5,
        estimated1RMDate: isoAgo(3),
        estimated1RMSessionId: 'demo-s2',
        milestones: [],
      },
    ],
    goals: [
      {
        id: 'demo-goal-1',
        userId: ath1,
        title: isAr ? 'بنش برس 120 كجم' : '120kg Bench Press',
        targetType: 'weight',
        exerciseId: 'barbell-bench-press',
        exerciseNameEn: 'Barbell Bench Press',
        exerciseNameAr: 'بنش برس بالبار',
        targetWeightKg: 120,
        status: 'active',
        assignedByCoachId: coachUid,
      },
    ],
  });

  localSaveAthleteBundle(ath2, {
    sessions: [
      buildSampleSession('demo-s21', ath2, isAr ? 'كامل الجسم B' : 'Full Body Hypertrophy', 6, 4620, 7.5, 'barbell-back-squat', 'Barbell Back Squat', 'سكوات خلفي بالبار', 70, 8),
      buildSampleSession('demo-s22', ath2, isAr ? 'كامل الجسم A' : 'Full Body Foundations', 10, 4410, 7, 'lat-pulldown', 'Lat Pulldown', 'سحب أمامي بالكيبل', 45, 10),
    ],
    programs: [
      {
        id: 'demo-prog-2',
        userId: ath2,
        name: isAr ? 'برنامج كامل الجسم 4 أيام' : '4-Day Balanced Hypertrophy',
        durationWeeks: 8,
        goal: 'recomposition',
        level: 'intermediate',
        weeklyFrequency: 4,
        splitType: 'full_body',
        status: 'active',
        scheduledDays: WEEKDAYS_DEFAULT_SCHEDULE(),
        completedSessions: 8,
      },
    ],
    workouts: [],
    prs: [
      {
        exerciseId: 'barbell-back-squat',
        userId: ath2,
        exerciseNameEn: 'Barbell Back Squat',
        exerciseNameAr: 'سكوات خلفي بالبار',
        bestWeightKg: 70,
        bestWeightReps: 8,
        bestWeightDate: isoAgo(6),
        bestWeightSessionId: 'demo-s21',
        bestReps: 10,
        bestRepsWeightKg: 60,
        bestRepsDate: isoAgo(10),
        bestRepsSessionId: 'demo-s22',
        estimated1RMKg: 88.6,
        estimated1RMWeightKg: 70,
        estimated1RMReps: 8,
        estimated1RMDate: isoAgo(6),
        estimated1RMSessionId: 'demo-s21',
        milestones: [],
      },
    ],
    goals: [
      {
        id: 'demo-goal-2',
        userId: ath2,
        title: isAr ? 'سكوات 80 كجم × 5' : '80kg Squat × 5',
        targetType: 'weight',
        exerciseId: 'barbell-back-squat',
        exerciseNameEn: 'Barbell Back Squat',
        exerciseNameAr: 'سكوات خلفي بالبار',
        targetWeightKg: 80,
        status: 'active',
        assignedByCoachId: coachUid,
      },
    ],
  });

  localSaveAthleteBundle(ath3, {
    sessions: [
      buildSampleSession('demo-s31', ath3, isAr ? 'تأسيس علوي' : 'Upper Foundation', 2, 5180, 7.5, 'romanian-deadlift', 'Romanian Deadlift', 'سحب أرضي روماني', 85, 8),
    ],
    programs: [],
    workouts: [],
    prs: [
      {
        exerciseId: 'romanian-deadlift',
        userId: ath3,
        exerciseNameEn: 'Romanian Deadlift',
        exerciseNameAr: 'سحب أرضي روماني',
        bestWeightKg: 85,
        bestWeightReps: 8,
        bestWeightDate: isoAgo(2),
        bestWeightSessionId: 'demo-s31',
        bestReps: 10,
        bestRepsWeightKg: 75,
        bestRepsDate: isoAgo(5),
        bestRepsSessionId: 'demo-s31',
        estimated1RMKg: 107.6,
        estimated1RMWeightKg: 85,
        estimated1RMReps: 8,
        estimated1RMDate: isoAgo(2),
        estimated1RMSessionId: 'demo-s31',
        milestones: [],
      },
    ],
    goals: [],
  });

  const demoMsgs: CoachMessage[] = [
    {
      id: 'demo-msg-1',
      coachId: coachUid,
      athleteUid: ath1,
      senderId: ath1,
      senderName: isAr ? 'عمر خالد' : 'Omar Khalid',
      senderRole: 'athlete',
      type: 'direct',
      text: isAr ? 'كابتن، جبت 105 كجم × 5 اليوم بالبنش! نرفع الأسبوع الجاي إلى 107.5؟' : 'Coach, hit 105kg × 5 on bench today! Should we bump to 107.5kg next week?',
      read: false,
      createdAt: isoAgo(0.2),
    },
    {
      id: 'demo-msg-2',
      coachId: coachUid,
      athleteUid: ath2,
      senderId: coachUid,
      senderName: coachName,
      senderRole: 'coach',
      type: 'checkin',
      text: isAr ? 'مرحباً سارة، لاحظت غيابك 6 أيام. كيف مستوى طاقتك وهل تحتاجين تقليل الحجم هذا الأسبوع؟' : 'Hey Sara, noticed 6 days off. How is recovery looking — want to adjust this week to 3 sessions?',
      read: true,
      createdAt: isoAgo(1),
    },
  ];
  demoMsgs.forEach((m) => localUpsertCollectionItem('coachMessages', 'id', m as unknown as Record<string, unknown>));
}

function WEEKDAYS_DEFAULT_SCHEDULE() {
  return [
    { dayIndex: 0, label: 'Monday', isRestDay: false, workoutName: 'Day A' },
    { dayIndex: 1, label: 'Tuesday', isRestDay: true },
    { dayIndex: 2, label: 'Wednesday', isRestDay: false, workoutName: 'Day B' },
    { dayIndex: 3, label: 'Thursday', isRestDay: true },
    { dayIndex: 4, label: 'Friday', isRestDay: false, workoutName: 'Day C' },
    { dayIndex: 5, label: 'Saturday', isRestDay: false, workoutName: 'Day D' },
    { dayIndex: 6, label: 'Sunday', isRestDay: true },
  ];
}
