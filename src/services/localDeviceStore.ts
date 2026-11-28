import {
  ActiveWorkoutSession,
  BodyMeasurement,
  GymSubscriptionRecord,
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
  return Boolean(uid && uid === LOCAL_DEVICE_UID);
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

// Purge any previously cached virtual demo athletes/subscriptions from localStorage
(function purgeLegacyVirtualDemoData() {
  try {
    if (typeof localStorage === 'undefined') return;
    const demoLinkIds = new Set(['APEX-OMAR88', 'APEX-SARA42', 'APEX-TARIQ19', 'APEX-DEMO']);
    const demoAthUids = new Set(['local-demo-omar', 'local-demo-sara', 'local-demo-tariq']);

    const links = readJson<Record<string, unknown>[]>('col_coachingLinks', []);
    const cleanLinks = links.filter(
      (l) => !demoLinkIds.has(String(l.id || '')) && !demoAthUids.has(String(l.athleteUid || ''))
    );
    if (cleanLinks.length !== links.length) {
      writeJson('col_coachingLinks', cleanLinks);
    }

    const groups = readJson<Record<string, unknown>[]>('col_coachGroups', []);
    const cleanGroups = groups.filter(
      (g) => g.id !== 'grp-demo-strength' && g.id !== 'grp-demo-hypertrophy'
    );
    if (cleanGroups.length !== groups.length) {
      writeJson('col_coachGroups', cleanGroups);
    }

    const msgs = readJson<Record<string, unknown>[]>('col_coachMessages', []);
    const cleanMsgs = msgs.filter(
      (m) => m.id !== 'demo-msg-1' && m.id !== 'demo-msg-2' && !demoAthUids.has(String(m.athleteUid || ''))
    );
    if (cleanMsgs.length !== msgs.length) {
      writeJson('col_coachMessages', cleanMsgs);
    }

    const subs = readJson<GymSubscriptionRecord[]>('col_gymSubscriptions', []);
    const cleanSubs = subs.filter(
      (s) => !String(s.id || '').startsWith('demo-sub-') && !demoAthUids.has(String(s.athleteUid || ''))
    );
    if (cleanSubs.length !== subs.length) {
      writeJson('col_gymSubscriptions', cleanSubs);
    }

    demoAthUids.forEach((uid) => {
      localStorage.removeItem(`${LOCAL_PREFIX}ath_bundle_${uid}`);
    });
  } catch {
    // Ignore storage access issues
  }
})();

