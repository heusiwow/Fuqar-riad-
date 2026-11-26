import {
  ActiveWorkoutSession,
  BodyMeasurement,
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
  defaults?: { language?: Language; theme?: ThemeMode; unit?: WeightUnit; role?: UserRole; roleSelected?: boolean }
): UserProfile {
  const existing = localGetProfile();
  if (existing) {
    return {
      ...existing,
      role: existing.role ?? 'athlete',
      roleSelected: existing.roleSelected ?? false,
      ageGroup: existing.ageGroup ?? 'adult',
    };
  }
  const nowIso = new Date().toISOString();
  const initialProfile: UserProfile = {
    uid: LOCAL_DEVICE_UID,
    displayName: (displayName || '').trim() || (defaults?.language === 'ar' ? 'رياضي APEX' : 'APEX Athlete'),
    role: defaults?.role ?? 'athlete',
    roleSelected: defaults?.roleSelected ?? false,
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
  measurements: BodyMeasurement[];
}

export function localGetAthleteBundle(athleteUid: string): LocalAthleteBundle {
  if (athleteUid === LOCAL_DEVICE_UID) {
    return {
      sessions: getSubcollectionList<WorkoutSessionHistory & Record<string, unknown>>('sessions'),
      programs: getSubcollectionList<TrainingProgram & Record<string, unknown>>('programs'),
      workouts: getSubcollectionList<WorkoutTemplate & Record<string, unknown>>('workouts'),
      prs: getSubcollectionList<PersonalRecord & Record<string, unknown>>('personalRecords'),
      goals: getSubcollectionList<PerformanceGoal & Record<string, unknown>>('goals'),
      measurements: getSubcollectionList<BodyMeasurement & Record<string, unknown>>('measurements'),
    };
  }
  const raw = readJson<Partial<LocalAthleteBundle>>(`ath_bundle_${athleteUid}`, {});
  return {
    sessions: raw.sessions ?? [],
    programs: raw.programs ?? [],
    workouts: raw.workouts ?? [],
    prs: raw.prs ?? [],
    goals: raw.goals ?? [],
    measurements: raw.measurements ?? [],
  };
}

export function localSaveAthleteBundle(athleteUid: string, bundle: LocalAthleteBundle): void {
  if (athleteUid === LOCAL_DEVICE_UID) {
    saveSubcollectionList('sessions', bundle.sessions as unknown as Record<string, unknown>[]);
    saveSubcollectionList('programs', bundle.programs as unknown as Record<string, unknown>[]);
    saveSubcollectionList('workouts', bundle.workouts as unknown as Record<string, unknown>[]);
    saveSubcollectionList('personalRecords', bundle.prs as unknown as Record<string, unknown>[]);
    saveSubcollectionList('goals', bundle.goals as unknown as Record<string, unknown>[]);
    saveSubcollectionList('measurements', (bundle.measurements ?? []) as unknown as Record<string, unknown>[]);
    return;
  }
  writeJson(`ath_bundle_${athleteUid}`, {
    ...bundle,
    measurements: bundle.measurements ?? [],
  });
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
      goalSummary: isAr ? 'الوصول إلى 120 كجم في ضغط الصدر بالبار وزيادة الكتلة العضلية' : 'Hit 120kg Bench Press & add lean mass',
      experienceLevel: 'advanced',
      weeklyTarget: 4,
      privateNotes: isAr ? 'استجابة ممتازة في تمارين الدفع، حافظ على شدة 8 من 10.' : 'Great pressing recovery. Keep compound sets at RPE 8.',
      assignedProgramName: isAr ? 'دفع / سحب / أرجل متقدم' : 'Upper / Lower Strength Focus',
      lastSessionAt: isoAgo(1),
      completedSessionsCount: 14,
      recentAdherencePct: 94,
      recentPrText: isAr ? 'ضغط الصدر المستوي بالبار 105 كجم × 5' : 'Bench Press 105kg × 5',
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
      privateNotes: isAr ? 'انقطاع خلال آخر 6 أيام — تحتاج رسالة متابعة.' : 'Missed last 6 days — follow up on schedule recovery.',
      assignedProgramName: isAr ? 'برنامج كامل الجسم 4 أيام' : '4-Day Balanced Hypertrophy',
      lastSessionAt: isoAgo(6),
      completedSessionsCount: 8,
      recentAdherencePct: 63,
      recentPrText: isAr ? 'القرفصاء الخلفية بالبار 70 كجم × 8' : 'Barbell Squat 70kg × 8',
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
      privateNotes: isAr ? 'مبتدئ ملتزم، ركّز على إتقان الأداء والتحكم بالمدى الحركي.' : 'Consistent beginner, focus on eccentric tempo.',
      assignedProgramName: isAr ? 'تأسيس شامل للمبتدئين' : 'Full Body Foundation',
      lastSessionAt: isoAgo(2),
      completedSessionsCount: 9,
      recentAdherencePct: 88,
      recentPrText: isAr ? 'الرفعة المميتة الرومانية بالبار 85 كجم × 8' : 'Romanian Deadlift 85kg × 8',
      needsAttention: false,
    },
    {
      id: 'APEX-DEMO',
      coachId: coachUid,
      coachName,
      athleteUid: '',
      athleteName: isAr ? 'متدرّب جديد (رمز تجريبي)' : 'Walk-In Trial Member',
      inviteCode: 'APEX-DEMO',
      groupId: grpStrengthId,
      status: 'pending',
      goalSummary: isAr ? 'جاهز للربط باستخدام الرمز APEX-DEMO' : 'Ready to link with code APEX-DEMO',
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

  const jsDay = new Date().getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const weekdayNamesEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const otherTrainIdx1 = (todayIdx + 2) % 7;
  const otherTrainIdx2 = (todayIdx + 4) % 7;

  const omarWorkoutTodayId = 'demo-wrk-omar-today';
  const omarWorkoutOtherId = 'demo-wrk-omar-lower';
  const saraWorkoutTodayId = 'demo-wrk-sara-today';
  const tariqWorkoutTodayId = 'demo-wrk-tariq-today';

  // Omar completed today's workout 2 hours ago
  const todayCompletedIso = new Date(now - 2 * 60 * 60 * 1000).toISOString();

  demoLinks[0].lastSessionAt = todayCompletedIso;
  demoLinks[0].completedSessionsCount = 15;

  localSaveAthleteBundle(ath1, {
    sessions: [
      {
        ...buildSampleSession('demo-s1', ath1, isAr ? 'تمرين الصدر والدفع' : 'Chest & Upper Push', 0, 8120, 8, 'barbell-bench-press', 'Barbell Bench Press', 'ضغط الصدر المستوي بالبار', 105, 5),
        startedAt: todayCompletedIso,
        completedAt: todayCompletedIso,
      },
      buildSampleSession('demo-s2', ath1, isAr ? 'يوم الأرجل' : 'Lower Power B', 3, 9420, 8.5, 'barbell-back-squat', 'Barbell Back Squat', 'القرفصاء الخلفية بالبار', 135, 5),
      buildSampleSession('demo-s3', ath1, isAr ? 'يوم السحب' : 'Pull & Posterior', 5, 7100, 7.5, 'barbell-bent-over-row', 'Barbell Bent-Over Row', 'التجديف المنحني بالبار للظهر', 90, 8),
      buildSampleSession('demo-s4', ath1, isAr ? 'يوم الدفع - الحجم' : 'Upper Volume', 8, 8250, 8, 'barbell-bench-press', 'Barbell Bench Press', 'ضغط الصدر المستوي بالبار', 100, 6),
    ],
    programs: [
      {
        id: 'demo-prog-1',
        userId: ath1,
        coachId: coachUid,
        name: isAr ? 'دفع / سحب / أرجل متقدم' : 'Upper / Lower Strength Focus',
        durationWeeks: 8,
        goal: 'strength',
        level: 'advanced',
        weeklyFrequency: 4,
        splitType: 'upper_lower',
        status: 'active',
        scheduledDays: weekdayNamesEn.map((lbl, idx) => {
          if (idx === todayIdx) {
            return { dayIndex: idx, label: lbl, isRestDay: false, workoutId: omarWorkoutTodayId, workoutName: isAr ? 'تمرين الصدر والدفع' : 'Chest & Upper Push' };
          }
          if (idx === otherTrainIdx1 || idx === otherTrainIdx2) {
            return { dayIndex: idx, label: lbl, isRestDay: false, workoutId: omarWorkoutOtherId, workoutName: isAr ? 'سفلي قوة وأرجل' : 'Lower Power & Legs' };
          }
          return { dayIndex: idx, label: lbl, isRestDay: true, workoutId: '', workoutName: '' };
        }),
        completedSessions: 15,
      },
    ],
    workouts: [
      {
        id: omarWorkoutTodayId,
        userId: ath1,
        coachId: coachUid,
        name: isAr ? 'تمرين الصدر والدفع' : 'Chest & Upper Push',
        description: isAr ? 'تركيز على الصدر العلوي والمستوي مع الترايسبس' : 'Heavy chest compounds with triceps finish',
        exercises: [
          { itemId: 'om-1', exerciseId: 'barbell-bench-press', exerciseNameEn: 'Barbell Bench Press', exerciseNameAr: 'ضغط الصدر المستوي بالبار', sets: 4, warmupSets: 1, targetRepsMin: 5, targetRepsMax: 8, targetWeightKg: 105, restSeconds: 180, technique: 'standard', notes: '' },
          { itemId: 'om-2', exerciseId: 'incline-dumbbell-press', exerciseNameEn: 'Incline Dumbbell Press', exerciseNameAr: 'ضغط الصدر المائل بالدامبل', sets: 3, warmupSets: 0, targetRepsMin: 8, targetRepsMax: 10, targetWeightKg: 36, restSeconds: 120, technique: 'standard', notes: '' },
          { itemId: 'om-3', exerciseId: 'cable-chest-fly', exerciseNameEn: 'Cable Chest Fly', exerciseNameAr: 'تفتيح الصدر بالكابل', sets: 3, warmupSets: 0, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 90, technique: 'standard', notes: '' },
          { itemId: 'om-4', exerciseId: 'triceps-rope-pushdown', exerciseNameEn: 'Triceps Rope Pushdown', exerciseNameAr: 'تمديد الترايسبس بالحبل على الكابل', sets: 3, warmupSets: 0, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 90, technique: 'standard', notes: '' },
        ],
      },
      {
        id: omarWorkoutOtherId,
        userId: ath1,
        coachId: coachUid,
        name: isAr ? 'سفلي قوة وأرجل' : 'Lower Power & Legs',
        description: '',
        exercises: [
          { itemId: 'om-5', exerciseId: 'barbell-back-squat', exerciseNameEn: 'Barbell Back Squat', exerciseNameAr: 'القرفصاء الخلفية بالبار', sets: 4, warmupSets: 1, targetRepsMin: 5, targetRepsMax: 8, targetWeightKg: 135, restSeconds: 180, technique: 'standard', notes: '' },
          { itemId: 'om-6', exerciseId: 'romanian-deadlift', exerciseNameEn: 'Romanian Deadlift', exerciseNameAr: 'الرفعة المميتة الرومانية بالبار للفخذ الخلفي', sets: 3, warmupSets: 0, targetRepsMin: 8, targetRepsMax: 10, targetWeightKg: 105, restSeconds: 150, technique: 'standard', notes: '' },
        ],
      },
    ],
    prs: [
      {
        exerciseId: 'barbell-bench-press',
        userId: ath1,
        exerciseNameEn: 'Barbell Bench Press',
        exerciseNameAr: 'ضغط الصدر المستوي بالبار',
        bestWeightKg: 105,
        bestWeightReps: 5,
        bestWeightDate: isoAgo(0),
        bestWeightSessionId: 'demo-s1',
        bestReps: 10,
        bestRepsWeightKg: 90,
        bestRepsDate: isoAgo(8),
        bestRepsSessionId: 'demo-s4',
        estimated1RMKg: 122.5,
        estimated1RMWeightKg: 105,
        estimated1RMReps: 5,
        estimated1RMDate: isoAgo(0),
        estimated1RMSessionId: 'demo-s1',
        milestones: [],
      },
      {
        exerciseId: 'barbell-back-squat',
        userId: ath1,
        exerciseNameEn: 'Barbell Back Squat',
        exerciseNameAr: 'القرفصاء الخلفية بالبار',
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
        title: isAr ? 'ضغط الصدر المستوي بالبار 120 كجم' : '120kg Bench Press',
        targetType: 'weight',
        exerciseId: 'barbell-bench-press',
        exerciseNameEn: 'Barbell Bench Press',
        exerciseNameAr: 'ضغط الصدر المستوي بالبار',
        targetWeightKg: 120,
        status: 'active',
        assignedByCoachId: coachUid,
      },
    ],
    measurements: [
      { id: 'demo-m-om1', userId: ath1, coachId: coachUid, date: isoAgo(2).slice(0, 10), bodyWeightKg: 82.4, chestCm: 108, armCm: 40.5, waistCm: 81, thighCm: 61, notes: isAr ? 'تطور ممتاز بالكتلة العضلية' : 'Steady lean gain' },
      { id: 'demo-m-om2', userId: ath1, coachId: coachUid, date: isoAgo(21).slice(0, 10), bodyWeightKg: 81.1, chestCm: 106.5, armCm: 39.8, waistCm: 81.5, thighCm: 60 },
    ],
  });

  localSaveAthleteBundle(ath2, {
    sessions: [
      buildSampleSession('demo-s21', ath2, isAr ? 'كامل الجسم ب' : 'Full Body Hypertrophy', 6, 4620, 7.5, 'barbell-back-squat', 'Barbell Back Squat', 'القرفصاء الخلفية بالبار', 70, 8),
      buildSampleSession('demo-s22', ath2, isAr ? 'كامل الجسم أ' : 'Full Body Foundations', 10, 4410, 7, 'lat-pulldown', 'Lat Pulldown', 'السحب العالي للظهر أمام الصدر بالكابل', 45, 10),
    ],
    programs: [
      {
        id: 'demo-prog-2',
        userId: ath2,
        coachId: coachUid,
        name: isAr ? 'برنامج كامل الجسم 4 أيام' : '4-Day Balanced Hypertrophy',
        durationWeeks: 8,
        goal: 'recomposition',
        level: 'intermediate',
        weeklyFrequency: 4,
        splitType: 'full_body',
        status: 'active',
        scheduledDays: weekdayNamesEn.map((lbl, idx) =>
          idx === todayIdx || idx === otherTrainIdx1 || idx === otherTrainIdx2
            ? { dayIndex: idx, label: lbl, isRestDay: false, workoutId: saraWorkoutTodayId, workoutName: isAr ? 'أرجل وظهر متوازن' : 'Lower & Back Balance' }
            : { dayIndex: idx, label: lbl, isRestDay: true, workoutId: '', workoutName: '' }
        ),
        completedSessions: 8,
      },
    ],
    workouts: [
      {
        id: saraWorkoutTodayId,
        userId: ath2,
        coachId: coachUid,
        name: isAr ? 'أرجل وظهر متوازن' : 'Lower & Back Balance',
        description: '',
        exercises: [
          { itemId: 'sr-1', exerciseId: 'barbell-back-squat', exerciseNameEn: 'Barbell Back Squat', exerciseNameAr: 'القرفصاء الخلفية بالبار', sets: 3, warmupSets: 1, targetRepsMin: 8, targetRepsMax: 10, targetWeightKg: 70, restSeconds: 150, technique: 'standard', notes: '' },
          { itemId: 'sr-2', exerciseId: 'lat-pulldown', exerciseNameEn: 'Lat Pulldown', exerciseNameAr: 'السحب العالي للظهر أمام الصدر بالكابل', sets: 3, warmupSets: 0, targetRepsMin: 10, targetRepsMax: 12, targetWeightKg: 45, restSeconds: 90, technique: 'standard', notes: '' },
          { itemId: 'sr-3', exerciseId: 'dumbbell-lateral-raise', exerciseNameEn: 'Dumbbell Lateral Raise', exerciseNameAr: 'الرفرفة الجانبية بالدامبل للكتف', sets: 3, warmupSets: 0, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 75, technique: 'standard', notes: '' },
        ],
      },
    ],
    prs: [
      {
        exerciseId: 'barbell-back-squat',
        userId: ath2,
        exerciseNameEn: 'Barbell Back Squat',
        exerciseNameAr: 'القرفصاء الخلفية بالبار',
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
        title: isAr ? 'القرفصاء الخلفية بالبار 80 كجم × 5' : '80kg Squat × 5',
        targetType: 'weight',
        exerciseId: 'barbell-back-squat',
        exerciseNameEn: 'Barbell Back Squat',
        exerciseNameAr: 'القرفصاء الخلفية بالبار',
        targetWeightKg: 80,
        status: 'active',
        assignedByCoachId: coachUid,
      },
    ],
    measurements: [
      { id: 'demo-m-sr1', userId: ath2, coachId: coachUid, date: isoAgo(7).slice(0, 10), bodyWeightKg: 63.2, waistCm: 71, thighCm: 56 },
    ],
  });

  localSaveAthleteBundle(ath3, {
    sessions: [
      buildSampleSession('demo-s31', ath3, isAr ? 'تأسيس علوي' : 'Upper Foundation', 2, 5180, 7.5, 'romanian-deadlift', 'Romanian Deadlift', 'الرفعة المميتة الرومانية بالبار للفخذ الخلفي', 85, 8),
    ],
    programs: [
      {
        id: 'demo-prog-3',
        userId: ath3,
        coachId: coachUid,
        name: isAr ? 'تأسيس شامل للمبتدئين' : 'Full Body Foundation',
        durationWeeks: 6,
        goal: 'hypertrophy',
        level: 'beginner',
        weeklyFrequency: 3,
        splitType: 'full_body',
        status: 'active',
        scheduledDays: weekdayNamesEn.map((lbl, idx) =>
          idx === todayIdx || idx === otherTrainIdx1
            ? { dayIndex: idx, label: lbl, isRestDay: false, workoutId: tariqWorkoutTodayId, workoutName: isAr ? 'تمرين الظهر والكتف' : 'Back & Shoulders Foundation' }
            : { dayIndex: idx, label: lbl, isRestDay: true, workoutId: '', workoutName: '' }
        ),
        completedSessions: 9,
      },
    ],
    workouts: [
      {
        id: tariqWorkoutTodayId,
        userId: ath3,
        coachId: coachUid,
        name: isAr ? 'تمرين الظهر والكتف' : 'Back & Shoulders Foundation',
        description: '',
        exercises: [
          { itemId: 'tr-1', exerciseId: 'lat-pulldown', exerciseNameEn: 'Lat Pulldown', exerciseNameAr: 'السحب العالي للظهر أمام الصدر بالكابل', sets: 3, warmupSets: 1, targetRepsMin: 10, targetRepsMax: 12, targetWeightKg: 50, restSeconds: 120, technique: 'standard', notes: '' },
          { itemId: 'tr-2', exerciseId: 'seated-cable-row', exerciseNameEn: 'Seated Cable Row', exerciseNameAr: 'التجديف الجالس بالكابل للظهر', sets: 3, warmupSets: 0, targetRepsMin: 10, targetRepsMax: 12, targetWeightKg: 45, restSeconds: 90, technique: 'standard', notes: '' },
          { itemId: 'tr-3', exerciseId: 'seated-dumbbell-shoulder-press', exerciseNameEn: 'Seated Dumbbell Shoulder Press', exerciseNameAr: 'ضغط الكتف بالدامبل جالساً', sets: 3, warmupSets: 0, targetRepsMin: 8, targetRepsMax: 12, targetWeightKg: 16, restSeconds: 120, technique: 'standard', notes: '' },
        ],
      },
    ],
    prs: [
      {
        exerciseId: 'romanian-deadlift',
        userId: ath3,
        exerciseNameEn: 'Romanian Deadlift',
        exerciseNameAr: 'الرفعة المميتة الرومانية بالبار للفخذ الخلفي',
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
    measurements: [
      { id: 'demo-m-tr1', userId: ath3, coachId: coachUid, date: isoAgo(4).slice(0, 10), bodyWeightKg: 74.5, chestCm: 99, armCm: 36, waistCm: 80 },
    ],
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
      text: isAr ? 'مدرب، حققت اليوم 105 كجم × 5 في ضغط الصدر المستوي بالبار! هل نرفع الوزن الأسبوع القادم إلى 107.5 كجم؟' : 'Coach, hit 105kg × 5 on bench today! Should we bump to 107.5kg next week?',
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
