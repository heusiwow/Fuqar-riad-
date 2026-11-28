import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromCache,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { commitWithOfflineSupport, db, handleFirestoreError, OperationType, storage } from '../lib/firebase';
import {
  ActiveWorkoutSession,
  BodyMeasurement,
  CoachAssignment,
  CoachGroup,
  CoachingLink,
  CoachMessage,
  CoachProfileCode,
  CoachSubscriptionTier,
  Exercise,
  ExerciseFlag,
  ExerciseNote,
  GymOrganization,
  GymSubscriptionRecord,
  Language,
  ManualMacroLog,
  NotificationSettings,
  OrganizationMember,
  PerformanceGoal,
  PersonalRecord,
  ProgramStatus,
  ThemeMode,
  TrainingProgram,
  UserProfile,
  UserReminder,
  UserRole,
  WeightUnit,
  WorkoutSessionHistory,
  WorkoutTemplate,
} from '../types/ironlog';
import { evaluatePersonalRecord } from '../utils/calculations';
import { formatArabicCount } from '../i18n/translations';
import {
  isLocalDeviceModeEnabled,
  isLocalDeviceUid,
  LOCAL_DEVICE_UID,
  localDeleteCollectionItem,
  localDeleteSubcollectionItem,
  localEnsureUserProfile,
  localGetAthleteBundle,
  localGetCollection,
  localGetSubcollection,
  localPatchCollectionItem,
  localPatchSubcollectionItem,
  localSaveAthleteBundle,
  localSetActiveSession,
  localSubscribeActiveSession,
  localSubscribeCollection,
  localSubscribeProfile,
  localSubscribeSubcollection,
  localUpdateProfile,
  localUpsertCollectionItem,
  localUpsertSubcollectionItem,
} from './localDeviceStore';

export function generateSafeId(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}-${ts}-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

function clampString(val: string | undefined, max: number): string {
  return (val ?? '').trim().slice(0, max);
}

function clampNumber(val: number | undefined, min: number, max: number): number | undefined {
  if (val === undefined || val === null || Number.isNaN(val)) return undefined;
  return Math.min(max, Math.max(min, val));
}

// Local recovery key for active session
export function getLocalActiveSessionKey(uid: string): string {
  return `ironlog_active_session_${uid}`;
}

export function saveLocalActiveSession(uid: string, session: ActiveWorkoutSession | null): void {
  try {
    const key = getLocalActiveSessionKey(uid);
    if (!session) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(session));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function loadLocalActiveSession(uid: string): ActiveWorkoutSession | null {
  try {
    const raw = localStorage.getItem(getLocalActiveSessionKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveWorkoutSession;
    if (parsed && parsed.userId === uid && parsed.sessionId) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCachedProfile(uid: string, profile: UserProfile): void {
  try {
    localStorage.setItem(`apex_cached_profile_${uid}`, JSON.stringify(profile));
  } catch {
    // Ignore quota errors
  }
}

export function loadCachedProfile(uid: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(`apex_cached_profile_${uid}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (parsed && parsed.uid === uid) return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function ensureUserProfile(
  uid: string,
  displayName: string,
  email: string,
  defaults?: { language?: Language; theme?: ThemeMode; unit?: WeightUnit; role?: UserRole }
): Promise<UserProfile> {
  if (isLocalDeviceUid(uid)) {
    return localEnsureUserProfile(displayName, defaults);
  }
  const userPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/info`;
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const cachedLocal = loadCachedProfile(uid);

  try {
    const userRef = doc(db, 'users', uid);

    if (isOffline) {
      try {
        const cachedSnap = await getDocFromCache(userRef);
        if (cachedSnap.exists()) {
          const data = cachedSnap.data() as UserProfile;
          return {
            ...data,
            role: data.role ?? (email.toLowerCase() === 'abdulhamidraghad093@gmail.com' ? 'gym_admin' : 'athlete'),
            roleSelected: data.roleSelected ?? (email.toLowerCase() === 'abdulhamidraghad093@gmail.com' ? true : false),
            ageGroup: data.ageGroup ?? 'adult',
          };
        }
      } catch {
        // Fallback to localStorage cached profile below
      }
      if (cachedLocal) {
        return cachedLocal;
      }
    }

    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      const hydrated: UserProfile = {
        ...data,
        role: data.role ?? (email.toLowerCase() === 'abdulhamidraghad093@gmail.com' ? 'gym_admin' : 'athlete'),
        roleSelected: data.roleSelected ?? (email.toLowerCase() === 'abdulhamidraghad093@gmail.com' ? true : false),
        ageGroup: data.ageGroup ?? 'adult',
      };
      saveCachedProfile(uid, hydrated);
      return hydrated;
    }

    const isBootstrapAdmin = email.toLowerCase() === 'abdulhamidraghad093@gmail.com';
    const initialRole: UserRole = isBootstrapAdmin ? 'gym_admin' : defaults?.role ?? 'athlete';
    const safeName = clampString(displayName || email.split('@')[0] || 'Athlete', 100) || 'Athlete';
    const initialProfile: UserProfile = {
      uid,
      displayName: safeName,
      role: initialRole,
      roleSelected: isBootstrapAdmin,
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
    };

    const batch = writeBatch(db);
    batch.set(userRef, {
      ...initialProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'private', 'info'), {
      uid,
      email: clampString(email, 254),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await commitWithOfflineSupport(batch.commit());
    saveCachedProfile(uid, initialProfile);
    return initialProfile;
  } catch (error) {
    if (cachedLocal) {
      return cachedLocal;
    }
    handleFirestoreError(error, OperationType.WRITE, `${userPath} | ${privatePath}`);
  }
}

export async function updateUserProfileSettings(
  uid: string,
  updates: Partial<
    Pick<
      UserProfile,
      | 'displayName'
      | 'role'
      | 'roleSelected'
      | 'ageGroup'
      | 'language'
      | 'theme'
      | 'unit'
      | 'heightCm'
      | 'weightKg'
      | 'experienceLevel'
      | 'trainingAgeMonths'
      | 'weeklyFrequency'
      | 'trainingGoal'
      | 'preferredSplit'
      | 'personalNotes'
      | 'notificationSettings'
    >
  >
): Promise<void> {
  const path = `users/${uid}`;
  try {
    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (updates.displayName !== undefined) payload.displayName = clampString(updates.displayName, 100) || 'Athlete';
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.roleSelected !== undefined) payload.roleSelected = Boolean(updates.roleSelected);
    if (updates.ageGroup !== undefined) payload.ageGroup = updates.ageGroup;
    if (updates.language !== undefined) payload.language = updates.language;
    if (updates.theme !== undefined) payload.theme = updates.theme;
    if (updates.unit !== undefined) payload.unit = updates.unit;
    if (updates.heightCm !== undefined) {
      const h = clampNumber(updates.heightCm, 50, 280);
      if (h !== undefined) payload.heightCm = h;
    }
    if (updates.weightKg !== undefined) {
      const w = clampNumber(updates.weightKg, 20, 400);
      if (w !== undefined) payload.weightKg = w;
    }
    if (updates.experienceLevel !== undefined) payload.experienceLevel = updates.experienceLevel;
    if (updates.trainingAgeMonths !== undefined) {
      const m = clampNumber(updates.trainingAgeMonths, 0, 960);
      if (m !== undefined) payload.trainingAgeMonths = m;
    }
    if (updates.weeklyFrequency !== undefined) {
      const f = clampNumber(updates.weeklyFrequency, 1, 14);
      if (f !== undefined) payload.weeklyFrequency = f;
    }
    if (updates.trainingGoal !== undefined) payload.trainingGoal = updates.trainingGoal;
    if (updates.preferredSplit !== undefined) payload.preferredSplit = updates.preferredSplit;
    if (updates.personalNotes !== undefined) payload.personalNotes = clampString(updates.personalNotes, 1000);
    if (updates.notificationSettings !== undefined) {
      payload.notificationSettings = {
        scheduledWorkout: Boolean(updates.notificationSettings.scheduledWorkout),
        programSchedule: Boolean(updates.notificationSettings.programSchedule),
        personalRecord: Boolean(updates.notificationSettings.personalRecord),
        workoutCompletion: Boolean(updates.notificationSettings.workoutCompletion),
        coachFeedback: Boolean(updates.notificationSettings.coachFeedback ?? true),
        programChange: Boolean(updates.notificationSettings.programChange ?? true),
        goalMilestone: Boolean(updates.notificationSettings.goalMilestone ?? true),
        missedWorkout: Boolean(updates.notificationSettings.missedWorkout ?? true),
        teamAnnouncement: Boolean(updates.notificationSettings.teamAnnouncement ?? true),
        checkinReminder: Boolean(updates.notificationSettings.checkinReminder ?? true),
      };
    }

    if (isLocalDeviceUid(uid)) {
      const localUpdates: Partial<UserProfile> = {};
      if (updates.displayName !== undefined) localUpdates.displayName = payload.displayName as string;
      if (updates.role !== undefined) localUpdates.role = updates.role;
      if (updates.roleSelected !== undefined) localUpdates.roleSelected = Boolean(updates.roleSelected);
      if (updates.ageGroup !== undefined) localUpdates.ageGroup = updates.ageGroup;
      if (updates.language !== undefined) localUpdates.language = updates.language;
      if (updates.theme !== undefined) localUpdates.theme = updates.theme;
      if (updates.unit !== undefined) localUpdates.unit = updates.unit;
      if (payload.heightCm !== undefined) localUpdates.heightCm = payload.heightCm as number;
      if (payload.weightKg !== undefined) localUpdates.weightKg = payload.weightKg as number;
      if (updates.experienceLevel !== undefined) localUpdates.experienceLevel = updates.experienceLevel;
      if (payload.trainingAgeMonths !== undefined) localUpdates.trainingAgeMonths = payload.trainingAgeMonths as number;
      if (payload.weeklyFrequency !== undefined) localUpdates.weeklyFrequency = payload.weeklyFrequency as number;
      if (updates.trainingGoal !== undefined) localUpdates.trainingGoal = updates.trainingGoal;
      if (updates.preferredSplit !== undefined) localUpdates.preferredSplit = updates.preferredSplit;
      if (payload.personalNotes !== undefined) localUpdates.personalNotes = payload.personalNotes as string;
      if (payload.notificationSettings !== undefined) {
        localUpdates.notificationSettings = payload.notificationSettings as UserProfile['notificationSettings'];
      }
      localUpdateProfile(localUpdates);
      return;
    }

    await commitWithOfflineSupport(updateDoc(doc(db, 'users', uid), payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserFavorites(uid: string, favoriteExerciseIds: string[]): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localUpdateProfile({ favoriteExerciseIds: favoriteExerciseIds.slice(0, 200) });
    return;
  }
  const path = `users/${uid}`;
  try {
    await commitWithOfflineSupport(
      updateDoc(doc(db, 'users', uid), {
        favoriteExerciseIds: favoriteExerciseIds.slice(0, 200),
        updatedAt: serverTimestamp(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function setActiveProgramId(uid: string, activeProgramId: string): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localUpdateProfile({ activeProgramId: clampString(activeProgramId, 128) });
    return;
  }
  const path = `users/${uid}`;
  try {
    await commitWithOfflineSupport(
      updateDoc(doc(db, 'users', uid), {
        activeProgramId: clampString(activeProgramId, 128),
        updatedAt: serverTimestamp(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Custom Exercises
export async function saveCustomExercise(
  uid: string,
  exercise: Omit<Exercise, 'userId' | 'isCustom' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean
): Promise<void> {
  const path = `users/${uid}/customExercises/${exercise.id}`;
  try {
    const refDoc = doc(db, 'users', uid, 'customExercises', exercise.id);
    const payload = {
      id: exercise.id,
      userId: uid,
      nameEn: clampString(exercise.nameEn, 120) || 'Custom Exercise',
      nameAr: clampString(exercise.nameAr || exercise.nameEn, 120) || 'تمرين مخصص',
      primaryMuscles: exercise.primaryMuscles.slice(0, 5),
      secondaryMuscles: exercise.secondaryMuscles.slice(0, 8),
      equipment: exercise.equipment,
      category: exercise.category,
      difficulty: exercise.difficulty,
      startingPositionEn: clampString(exercise.startingPositionEn, 600),
      startingPositionAr: clampString(exercise.startingPositionAr, 600),
      instructionsEn: exercise.instructionsEn.slice(0, 15).map((s) => clampString(s, 300)).filter(Boolean),
      instructionsAr: exercise.instructionsAr.slice(0, 15).map((s) => clampString(s, 300)).filter(Boolean),
      breathingEn: clampString(exercise.breathingEn, 400),
      breathingAr: clampString(exercise.breathingAr, 400),
      commonMistakesEn: exercise.commonMistakesEn.slice(0, 10).map((s) => clampString(s, 300)).filter(Boolean),
      commonMistakesAr: exercise.commonMistakesAr.slice(0, 10).map((s) => clampString(s, 300)).filter(Boolean),
      safetyEn: clampString(exercise.safetyEn, 400),
      safetyAr: clampString(exercise.safetyAr, 400),
      personalNotes: clampString(exercise.personalNotes, 1000),
      alternativeIds: exercise.alternativeIds.slice(0, 10),
      updatedAt: serverTimestamp(),
    };

    if (isLocalDeviceUid(uid)) {
      localUpsertSubcollectionItem('customExercises', 'id', payload as Record<string, unknown>);
      return;
    }

    if (isEdit) {
      await commitWithOfflineSupport(updateDoc(refDoc, payload));
    } else {
      await commitWithOfflineSupport(setDoc(refDoc, { ...payload, createdAt: serverTimestamp() }));
    }
  } catch (error) {
    handleFirestoreError(error, isEdit ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteCustomExercise(uid: string, exerciseId: string): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localDeleteSubcollectionItem('customExercises', 'id', exerciseId);
    return;
  }
  const path = `users/${uid}/customExercises/${exerciseId}`;
  try {
    await commitWithOfflineSupport(deleteDoc(doc(db, 'users', uid, 'customExercises', exerciseId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Exercise Personal Notes
export async function saveExerciseNote(uid: string, note: Omit<ExerciseNote, 'userId' | 'updatedAt'>): Promise<void> {
  const path = `users/${uid}/exerciseNotes/${note.exerciseId}`;
  try {
    const payload = {
      exerciseId: note.exerciseId,
      userId: uid,
      personalInstructions: clampString(note.personalInstructions, 1000),
      notes: clampString(note.notes, 1000),
      preferredAlternativeIds: note.preferredAlternativeIds.slice(0, 10),
      updatedAt: serverTimestamp(),
    };
    if (isLocalDeviceUid(uid)) {
      localUpsertSubcollectionItem('exerciseNotes', 'exerciseId', payload as Record<string, unknown>);
      return;
    }
    const refDoc = doc(db, 'users', uid, 'exerciseNotes', note.exerciseId);
    await commitWithOfflineSupport(setDoc(refDoc, payload, { merge: true }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Workout Templates
export async function saveWorkoutTemplate(
  uid: string,
  workout: Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean,
  coachId?: string
): Promise<void> {
  const path = `users/${uid}/workouts/${workout.id}`;
  try {
    const refDoc = doc(db, 'users', uid, 'workouts', workout.id);
    const sanitizedExercises = workout.exercises.slice(0, 40).map((item) => {
      const row: Record<string, unknown> = {
        itemId: clampString(item.itemId, 128),
        exerciseId: clampString(item.exerciseId, 128),
        exerciseNameEn: clampString(item.exerciseNameEn, 120),
        exerciseNameAr: clampString(item.exerciseNameAr, 120),
        sets: clampNumber(item.sets, 1, 20) ?? 3,
        warmupSets: clampNumber(item.warmupSets, 0, 10) ?? 0,
        targetRepsMin: clampNumber(item.targetRepsMin, 1, 100) ?? 8,
        targetRepsMax: clampNumber(item.targetRepsMax, 1, 100) ?? 12,
        restSeconds: clampNumber(item.restSeconds, 0, 600) ?? 90,
        technique: item.technique ?? 'standard',
        supersetGroup: clampString(item.supersetGroup, 12),
        notes: clampString(item.notes, 400),
      };
      if (item.targetWeightKg !== undefined && item.targetWeightKg > 0) {
        row.targetWeightKg = clampNumber(item.targetWeightKg, 0, 2000);
      }
      if (item.targetRpe !== undefined && item.targetRpe > 0) {
        row.targetRpe = clampNumber(item.targetRpe, 1, 10);
      }
      if (item.targetRir !== undefined && item.targetRir >= 0) {
        row.targetRir = clampNumber(item.targetRir, 0, 10);
      }
      return row;
    });

    if (isLocalDeviceUid(uid)) {
      localUpsertSubcollectionItem('workouts', 'id', {
        id: workout.id,
        userId: uid,
        name: clampString(workout.name, 120) || 'Workout',
        description: clampString(workout.description, 600),
        exercises: sanitizedExercises,
        ...(coachId ? { coachId } : {}),
        ...(workout.isAiGenerated ? { isAiGenerated: true } : {}),
        ...(workout.assignedByCoachId ? { assignedByCoachId: workout.assignedByCoachId } : {}),
      });
      return;
    }

    if (isEdit) {
      const updatePayload: Record<string, unknown> = {
        name: clampString(workout.name, 120) || 'Workout',
        description: clampString(workout.description, 600),
        exercises: sanitizedExercises,
        updatedAt: serverTimestamp(),
      };
      if (coachId) updatePayload.coachId = coachId;
      await commitWithOfflineSupport(updateDoc(refDoc, updatePayload));
    } else {
      const createPayload: Record<string, unknown> = {
        id: workout.id,
        userId: uid,
        name: clampString(workout.name, 120) || 'Workout',
        description: clampString(workout.description, 600),
        exercises: sanitizedExercises,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (coachId) createPayload.coachId = coachId;
      if (workout.isAiGenerated) createPayload.isAiGenerated = true;
      if (workout.assignedByCoachId) createPayload.assignedByCoachId = workout.assignedByCoachId;
      await commitWithOfflineSupport(setDoc(refDoc, createPayload));
    }
  } catch (error) {
    handleFirestoreError(error, isEdit ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteWorkoutTemplate(uid: string, workoutId: string): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localDeleteSubcollectionItem('workouts', 'id', workoutId);
    return;
  }
  const path = `users/${uid}/workouts/${workoutId}`;
  try {
    await commitWithOfflineSupport(deleteDoc(doc(db, 'users', uid, 'workouts', workoutId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Training Programs
export async function saveTrainingProgram(
  uid: string,
  program: Omit<TrainingProgram, 'userId' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean,
  coachId?: string
): Promise<void> {
  const path = `users/${uid}/programs/${program.id}`;
  try {
    const refDoc = doc(db, 'users', uid, 'programs', program.id);
    const sanitizedDays = program.scheduledDays.slice(0, 7).map((d, idx) => ({
      dayIndex: idx,
      label: clampString(d.label, 40),
      isRestDay: Boolean(d.isRestDay),
      workoutId: d.isRestDay ? '' : clampString(d.workoutId, 128),
      workoutName: d.isRestDay ? '' : clampString(d.workoutName, 120),
    }));

    if (isLocalDeviceUid(uid)) {
      localUpsertSubcollectionItem('programs', 'id', {
        id: program.id,
        userId: uid,
        name: clampString(program.name, 120) || 'Training Program',
        durationWeeks: clampNumber(program.durationWeeks, 1, 104) ?? 8,
        goal: program.goal,
        level: program.level,
        weeklyFrequency: clampNumber(program.weeklyFrequency, 1, 7) ?? 4,
        splitType: program.splitType,
        status: program.status,
        scheduledDays: sanitizedDays,
        completedSessions: program.completedSessions ?? 0,
        startDate: clampString(program.startDate || new Date().toISOString().slice(0, 10), 40),
        ...(coachId ? { coachId } : {}),
        ...(program.isAiGenerated ? { isAiGenerated: true } : {}),
        ...(program.assignedByCoachId ? { assignedByCoachId: program.assignedByCoachId } : {}),
        ...(program.assignedByCoachName ? { assignedByCoachName: clampString(program.assignedByCoachName, 100) } : {}),
        ...(program.intensityGuidance ? { intensityGuidance: clampString(program.intensityGuidance, 600) } : {}),
        ...(program.progressionApproach ? { progressionApproach: clampString(program.progressionApproach, 600) } : {}),
        ...(program.deloadGuidance ? { deloadGuidance: clampString(program.deloadGuidance, 600) } : {}),
        ...(program.philosophy ? { philosophy: program.philosophy } : {}),
        ...(program.sourceTemplateId ? { sourceTemplateId: clampString(program.sourceTemplateId, 128) } : {}),
        ...(program.originNote ? { originNote: clampString(program.originNote, 400) } : {}),
      });
      return;
    }

    if (isEdit) {
      const updatePayload: Record<string, unknown> = {
        name: clampString(program.name, 120) || 'Training Program',
        durationWeeks: clampNumber(program.durationWeeks, 1, 104) ?? 8,
        goal: program.goal,
        level: program.level,
        weeklyFrequency: clampNumber(program.weeklyFrequency, 1, 7) ?? 4,
        splitType: program.splitType,
        scheduledDays: sanitizedDays,
        startDate: clampString(program.startDate, 40),
        updatedAt: serverTimestamp(),
      };
      if (coachId) updatePayload.coachId = coachId;
      if (program.intensityGuidance) updatePayload.intensityGuidance = clampString(program.intensityGuidance, 600);
      if (program.progressionApproach) updatePayload.progressionApproach = clampString(program.progressionApproach, 600);
      if (program.deloadGuidance) updatePayload.deloadGuidance = clampString(program.deloadGuidance, 600);
      if (program.philosophy === 'modern' || program.philosophy === 'old_school' || program.philosophy === 'hybrid') {
        updatePayload.philosophy = program.philosophy;
      }
      if (program.sourceTemplateId) updatePayload.sourceTemplateId = clampString(program.sourceTemplateId, 128);
      if (program.originNote) updatePayload.originNote = clampString(program.originNote, 400);
      await commitWithOfflineSupport(updateDoc(refDoc, updatePayload));
    } else {
      const createPayload: Record<string, unknown> = {
        id: program.id,
        userId: uid,
        name: clampString(program.name, 120) || 'Training Program',
        durationWeeks: clampNumber(program.durationWeeks, 1, 104) ?? 8,
        goal: program.goal,
        level: program.level,
        weeklyFrequency: clampNumber(program.weeklyFrequency, 1, 7) ?? 4,
        splitType: program.splitType,
        status: program.status,
        scheduledDays: sanitizedDays,
        completedSessions: program.completedSessions ?? 0,
        startDate: clampString(program.startDate || new Date().toISOString().slice(0, 10), 40),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (coachId) createPayload.coachId = coachId;
      if (program.isAiGenerated) createPayload.isAiGenerated = true;
      if (program.assignedByCoachId) createPayload.assignedByCoachId = program.assignedByCoachId;
      if (program.assignedByCoachName) createPayload.assignedByCoachName = clampString(program.assignedByCoachName, 100);
      if (program.intensityGuidance) createPayload.intensityGuidance = clampString(program.intensityGuidance, 600);
      if (program.progressionApproach) createPayload.progressionApproach = clampString(program.progressionApproach, 600);
      if (program.deloadGuidance) createPayload.deloadGuidance = clampString(program.deloadGuidance, 600);
      if (program.philosophy === 'modern' || program.philosophy === 'old_school' || program.philosophy === 'hybrid') {
        createPayload.philosophy = program.philosophy;
      }
      if (program.sourceTemplateId) createPayload.sourceTemplateId = clampString(program.sourceTemplateId, 128);
      if (program.originNote) createPayload.originNote = clampString(program.originNote, 400);
      await commitWithOfflineSupport(setDoc(refDoc, createPayload));
    }
  } catch (error) {
    handleFirestoreError(error, isEdit ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function updateProgramStatus(uid: string, programId: string, status: ProgramStatus): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localPatchSubcollectionItem('programs', 'id', programId, { status });
    return;
  }
  const path = `users/${uid}/programs/${programId}`;
  try {
    await commitWithOfflineSupport(
      updateDoc(doc(db, 'users', uid, 'programs', programId), {
        status,
        updatedAt: serverTimestamp(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTrainingProgram(uid: string, programId: string): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localDeleteSubcollectionItem('programs', 'id', programId);
    return;
  }
  const path = `users/${uid}/programs/${programId}`;
  try {
    await commitWithOfflineSupport(deleteDoc(doc(db, 'users', uid, 'programs', programId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Active Session Live Tracking
export async function createActiveSession(uid: string, session: ActiveWorkoutSession): Promise<void> {
  const path = `users/${uid}/activeSession/current`;
  saveLocalActiveSession(uid, session);
  if (isLocalDeviceUid(uid)) {
    localSetActiveSession(session);
    return;
  }
  try {
    const refDoc = doc(db, 'users', uid, 'activeSession', 'current');
    await commitWithOfflineSupport(
      setDoc(refDoc, {
        sessionId: session.sessionId,
        userId: uid,
        workoutId: clampString(session.workoutId, 128),
        workoutName: clampString(session.workoutName, 120) || 'Live Workout',
        programId: clampString(session.programId, 128),
        programName: clampString(session.programName, 120),
        startedAtMs: session.startedAtMs,
        pausedAtMs: session.pausedAtMs ?? null,
        accumulatedPauseMs: session.accumulatedPauseMs ?? 0,
        isPaused: Boolean(session.isPaused),
        currentExerciseIndex: clampNumber(session.currentExerciseIndex, 0, 50) ?? 0,
        notes: clampString(session.notes, 1000),
        exercises: session.exercises.slice(0, 40),
        updatedAt: serverTimestamp(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateActiveSessionState(uid: string, session: ActiveWorkoutSession): Promise<void> {
  const path = `users/${uid}/activeSession/current`;
  saveLocalActiveSession(uid, session);
  if (isLocalDeviceUid(uid)) {
    localSetActiveSession(session);
    return;
  }
  try {
    const refDoc = doc(db, 'users', uid, 'activeSession', 'current');
    await commitWithOfflineSupport(
      updateDoc(refDoc, {
        pausedAtMs: session.pausedAtMs ?? null,
        accumulatedPauseMs: session.accumulatedPauseMs ?? 0,
        isPaused: Boolean(session.isPaused),
        currentExerciseIndex: clampNumber(session.currentExerciseIndex, 0, 50) ?? 0,
        notes: clampString(session.notes, 1000),
        exercises: session.exercises.slice(0, 40),
        updatedAt: serverTimestamp(),
      })
    );
  } catch (error) {
    try {
      await createActiveSession(uid, session);
      return;
    } catch {
      // fall through to standard error handler
    }
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function discardActiveSession(uid: string): Promise<void> {
  const path = `users/${uid}/activeSession/current`;
  saveLocalActiveSession(uid, null);
  if (isLocalDeviceUid(uid)) {
    localSetActiveSession(null);
    return;
  }
  try {
    await commitWithOfflineSupport(deleteDoc(doc(db, 'users', uid, 'activeSession', 'current')));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Complete Workout Session + Evaluate PRs + Goals + Program Count + Reminders
export async function completeWorkoutSession(
  uid: string,
  session: ActiveWorkoutSession,
  durationSeconds: number,
  existingPRs: Record<string, PersonalRecord>,
  notificationSettings: NotificationSettings,
  activeProgram?: TrainingProgram | null,
  options?: { sessionRpe?: number | null; coachId?: string; goals?: PerformanceGoal[] }
): Promise<{
  savedSession: WorkoutSessionHistory;
  unlockedPRs: { exerciseNameEn: string; exerciseNameAr: string; types: ('weight' | 'reps' | 'estimated_1rm')[] }[];
}> {
  const sessionId = session.sessionId || generateSafeId('sess');
  const completedAtIso = new Date().toISOString();
  const startedAtIso = new Date(session.startedAtMs).toISOString();

  let totalSets = 0;
  let totalVolumeKg = 0;
  const unlockedPRs: { exerciseNameEn: string; exerciseNameAr: string; types: ('weight' | 'reps' | 'estimated_1rm')[] }[] = [];
  const prUpdates: { record: PersonalRecord; isNew: boolean }[] = [];
  const latestRecordsByEx: Record<string, PersonalRecord> = { ...existingPRs };

  const finalizedExercises = session.exercises.slice(0, 40).map((ex) => {
    if (ex.skipped) return ex;
    const completedSets = ex.sets.filter((s) => s.completed);
    totalSets += completedSets.length;
    for (const s of completedSets) {
      totalVolumeKg += (s.weightKg || 0) * (s.reps || 0);
    }

    const existingPR = existingPRs[ex.exerciseId];
    const { record, newPRTypes } = evaluatePersonalRecord(
      existingPR,
      ex.exerciseId,
      ex.exerciseNameEn,
      ex.exerciseNameAr,
      completedSets,
      sessionId,
      completedAtIso,
      uid
    );
    latestRecordsByEx[ex.exerciseId] = record;

    if (newPRTypes.length > 0) {
      unlockedPRs.push({
        exerciseNameEn: ex.exerciseNameEn,
        exerciseNameAr: ex.exerciseNameAr,
        types: newPRTypes,
      });
      prUpdates.push({ record, isNew: !existingPR });
    }

    const flaggedSets = ex.sets.map((s) => {
      if (!s.completed) return s;
      const hitWeightPR = newPRTypes.includes('weight') && s.weightKg === record.bestWeightKg;
      return { ...s, isPR: hitWeightPR };
    });

    return { ...ex, sets: flaggedSets };
  });

  const savedSession: WorkoutSessionHistory = {
    id: sessionId,
    userId: uid,
    ...(options?.coachId ? { coachId: options.coachId } : {}),
    workoutId: clampString(session.workoutId, 128),
    workoutName: clampString(session.workoutName, 120) || 'Workout Session',
    programId: clampString(session.programId, 128),
    programName: clampString(session.programName, 120),
    status: 'completed',
    startedAt: startedAtIso,
    completedAt: completedAtIso,
    durationSeconds: clampNumber(durationSeconds, 0, 86400) ?? 0,
    totalSets: clampNumber(totalSets, 0, 1000) ?? 0,
    totalVolumeKg: Math.round((clampNumber(totalVolumeKg, 0, 1000000) ?? 0) * 10) / 10,
    sessionRpe: options?.sessionRpe ?? null,
    notes: clampString(session.notes, 1000),
    exercises: finalizedExercises,
  };

  const sessionPath = `users/${uid}/sessions/${sessionId}`;
  if (isLocalDeviceUid(uid)) {
    localUpsertSubcollectionItem('sessions', 'id', savedSession as unknown as Record<string, unknown>);
    for (const prItem of prUpdates) {
      localUpsertSubcollectionItem('personalRecords', 'exerciseId', prItem.record as unknown as Record<string, unknown>);
    }
    if (options?.goals?.length) {
      for (const goal of options.goals) {
        if (goal.status !== 'active' || !goal.exerciseId) continue;
        const rec = latestRecordsByEx[goal.exerciseId];
        if (!rec) continue;
        const hit =
          (goal.targetType === 'weight' && goal.targetWeightKg && rec.bestWeightKg >= goal.targetWeightKg) ||
          (goal.targetType === 'reps' && goal.targetReps && rec.bestReps >= goal.targetReps) ||
          (goal.targetType === 'estimated_1rm' && goal.targetWeightKg && rec.estimated1RMKg >= goal.targetWeightKg);
        if (hit) {
          localPatchSubcollectionItem('goals', 'id', goal.id, { status: 'achieved' });
          if (notificationSettings.goalMilestone ?? true) {
            const remId = generateSafeId('remgoal');
            localUpsertSubcollectionItem('reminders', 'id', {
              id: remId,
              userId: uid,
              type: 'goal_milestone',
              titleEn: `Goal achieved: ${goal.title}`.slice(0, 120),
              titleAr: `تم تحقيق الهدف: ${goal.title}`.slice(0, 120),
              messageEn: `Congratulations! You reached your target for ${goal.exerciseNameEn || goal.title}.`.slice(0, 300),
              messageAr: `أحسنت! حققت هدفك في ${goal.exerciseNameAr || goal.title}.`.slice(0, 300),
              read: false,
            });
          }
        }
      }
    }
    if (activeProgram && (!session.programId || session.programId === activeProgram.id)) {
      localPatchSubcollectionItem('programs', 'id', activeProgram.id, {
        completedSessions: (activeProgram.completedSessions || 0) + 1,
      });
    }
    if (notificationSettings.workoutCompletion) {
      const remId = generateSafeId('rem');
      localUpsertSubcollectionItem('reminders', 'id', {
        id: remId,
        userId: uid,
        type: 'workout_completed',
        titleEn: `Workout completed: ${savedSession.workoutName}`.slice(0, 120),
        titleAr: `تم إتمام التمرين: ${savedSession.workoutName}`.slice(0, 120),
        messageEn: `Logged ${savedSession.totalSets} completed sets.`.slice(0, 300),
        messageAr: `تم تسجيل ${formatArabicCount(savedSession.totalSets, 'جولة', 'جولتين', 'جولات', 'جولة')} بنجاح.`.slice(0, 300),
        read: false,
      });
    }
    if (notificationSettings.personalRecord && unlockedPRs.length > 0) {
      const remId = generateSafeId('rempr');
      const namesEn = unlockedPRs.map((p) => p.exerciseNameEn).join(', ');
      const namesAr = unlockedPRs.map((p) => p.exerciseNameAr).join('، ');
      localUpsertSubcollectionItem('reminders', 'id', {
        id: remId,
        userId: uid,
        type: 'personal_record',
        titleEn: `New Personal Record (${unlockedPRs.length})`.slice(0, 120),
        titleAr: `رقم قياسي جديد (${unlockedPRs.length})`.slice(0, 120),
        messageEn: `Achieved new personal bests in: ${namesEn}`.slice(0, 300),
        messageAr: `تم تحقيق أرقام قياسية جديدة في: ${namesAr}`.slice(0, 300),
        read: false,
      });
    }
    if (options?.coachId) {
      const localLinks = localGetCollection<CoachingLink & Record<string, unknown>>('coachingLinks');
      for (const l of localLinks) {
        if (l.athleteUid === uid && l.status === 'active') {
          localPatchCollectionItem('coachingLinks', 'id', l.id, {
            lastSessionAt: completedAtIso,
            completedSessionsCount: (l.completedSessionsCount ?? 0) + 1,
            ...(unlockedPRs.length > 0 ? { recentPrText: unlockedPRs[0].exerciseNameEn.slice(0, 150) } : {}),
          });
        }
      }
    }
    localSetActiveSession(null);
    saveLocalActiveSession(uid, null);
    return { savedSession, unlockedPRs };
  }

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', uid, 'sessions', sessionId), {
      ...savedSession,
      createdAt: serverTimestamp(),
    });

    for (const prItem of prUpdates) {
      const prRef = doc(db, 'users', uid, 'personalRecords', prItem.record.exerciseId);
      const prPayload: Record<string, unknown> = {
        ...prItem.record,
        ...(options?.coachId ? { coachId: options.coachId } : {}),
        updatedAt: serverTimestamp(),
      };
      if (prItem.isNew) {
        batch.set(prRef, prPayload);
      } else {
        batch.update(prRef, prPayload);
      }
    }

    // Check active performance goals for milestone completion
    if (options?.goals?.length) {
      for (const goal of options.goals) {
        if (goal.status !== 'active' || !goal.exerciseId) continue;
        const rec = latestRecordsByEx[goal.exerciseId];
        if (!rec) continue;
        const hit =
          (goal.targetType === 'weight' && goal.targetWeightKg && rec.bestWeightKg >= goal.targetWeightKg) ||
          (goal.targetType === 'reps' && goal.targetReps && rec.bestReps >= goal.targetReps) ||
          (goal.targetType === 'estimated_1rm' && goal.targetWeightKg && rec.estimated1RMKg >= goal.targetWeightKg);
        if (hit) {
          batch.update(doc(db, 'users', uid, 'goals', goal.id), {
            status: 'achieved',
            updatedAt: serverTimestamp(),
          });
          if (notificationSettings.goalMilestone ?? true) {
            const remId = generateSafeId('remgoal');
            batch.set(doc(db, 'users', uid, 'reminders', remId), {
              id: remId,
              userId: uid,
              type: 'goal_milestone',
              titleEn: `Goal achieved: ${goal.title}`.slice(0, 120),
              titleAr: `تم تحقيق الهدف: ${goal.title}`.slice(0, 120),
              messageEn: `Congratulations! You reached your target for ${goal.exerciseNameEn || goal.title}.`.slice(0, 300),
              messageAr: `أحسنت! حققت هدفك في ${goal.exerciseNameAr || goal.title}.`.slice(0, 300),
              read: false,
              createdAt: serverTimestamp(),
            });
          }
        }
      }
    }

    if (activeProgram && (!session.programId || session.programId === activeProgram.id)) {
      const nextCompleted = (activeProgram.completedSessions || 0) + 1;
      batch.update(doc(db, 'users', uid, 'programs', activeProgram.id), {
        completedSessions: nextCompleted,
        updatedAt: serverTimestamp(),
      });
    }

    if (notificationSettings.workoutCompletion) {
      const remId = generateSafeId('rem');
      batch.set(doc(db, 'users', uid, 'reminders', remId), {
        id: remId,
        userId: uid,
        type: 'workout_completed',
        titleEn: `Workout completed: ${savedSession.workoutName}`.slice(0, 120),
        titleAr: `تم إتمام التمرين: ${savedSession.workoutName}`.slice(0, 120),
        messageEn: `Logged ${savedSession.totalSets} completed sets.`.slice(0, 300),
        messageAr: `تم تسجيل ${formatArabicCount(savedSession.totalSets, 'جولة', 'جولتين', 'جولات', 'جولة')} بنجاح.`.slice(0, 300),
        read: false,
        createdAt: serverTimestamp(),
      });
    }

    if (notificationSettings.personalRecord && unlockedPRs.length > 0) {
      const remId = generateSafeId('rempr');
      const namesEn = unlockedPRs.map((p) => p.exerciseNameEn).join(', ');
      const namesAr = unlockedPRs.map((p) => p.exerciseNameAr).join('، ');
      batch.set(doc(db, 'users', uid, 'reminders', remId), {
        id: remId,
        userId: uid,
        type: 'personal_record',
        titleEn: `New Personal Record (${unlockedPRs.length})`.slice(0, 120),
        titleAr: `رقم قياسي جديد (${unlockedPRs.length})`.slice(0, 120),
        messageEn: `Achieved new personal bests in: ${namesEn}`.slice(0, 300),
        messageAr: `تم تحقيق أرقام قياسية جديدة في: ${namesAr}`.slice(0, 300),
        read: false,
        createdAt: serverTimestamp(),
      });
    }

    batch.delete(doc(db, 'users', uid, 'activeSession', 'current'));
    await commitWithOfflineSupport(batch.commit());
    saveLocalActiveSession(uid, null);

    // Best-effort sync to coach roster card if linked and online
    if (options?.coachId && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const linksSnap = await getDocs(
          query(collection(db, 'coachingLinks'), where('athleteUid', '==', uid), where('status', '==', 'active'))
        );
        for (const linkDoc of linksSnap.docs) {
          const cur = linkDoc.data() as CoachingLink;
          await updateDoc(linkDoc.ref, {
            lastSessionAt: completedAtIso,
            completedSessionsCount: (cur.completedSessionsCount ?? 0) + 1,
            ...(unlockedPRs.length > 0 ? { recentPrText: unlockedPRs[0].exerciseNameEn.slice(0, 150) } : {}),
            updatedAt: serverTimestamp(),
          });
        }
      } catch {
        // non-blocking roster summary sync
      }
    }

    return { savedSession, unlockedPRs };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, sessionPath);
  }
}

export async function deleteSessionHistory(uid: string, sessionId: string): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localDeleteSubcollectionItem('sessions', 'id', sessionId);
    return;
  }
  const path = `users/${uid}/sessions/${sessionId}`;
  try {
    await commitWithOfflineSupport(deleteDoc(doc(db, 'users', uid, 'sessions', sessionId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Body Measurements & Private Progress Photos
export async function saveBodyMeasurement(
  uid: string,
  measurement: Omit<BodyMeasurement, 'userId' | 'createdAt'>,
  photoFile?: File | null,
  coachId?: string
): Promise<void> {
  const path = `users/${uid}/measurements/${measurement.id}`;
  try {
    let photoPath = '';
    let photoUrl = '';
    if (photoFile) {
      if (isLocalDeviceUid(uid)) {
        if (photoFile.size <= 1_500_000) {
          photoUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(photoFile);
          });
        }
      } else {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new Error('Photo upload requires an internet connection. Save measurements without photo while offline.');
        }
        const safeFileName = `${measurement.id}_${Date.now()}_${photoFile.name.replace(/[^a-zA-Z0-9._-]/g, '')}`.slice(0, 120);
        photoPath = `users/${uid}/progress/${safeFileName}`;
        const storageRef = ref(storage, photoPath);
        await uploadBytes(storageRef, photoFile, { contentType: photoFile.type });
        photoUrl = await getDownloadURL(storageRef);
      }
    }

    const resolvedCoachId = clampString(coachId || measurement.coachId, 128);
    const payload: Record<string, unknown> = {
      id: measurement.id,
      userId: uid,
      ...(resolvedCoachId ? { coachId: resolvedCoachId } : {}),
      date: clampString(measurement.date, 40),
      createdAt: serverTimestamp(),
    };
    if (measurement.bodyWeightKg !== undefined) {
      const v = clampNumber(measurement.bodyWeightKg, 20, 400);
      if (v !== undefined) payload.bodyWeightKg = v;
    }
    if (measurement.armCm !== undefined) {
      const v = clampNumber(measurement.armCm, 10, 120);
      if (v !== undefined) payload.armCm = v;
    }
    if (measurement.chestCm !== undefined) {
      const v = clampNumber(measurement.chestCm, 30, 250);
      if (v !== undefined) payload.chestCm = v;
    }
    if (measurement.waistCm !== undefined) {
      const v = clampNumber(measurement.waistCm, 30, 250);
      if (v !== undefined) payload.waistCm = v;
    }
    if (measurement.thighCm !== undefined) {
      const v = clampNumber(measurement.thighCm, 20, 150);
      if (v !== undefined) payload.thighCm = v;
    }
    if (measurement.customLabel) payload.customLabel = clampString(measurement.customLabel, 80);
    if (measurement.customValue !== undefined) {
      const v = clampNumber(measurement.customValue, 0, 1000);
      if (v !== undefined) payload.customValue = v;
    }
    if (measurement.notes) payload.notes = clampString(measurement.notes, 500);
    if (photoPath) {
      payload.photoPath = clampString(photoPath, 500);
      payload.photoUrl = clampString(photoUrl, 1000);
      payload.isPrivatePhoto = true;
    } else if (photoUrl) {
      payload.photoUrl = photoUrl;
      payload.isPrivatePhoto = true;
    }

    if (isLocalDeviceUid(uid)) {
      localUpsertSubcollectionItem('measurements', 'id', payload);
      return;
    }

    await commitWithOfflineSupport(setDoc(doc(db, 'users', uid, 'measurements', measurement.id), payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteBodyMeasurement(uid: string, measurement: BodyMeasurement): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localDeleteSubcollectionItem('measurements', 'id', measurement.id);
    return;
  }
  const path = `users/${uid}/measurements/${measurement.id}`;
  try {
    if (measurement.photoPath && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        await deleteObject(ref(storage, measurement.photoPath));
      } catch {
        // Photo may already be removed
      }
    }
    await commitWithOfflineSupport(deleteDoc(doc(db, 'users', uid, 'measurements', measurement.id)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Manual Macros
export async function saveManualMacroLog(
  uid: string,
  log: Omit<ManualMacroLog, 'userId' | 'updatedAt'>
): Promise<void> {
  const path = `users/${uid}/macros/${log.dateKey}`;
  try {
    const payload = {
      dateKey: log.dateKey,
      userId: uid,
      proteinGrams: clampNumber(log.proteinGrams, 0, 2000) ?? 0,
      carbsGrams: clampNumber(log.carbsGrams, 0, 3000) ?? 0,
      fatGrams: clampNumber(log.fatGrams, 0, 1000) ?? 0,
      notes: clampString(log.notes, 300),
      updatedAt: serverTimestamp(),
    };
    if (isLocalDeviceUid(uid)) {
      localUpsertSubcollectionItem('macros', 'dateKey', payload as Record<string, unknown>);
      return;
    }
    const refDoc = doc(db, 'users', uid, 'macros', log.dateKey);
    await commitWithOfflineSupport(setDoc(refDoc, payload, { merge: true }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteManualMacroLog(uid: string, dateKey: string): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localDeleteSubcollectionItem('macros', 'dateKey', dateKey);
    return;
  }
  const path = `users/${uid}/macros/${dateKey}`;
  try {
    await commitWithOfflineSupport(deleteDoc(doc(db, 'users', uid, 'macros', dateKey)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Reminders
export async function createReminder(
  uid: string,
  reminder: Omit<UserReminder, 'userId' | 'createdAt'>
): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localUpsertSubcollectionItem('reminders', 'id', {
      ...reminder,
      userId: uid,
      titleEn: clampString(reminder.titleEn, 120),
      titleAr: clampString(reminder.titleAr, 120),
      messageEn: clampString(reminder.messageEn, 300),
      messageAr: clampString(reminder.messageAr, 300),
    });
    return;
  }
  const path = `users/${uid}/reminders/${reminder.id}`;
  try {
    await commitWithOfflineSupport(
      setDoc(doc(db, 'users', uid, 'reminders', reminder.id), {
        ...reminder,
        userId: uid,
        titleEn: clampString(reminder.titleEn, 120),
        titleAr: clampString(reminder.titleAr, 120),
        messageEn: clampString(reminder.messageEn, 300),
        messageAr: clampString(reminder.messageAr, 300),
        createdAt: serverTimestamp(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function markReminderRead(uid: string, reminderId: string): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localPatchSubcollectionItem('reminders', 'id', reminderId, { read: true });
    return;
  }
  const path = `users/${uid}/reminders/${reminderId}`;
  try {
    await commitWithOfflineSupport(
      updateDoc(doc(db, 'users', uid, 'reminders', reminderId), {
        read: true,
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReminder(uid: string, reminderId: string): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    localDeleteSubcollectionItem('reminders', 'id', reminderId);
    return;
  }
  const path = `users/${uid}/reminders/${reminderId}`;
  try {
    await commitWithOfflineSupport(deleteDoc(doc(db, 'users', uid, 'reminders', reminderId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscriptions
export function subscribeUserProfile(uid: string, cb: (profile: UserProfile | null) => void): Unsubscribe {
  if (isLocalDeviceUid(uid)) {
    return localSubscribeProfile(cb);
  }
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      cb(snap.exists() ? (snap.data() as UserProfile) : null);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export function subscribeUserSubcollection<T extends object>(
  uid: string,
  subcollectionName: string,
  cb: (items: T[]) => void,
  orderField?: string,
  orderDir: 'asc' | 'desc' = 'desc'
): Unsubscribe {
  if (isLocalDeviceUid(uid)) {
    return localSubscribeSubcollection(subcollectionName, cb, orderField, orderDir);
  }
  const path = `users/${uid}/${subcollectionName}`;
  const colRef = collection(db, 'users', uid, subcollectionName);
  const q = query(colRef, where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as T);
      if (orderField) {
        list.sort((a, b) => {
          const av = (a as Record<string, unknown>)[orderField];
          const bv = (b as Record<string, unknown>)[orderField];
          const aNum =
            av && typeof av === 'object' && 'toMillis' in av
              ? (av as { toMillis: () => number }).toMillis()
              : typeof av === 'string'
                ? av
                : Number(av ?? 0);
          const bNum =
            bv && typeof bv === 'object' && 'toMillis' in bv
              ? (bv as { toMillis: () => number }).toMillis()
              : typeof bv === 'string'
                ? bv
                : Number(bv ?? 0);
          if (aNum < bNum) return orderDir === 'asc' ? -1 : 1;
          if (aNum > bNum) return orderDir === 'asc' ? 1 : -1;
          return 0;
        });
      }
      cb(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeActiveSession(uid: string, cb: (session: ActiveWorkoutSession | null) => void): Unsubscribe {
  if (isLocalDeviceUid(uid)) {
    return localSubscribeActiveSession(cb);
  }
  const path = `users/${uid}/activeSession/current`;
  return onSnapshot(
    doc(db, 'users', uid, 'activeSession', 'current'),
    (snap) => {
      if (snap.exists()) {
        const remote = snap.data() as ActiveWorkoutSession;
        saveLocalActiveSession(uid, remote);
        cb(remote);
      } else {
        cb(null);
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

// Performance Goals
export async function savePerformanceGoal(
  uid: string,
  goal: Omit<PerformanceGoal, 'userId' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean,
  coachId?: string
): Promise<void> {
  const path = `users/${uid}/goals/${goal.id}`;
  try {
    const base: Record<string, unknown> = {
      title: clampString(goal.title, 160) || 'Performance Target',
      targetType: goal.targetType,
      status: goal.status,
      notes: clampString(goal.notes, 500),
      updatedAt: serverTimestamp(),
    };
    if (coachId) base.coachId = coachId;
    if (goal.exerciseId) base.exerciseId = clampString(goal.exerciseId, 128);
    if (goal.exerciseNameEn) base.exerciseNameEn = clampString(goal.exerciseNameEn, 120);
    if (goal.exerciseNameAr) base.exerciseNameAr = clampString(goal.exerciseNameAr, 120);
    if (goal.targetWeightKg !== undefined) base.targetWeightKg = clampNumber(goal.targetWeightKg, 0, 2000) ?? 0;
    if (goal.targetReps !== undefined) base.targetReps = clampNumber(goal.targetReps, 0, 1000) ?? 0;
    if (goal.targetDate) base.targetDate = clampString(goal.targetDate, 40);

    if (isLocalDeviceUid(uid)) {
      const localGoal: PerformanceGoal = {
        ...goal,
        userId: uid,
        title: clampString(goal.title, 160) || 'Performance Target',
        notes: clampString(goal.notes, 500),
        updatedAt: new Date().toISOString(),
        createdAt: (goal as Partial<PerformanceGoal>).createdAt ?? new Date().toISOString(),
      };
      if (uid === LOCAL_DEVICE_UID) {
        localUpsertSubcollectionItem('goals', 'id', {
          ...localGoal,
          ...(coachId ? { coachId } : {}),
        } as unknown as Record<string, unknown>);
      } else {
        const bundle = localGetAthleteBundle(uid);
        const idx = bundle.goals.findIndex((g) => g.id === goal.id);
        if (idx >= 0) bundle.goals[idx] = { ...bundle.goals[idx], ...localGoal };
        else bundle.goals.unshift(localGoal);
        localSaveAthleteBundle(uid, bundle);
      }
      return;
    }

    const refDoc = doc(db, 'users', uid, 'goals', goal.id);
    if (isEdit) {
      await commitWithOfflineSupport(updateDoc(refDoc, base));
    } else {
      await commitWithOfflineSupport(
        setDoc(refDoc, {
          ...base,
          id: goal.id,
          userId: uid,
          ...(goal.assignedByCoachId ? { assignedByCoachId: goal.assignedByCoachId } : {}),
          createdAt: serverTimestamp(),
        })
      );
    }
  } catch (error) {
    handleFirestoreError(error, isEdit ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deletePerformanceGoal(uid: string, goalId: string): Promise<void> {
  if (isLocalDeviceUid(uid)) {
    if (uid === LOCAL_DEVICE_UID) {
      localDeleteSubcollectionItem('goals', 'id', goalId);
    } else {
      const bundle = localGetAthleteBundle(uid);
      bundle.goals = bundle.goals.filter((g) => g.id !== goalId);
      localSaveAthleteBundle(uid, bundle);
    }
    return;
  }
  const path = `users/${uid}/goals/${goalId}`;
  try {
    await commitWithOfflineSupport(deleteDoc(doc(db, 'users', uid, 'goals', goalId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Coach Groups
export async function saveCoachGroup(
  coachId: string,
  group: Omit<CoachGroup, 'coachId' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean
): Promise<void> {
  if (isLocalDeviceUid(coachId)) {
    localUpsertCollectionItem('coachGroups', 'id', {
      id: group.id,
      coachId,
      name: clampString(group.name, 100) || 'Squad',
      description: clampString(group.description, 400),
      ...(group.organizationId ? { organizationId: group.organizationId } : {}),
    });
    return;
  }
  const path = `coachGroups/${group.id}`;
  try {
    const refDoc = doc(db, 'coachGroups', group.id);
    if (isEdit) {
      await updateDoc(refDoc, {
        name: clampString(group.name, 100) || 'Squad',
        description: clampString(group.description, 400),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(refDoc, {
        id: group.id,
        coachId,
        name: clampString(group.name, 100) || 'Squad',
        description: clampString(group.description, 400),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isEdit ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteCoachGroup(groupId: string): Promise<void> {
  if (isLocalDeviceModeEnabled() || localGetCollection('coachGroups').some((g) => g.id === groupId)) {
    localDeleteCollectionItem('coachGroups', 'id', groupId);
    return;
  }
  try {
    await deleteDoc(doc(db, 'coachGroups', groupId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `coachGroups/${groupId}`);
  }
}

export function subscribeCoachGroups(coachId: string, cb: (groups: CoachGroup[]) => void): Unsubscribe {
  if (isLocalDeviceUid(coachId)) {
    return localSubscribeCollection<CoachGroup>(
      'coachGroups',
      cb,
      (g) => g.coachId === coachId,
      'updatedAt',
      'desc'
    );
  }
  const q = query(collection(db, 'coachGroups'), where('coachId', '==', coachId));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as CoachGroup)),
    (err) => handleFirestoreError(err, OperationType.LIST, 'coachGroups')
  );
}

// Coaching Links & Invite Codes (Doc ID = inviteCode for O(1) secure lookup)
export function generateInviteCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  const chars = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `APEX-${chars}${num}`;
}

export async function createCoachingLinkInvite(
  coachId: string,
  coachName: string,
  athleteName: string,
  details?: {
    groupId?: string;
    goalSummary?: string;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    weeklyTarget?: number;
    privateNotes?: string;
  }
): Promise<CoachingLink> {
  const inviteCode = generateInviteCode();
  const path = `coachingLinks/${inviteCode}`;
  const link: CoachingLink = {
    id: inviteCode,
    coachId,
    coachName: clampString(coachName, 100) || 'Coach',
    athleteUid: '',
    athleteName: clampString(athleteName, 100) || 'Athlete',
    inviteCode,
    groupId: details?.groupId ? clampString(details.groupId, 128) : '',
    status: 'pending',
    goalSummary: clampString(details?.goalSummary, 300),
    experienceLevel: details?.experienceLevel ?? 'intermediate',
    weeklyTarget: clampNumber(details?.weeklyTarget, 1, 14) ?? 4,
    privateNotes: clampString(details?.privateNotes, 1000),
    completedSessionsCount: 0,
    needsAttention: false,
  };
  if (isLocalDeviceUid(coachId)) {
    localUpsertCollectionItem('coachingLinks', 'id', link as unknown as Record<string, unknown>);
    return link;
  }
  try {
    await setDoc(doc(db, 'coachingLinks', inviteCode), {
      ...link,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return link;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCoachingLink(
  linkId: string,
  updates: Partial<
    Pick<
      CoachingLink,
      | 'athleteName'
      | 'groupId'
      | 'status'
      | 'goalSummary'
      | 'experienceLevel'
      | 'weeklyTarget'
      | 'privateNotes'
      | 'assignedProgramName'
      | 'needsAttention'
      | 'recentAdherencePct'
    >
  >
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.athleteName !== undefined) payload.athleteName = clampString(updates.athleteName, 100);
  if (updates.groupId !== undefined) payload.groupId = clampString(updates.groupId, 128);
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.goalSummary !== undefined) payload.goalSummary = clampString(updates.goalSummary, 300);
  if (updates.experienceLevel !== undefined) payload.experienceLevel = updates.experienceLevel;
  if (updates.weeklyTarget !== undefined) payload.weeklyTarget = clampNumber(updates.weeklyTarget, 1, 14);
  if (updates.privateNotes !== undefined) payload.privateNotes = clampString(updates.privateNotes, 1000);
  if (updates.assignedProgramName !== undefined) payload.assignedProgramName = clampString(updates.assignedProgramName, 120);
  if (updates.needsAttention !== undefined) payload.needsAttention = Boolean(updates.needsAttention);
  if (updates.recentAdherencePct !== undefined) payload.recentAdherencePct = clampNumber(updates.recentAdherencePct, 0, 100);

  if (isLocalDeviceModeEnabled() || localGetCollection('coachingLinks').some((l) => l.id === linkId)) {
    localPatchCollectionItem('coachingLinks', 'id', linkId, payload);
    return;
  }

  const path = `coachingLinks/${linkId}`;
  try {
    await updateDoc(doc(db, 'coachingLinks', linkId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCoachingLink(linkId: string): Promise<void> {
  if (isLocalDeviceModeEnabled() || localGetCollection('coachingLinks').some((l) => l.id === linkId)) {
    localDeleteCollectionItem('coachingLinks', 'id', linkId);
    return;
  }
  try {
    await deleteDoc(doc(db, 'coachingLinks', linkId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `coachingLinks/${linkId}`);
  }
}

export async function unlinkCoachAccount(athleteUid: string, linkId?: string): Promise<void> {
  if (isLocalDeviceUid(athleteUid)) {
    localUpdateProfile({ coachId: '', coachName: '' });
    if (linkId) {
      localPatchCollectionItem('coachingLinks', 'id', linkId, { status: 'archived' });
    }
    return;
  }
  const path = `users/${athleteUid}`;
  try {
    await updateDoc(doc(db, 'users', athleteUid), {
      coachId: '',
      coachName: '',
      updatedAt: serverTimestamp(),
    });
    if (linkId) {
      try {
        await updateDoc(doc(db, 'coachingLinks', linkId), {
          status: 'archived',
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Link might already be archived or removed by coach
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function extractJoinCodeFromInput(rawInput: string): string {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) return '';
  try {
    if (trimmed.includes('://') || trimmed.includes('?')) {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://apex.local/${trimmed.replace(/^\/+/, '')}`);
      const qCode = url.searchParams.get('join') || url.searchParams.get('coach') || url.searchParams.get('code');
      if (qCode) {
        return qCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      }
    }
  } catch {
    // Fallback to raw code parsing
  }
  return trimmed.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

async function backfillCoachIdForAthlete(athleteUid: string, coachId: string): Promise<void> {
  if (isLocalDeviceUid(athleteUid)) {
    const cols = ['workouts', 'programs', 'sessions', 'personalRecords', 'goals', 'measurements'];
    for (const sub of cols) {
      const items = localGetSubcollection<Record<string, unknown>>(sub);
      for (const item of items) {
        const key = sub === 'personalRecords' ? 'exerciseId' : 'id';
        const val = item[key];
        if (typeof val === 'string') {
          localPatchSubcollectionItem(sub, key, val, { coachId });
        }
      }
    }
    return;
  }

  const timestampedCols = ['workouts', 'programs', 'personalRecords', 'goals'];
  for (const sub of timestampedCols) {
    const subSnap = await getDocs(
      query(collection(db, 'users', athleteUid, sub), where('userId', '==', athleteUid))
    );
    if (!subSnap.empty) {
      for (let i = 0; i < subSnap.docs.length; i += 400) {
        const subBatch = writeBatch(db);
        subSnap.docs.slice(i, i + 400).forEach((d) => {
          subBatch.update(d.ref, { coachId, updatedAt: serverTimestamp() });
        });
        await subBatch.commit();
      }
    }
  }

  const coachOnlyCols = ['sessions', 'measurements'];
  for (const sub of coachOnlyCols) {
    const colSnap = await getDocs(
      query(collection(db, 'users', athleteUid, sub), where('userId', '==', athleteUid))
    );
    if (!colSnap.empty) {
      for (let i = 0; i < colSnap.docs.length; i += 400) {
        const colBatch = writeBatch(db);
        colSnap.docs.slice(i, i + 400).forEach((d) => {
          colBatch.update(d.ref, { coachId });
        });
        await colBatch.commit();
      }
    }
  }
}

export async function claimCoachInviteCode(
  athleteUid: string,
  athleteName: string,
  rawCode: string
): Promise<CoachingLink> {
  const code = extractJoinCodeFromInput(rawCode);
  if (!code || code.length < 4) throw new Error('Invalid invite code');

  if (isLocalDeviceUid(athleteUid)) {
    // 1. Check permanent Coach QR codes first
    const coachCodes = localGetCollection<CoachProfileCode & Record<string, unknown>>('coachCodes');
    const matchedCoachCode = coachCodes.find((c) => c.coachCode === code && c.isActive !== false);
    if (matchedCoachCode) {
      const cleanName = clampString(athleteName, 100) || 'Athlete';
      const existingLinks = localGetCollection<CoachingLink & Record<string, unknown>>('coachingLinks');
      const existingForCoach = existingLinks.find(
        (l) => l.coachId === matchedCoachCode.coachId && l.athleteUid === athleteUid
      );
      const linkId = existingForCoach?.id || `LINK_${matchedCoachCode.coachId.slice(0, 16)}_${athleteUid.slice(0, 16)}`;
      const linkObj: CoachingLink = {
        id: linkId,
        coachId: matchedCoachCode.coachId,
        coachName: matchedCoachCode.coachName,
        athleteUid,
        athleteName: cleanName,
        inviteCode: matchedCoachCode.coachCode,
        coachCode: matchedCoachCode.coachCode,
        status: 'active',
        weeklyTarget: existingForCoach?.weeklyTarget ?? 4,
        completedSessionsCount: existingForCoach?.completedSessionsCount ?? 0,
        needsAttention: false,
      };
      localUpsertCollectionItem('coachingLinks', 'id', linkObj as unknown as Record<string, unknown>);
      localUpdateProfile({ coachId: matchedCoachCode.coachId, coachName: matchedCoachCode.coachName });
      await backfillCoachIdForAthlete(athleteUid, matchedCoachCode.coachId);
      return linkObj;
    }

    // 2. Fallback to single-use CoachingLink invite
    const links = localGetCollection<CoachingLink & Record<string, unknown>>('coachingLinks');
    const match = links.find((l) => l.inviteCode === code || l.id === code);
    if (!match) throw new Error('Invite code not found');
    if (match.status !== 'pending' || (match.athleteUid && match.athleteUid !== athleteUid)) {
      throw new Error('Invite code has already been used');
    }
    const cleanName = clampString(athleteName, 100) || match.athleteName;
    localPatchCollectionItem('coachingLinks', 'id', match.id, {
      athleteUid,
      athleteName: cleanName,
      status: 'active',
    });
    localUpdateProfile({ coachId: match.coachId, coachName: match.coachName });
    await backfillCoachIdForAthlete(athleteUid, match.coachId);
    return { ...match, athleteUid, athleteName: cleanName, status: 'active' };
  }

  const path = `coachingLinks/${code}`;
  try {
    // 1. Check if code matches a permanent Coach QR code in /coachCodes/{code}
    const coachCodeSnap = await getDoc(doc(db, 'coachCodes', code));
    if (coachCodeSnap.exists()) {
      const coachDoc = coachCodeSnap.data() as CoachProfileCode;
      if (!coachDoc.isActive) {
        throw new Error('Invite code has already been used');
      }
      if (coachDoc.coachId === athleteUid) {
        // Still allow switching/testing or prevent self-linking? Allow if testing, or link cleanly:
      }
      const cleanName = clampString(athleteName, 100) || 'Athlete';
      const safeCoachPart = coachDoc.coachId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 36);
      const safeAthPart = athleteUid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 36);
      const linkId = `LINK_${safeCoachPart}_${safeAthPart}`.slice(0, 120);
      const linkRef = doc(db, 'coachingLinks', linkId);
      const existingLinkSnap = await getDoc(linkRef);

      const batch = writeBatch(db);
      if (existingLinkSnap.exists()) {
        batch.update(linkRef, {
          athleteName: cleanName,
          coachCode: coachDoc.coachCode,
          status: 'active',
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.set(linkRef, {
          id: linkId,
          coachId: coachDoc.coachId,
          coachName: clampString(coachDoc.coachName, 100) || 'Coach',
          athleteUid,
          athleteName: cleanName,
          inviteCode: coachDoc.coachCode,
          coachCode: coachDoc.coachCode,
          groupId: '',
          status: 'active',
          weeklyTarget: 4,
          completedSessionsCount: 0,
          needsAttention: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      batch.update(doc(db, 'users', athleteUid), {
        coachId: coachDoc.coachId,
        coachName: clampString(coachDoc.coachName, 100) || 'Coach',
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      await backfillCoachIdForAthlete(athleteUid, coachDoc.coachId);

      const resultLink: CoachingLink = existingLinkSnap.exists()
        ? {
            ...(existingLinkSnap.data() as CoachingLink),
            athleteName: cleanName,
            coachCode: coachDoc.coachCode,
            status: 'active',
          }
        : {
            id: linkId,
            coachId: coachDoc.coachId,
            coachName: coachDoc.coachName,
            athleteUid,
            athleteName: cleanName,
            inviteCode: coachDoc.coachCode,
            coachCode: coachDoc.coachCode,
            groupId: '',
            status: 'active',
            weeklyTarget: 4,
            completedSessionsCount: 0,
            needsAttention: false,
          };
      return resultLink;
    }

    // 2. Fallback to single-use invite doc in /coachingLinks/{code}
    const linkRef = doc(db, 'coachingLinks', code);
    const snap = await getDoc(linkRef);
    if (!snap.exists()) throw new Error('Invite code not found');
    const data = snap.data() as CoachingLink;
    if (data.status !== 'pending' || (data.athleteUid && data.athleteUid !== athleteUid)) {
      throw new Error('Invite code has already been used');
    }

    const cleanName = clampString(athleteName, 100) || data.athleteName;
    const batch = writeBatch(db);
    batch.update(linkRef, {
      athleteUid,
      athleteName: cleanName,
      status: 'active',
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'users', athleteUid), {
      coachId: data.coachId,
      coachName: data.coachName,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    await backfillCoachIdForAthlete(athleteUid, data.coachId);

    return { ...data, athleteUid, athleteName: cleanName, status: 'active' };
  } catch (error) {
    if (
      error instanceof Error &&
      ['Invalid invite code', 'Invite code not found', 'Invite code has already been used'].includes(error.message)
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeCoachRoster(coachId: string, cb: (links: CoachingLink[]) => void): Unsubscribe {
  if (isLocalDeviceUid(coachId)) {
    return localSubscribeCollection<CoachingLink>(
      'coachingLinks',
      cb,
      (l) => l.coachId === coachId,
      'updatedAt',
      'desc'
    );
  }
  const q = query(collection(db, 'coachingLinks'), where('coachId', '==', coachId));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as CoachingLink)),
    (err) => handleFirestoreError(err, OperationType.LIST, 'coachingLinks')
  );
}

export function subscribeAthleteCoachLinks(athleteUid: string, cb: (links: CoachingLink[]) => void): Unsubscribe {
  if (isLocalDeviceUid(athleteUid)) {
    return localSubscribeCollection<CoachingLink>(
      'coachingLinks',
      cb,
      (l) => l.athleteUid === athleteUid,
      'updatedAt',
      'desc'
    );
  }
  const q = query(collection(db, 'coachingLinks'), where('athleteUid', '==', athleteUid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as CoachingLink)),
    (err) => handleFirestoreError(err, OperationType.LIST, 'coachingLinks')
  );
}

export async function fetchLinkedAthleteData(
  athleteUid: string,
  coachId: string
): Promise<{
  sessions: WorkoutSessionHistory[];
  programs: TrainingProgram[];
  workouts: WorkoutTemplate[];
  prs: PersonalRecord[];
  goals: PerformanceGoal[];
  measurements: BodyMeasurement[];
}> {
  if (isLocalDeviceUid(athleteUid) || isLocalDeviceUid(coachId)) {
    const bundle = localGetAthleteBundle(athleteUid);
    return {
      ...bundle,
      sessions: [...bundle.sessions].sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      ),
      measurements: [...(bundle.measurements ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    };
  }
  try {
    const [sessSnap, progSnap, workSnap, prSnap, goalSnap, measSnap] = await Promise.all([
      getDocs(query(collection(db, 'users', athleteUid, 'sessions'), where('coachId', '==', coachId))),
      getDocs(query(collection(db, 'users', athleteUid, 'programs'), where('coachId', '==', coachId))),
      getDocs(query(collection(db, 'users', athleteUid, 'workouts'), where('coachId', '==', coachId))),
      getDocs(query(collection(db, 'users', athleteUid, 'personalRecords'), where('coachId', '==', coachId))),
      getDocs(query(collection(db, 'users', athleteUid, 'goals'), where('coachId', '==', coachId))),
      getDocs(query(collection(db, 'users', athleteUid, 'measurements'), where('coachId', '==', coachId))),
    ]);

    const sessions = sessSnap.docs
      .map((d) => d.data() as WorkoutSessionHistory)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    const measurements = measSnap.docs
      .map((d) => d.data() as BodyMeasurement)
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      sessions,
      programs: progSnap.docs.map((d) => d.data() as TrainingProgram),
      workouts: workSnap.docs.map((d) => d.data() as WorkoutTemplate),
      prs: prSnap.docs.map((d) => d.data() as PersonalRecord),
      goals: goalSnap.docs.map((d) => d.data() as PerformanceGoal),
      measurements,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${athleteUid}`);
  }
}

// Coach Program Assignments
export async function sendCoachAssignment(
  assignment: Omit<CoachAssignment, 'createdAt' | 'updatedAt'>
): Promise<void> {
  const cleanProgName = clampString(assignment.programName, 120);
  const cleanNotes = clampString(assignment.notes, 600);
  const announceEn = `Coach ${assignment.coachName} assigned this course to you: "${cleanProgName}"${cleanNotes ? ` — ${cleanNotes}` : ''}`.slice(0, 300);
  const announceAr = `الكابتن ${assignment.coachName} أعطاك هذا الكورس: «${cleanProgName}»${cleanNotes ? ` — ${cleanNotes}` : ''}`.slice(0, 300);

  if (isLocalDeviceUid(assignment.coachId) || isLocalDeviceUid(assignment.athleteUid)) {
    localUpsertCollectionItem('coachAssignments', 'id', {
      ...assignment,
      programName: cleanProgName,
      notes: cleanNotes,
    } as unknown as Record<string, unknown>);
    if (assignment.linkId) {
      localPatchCollectionItem('coachingLinks', 'id', assignment.linkId, {
        assignedProgramName: cleanProgName,
      });
    }
    if (assignment.athleteUid && assignment.athleteUid !== LOCAL_DEVICE_UID) {
      const bundle = localGetAthleteBundle(assignment.athleteUid);
      const newWorkouts: WorkoutTemplate[] = (assignment.workoutsData || []).map((w) => ({
        ...w,
        userId: assignment.athleteUid,
        coachId: assignment.coachId,
        assignedByCoachId: assignment.coachId,
      }));
      const newProg: TrainingProgram = {
        ...assignment.programData,
        userId: assignment.athleteUid,
        coachId: assignment.coachId,
        assignedByCoachId: assignment.coachId,
        assignedByCoachName: assignment.coachName,
        status: 'active',
      };
      const pausedPrograms = bundle.programs
        .filter((p) => p.id !== newProg.id)
        .map((p) => (p.status === 'active' ? { ...p, status: 'paused' as const } : p));
      const workoutIds = new Set(newWorkouts.map((w) => w.id));
      bundle.workouts = [...newWorkouts, ...bundle.workouts.filter((w) => !workoutIds.has(w.id))];
      bundle.programs = [newProg, ...pausedPrograms];
      localSaveAthleteBundle(assignment.athleteUid, bundle);
    } else if (assignment.athleteUid === LOCAL_DEVICE_UID) {
      localUpsertSubcollectionItem('reminders', 'id', {
        id: generateSafeId('remprog'),
        userId: LOCAL_DEVICE_UID,
        type: 'program_change',
        titleEn: `New course from ${assignment.coachName}`.slice(0, 120),
        titleAr: `الكابتن ${assignment.coachName} أعطاك كورساً جديداً`.slice(0, 120),
        messageEn: announceEn,
        messageAr: announceAr,
        read: false,
      });
    }
    if (assignment.athleteUid) {
      localUpsertCollectionItem('coachMessages', 'id', {
        id: generateSafeId('msg'),
        coachId: assignment.coachId,
        athleteUid: assignment.athleteUid,
        groupId: assignment.groupId || undefined,
        senderId: assignment.coachId,
        senderName: assignment.coachName,
        senderRole: 'coach',
        type: 'direct',
        text: `${announceAr}\n${announceEn}`.slice(0, 1500),
        read: false,
      });
    }
    return;
  }

  const path = `coachAssignments/${assignment.id}`;
  try {
    await setDoc(doc(db, 'coachAssignments', assignment.id), {
      ...assignment,
      programName: cleanProgName,
      notes: cleanNotes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (assignment.athleteUid) {
      await updateDoc(doc(db, 'coachingLinks', assignment.linkId), {
        assignedProgramName: cleanProgName,
        updatedAt: serverTimestamp(),
      });
      const remId = generateSafeId('remprog');
      await setDoc(doc(db, 'users', assignment.athleteUid, 'reminders', remId), {
        id: remId,
        userId: assignment.athleteUid,
        type: 'program_change',
        titleEn: `New course from ${assignment.coachName}`.slice(0, 120),
        titleAr: `الكابتن ${assignment.coachName} أعطاك كورساً جديداً`.slice(0, 120),
        messageEn: announceEn,
        messageAr: announceAr,
        read: false,
        createdAt: serverTimestamp(),
      });
      try {
        const msgId = generateSafeId('msg');
        await setDoc(doc(db, 'coachMessages', msgId), {
          id: msgId,
          coachId: assignment.coachId,
          athleteUid: assignment.athleteUid,
          ...(assignment.groupId ? { groupId: assignment.groupId } : {}),
          senderId: assignment.coachId,
          senderName: clampString(assignment.coachName, 100),
          senderRole: 'coach',
          type: 'direct',
          text: announceAr,
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch {
        // non-blocking message creation
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function acceptCoachAssignment(
  athleteUid: string,
  assignment: CoachAssignment,
  existingPrograms?: TrainingProgram[]
): Promise<string> {
  try {
    // Pause any previously active programs so the newly assigned coach course is the active schedule
    const priorPrograms =
      existingPrograms ??
      (isLocalDeviceUid(athleteUid)
        ? localGetSubcollection<TrainingProgram & Record<string, unknown>>('programs')
        : (await getDocs(query(collection(db, 'users', athleteUid, 'programs'), where('userId', '==', athleteUid)))).docs.map(
            (d) => d.data() as TrainingProgram
          ));

    for (const p of priorPrograms) {
      if (p.status === 'active') {
        await updateProgramStatus(athleteUid, p.id, 'paused');
      }
    }

    const workoutIdMap = new Map<string, string>();
    for (const w of assignment.workoutsData || []) {
      const newWId = generateSafeId('wrk');
      workoutIdMap.set(w.id, newWId);
      await saveWorkoutTemplate(
        athleteUid,
        {
          ...w,
          id: newWId,
          assignedByCoachId: assignment.coachId,
        },
        false,
        assignment.coachId
      );
    }

    const newProgId = generateSafeId('prog');
    const mappedDays = assignment.programData.scheduledDays.map((d) => ({
      ...d,
      workoutId: d.isRestDay ? '' : workoutIdMap.get(d.workoutId ?? '') ?? d.workoutId ?? '',
    }));

    await saveTrainingProgram(
      athleteUid,
      {
        ...assignment.programData,
        id: newProgId,
        status: 'active',
        completedSessions: 0,
        scheduledDays: mappedDays,
        assignedByCoachId: assignment.coachId,
        assignedByCoachName: assignment.coachName,
      },
      false,
      assignment.coachId
    );

    await setActiveProgramId(athleteUid, newProgId);

    if (isLocalDeviceUid(athleteUid)) {
      localPatchCollectionItem('coachAssignments', 'id', assignment.id, { status: 'accepted' });
      if (assignment.linkId) {
        localPatchCollectionItem('coachingLinks', 'id', assignment.linkId, {
          assignedProgramName: clampString(assignment.programName, 120),
        });
      }
      return newProgId;
    }

    await updateDoc(doc(db, 'coachAssignments', assignment.id), {
      status: 'accepted',
      updatedAt: serverTimestamp(),
    });
    if (assignment.linkId) {
      try {
        await updateDoc(doc(db, 'coachingLinks', assignment.linkId), {
          assignedProgramName: clampString(assignment.programName, 120),
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Ignore if link was archived/deleted
      }
    }
    return newProgId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `coachAssignments/${assignment.id}`);
  }
}

export async function dismissCoachAssignment(assignmentId: string): Promise<void> {
  if (isLocalDeviceModeEnabled() || localGetCollection('coachAssignments').some((a) => a.id === assignmentId)) {
    localPatchCollectionItem('coachAssignments', 'id', assignmentId, { status: 'archived' });
    return;
  }
  try {
    await updateDoc(doc(db, 'coachAssignments', assignmentId), {
      status: 'archived',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `coachAssignments/${assignmentId}`);
  }
}

export function subscribeCoachAssignmentsForCoach(coachId: string, cb: (items: CoachAssignment[]) => void): Unsubscribe {
  if (isLocalDeviceUid(coachId)) {
    return localSubscribeCollection<CoachAssignment>(
      'coachAssignments',
      cb,
      (a) => a.coachId === coachId,
      'updatedAt',
      'desc'
    );
  }
  const q = query(collection(db, 'coachAssignments'), where('coachId', '==', coachId));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as CoachAssignment)),
    (err) => handleFirestoreError(err, OperationType.LIST, 'coachAssignments')
  );
}

export function subscribeCoachAssignmentsForAthlete(athleteUid: string, cb: (items: CoachAssignment[]) => void): Unsubscribe {
  if (isLocalDeviceUid(athleteUid)) {
    return localSubscribeCollection<CoachAssignment>(
      'coachAssignments',
      cb,
      (a) => a.athleteUid === athleteUid,
      'updatedAt',
      'desc'
    );
  }
  const q = query(collection(db, 'coachAssignments'), where('athleteUid', '==', athleteUid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as CoachAssignment)),
    (err) => handleFirestoreError(err, OperationType.LIST, 'coachAssignments')
  );
}

// Coach Session Feedback + Messaging
export async function addSessionCoachFeedback(
  athleteUid: string,
  sessionId: string,
  coachName: string,
  feedbackText: string
): Promise<void> {
  const cleanText = clampString(feedbackText, 1000);
  if (isLocalDeviceUid(athleteUid)) {
    const bundle = localGetAthleteBundle(athleteUid);
    bundle.sessions = bundle.sessions.map((s) =>
      s.id === sessionId
        ? { ...s, coachFeedback: cleanText, coachFeedbackAt: new Date().toISOString() }
        : s
    );
    localSaveAthleteBundle(athleteUid, bundle);
    if (athleteUid === LOCAL_DEVICE_UID) {
      localUpsertSubcollectionItem('reminders', 'id', {
        id: generateSafeId('remfb'),
        userId: LOCAL_DEVICE_UID,
        type: 'coach_feedback',
        titleEn: `Feedback from ${coachName}`.slice(0, 120),
        titleAr: `ملاحظة من المدرب ${coachName}`.slice(0, 120),
        messageEn: cleanText.slice(0, 300),
        messageAr: cleanText.slice(0, 300),
        read: false,
      });
    }
    return;
  }

  const path = `users/${athleteUid}/sessions/${sessionId}`;
  try {
    await updateDoc(doc(db, 'users', athleteUid, 'sessions', sessionId), {
      coachFeedback: cleanText,
      coachFeedbackAt: new Date().toISOString(),
    });

    const remId = generateSafeId('remfb');
    await setDoc(doc(db, 'users', athleteUid, 'reminders', remId), {
      id: remId,
      userId: athleteUid,
      type: 'coach_feedback',
      titleEn: `Feedback from ${coachName}`.slice(0, 120),
      titleAr: `ملاحظة من المدرب ${coachName}`.slice(0, 120),
      messageEn: cleanText.slice(0, 300),
      messageAr: cleanText.slice(0, 300),
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function sendCoachMessage(
  msg: Omit<CoachMessage, 'id' | 'read' | 'createdAt'>
): Promise<void> {
  const id = generateSafeId('msg');
  if (isLocalDeviceUid(msg.senderId) || isLocalDeviceUid(msg.coachId)) {
    localUpsertCollectionItem('coachMessages', 'id', {
      ...msg,
      id,
      text: clampString(msg.text, 1500),
      senderName: clampString(msg.senderName, 100),
      read: false,
    });
    if (msg.athleteUid === LOCAL_DEVICE_UID && msg.senderId === msg.coachId) {
      localUpsertSubcollectionItem('reminders', 'id', {
        id: generateSafeId('remmsg'),
        userId: LOCAL_DEVICE_UID,
        type: msg.type === 'announcement' ? 'team_announcement' : msg.type === 'checkin' ? 'checkin_reminder' : 'coach_feedback',
        titleEn: `${msg.senderName} sent a message`.slice(0, 120),
        titleAr: `رسالة جديدة من ${msg.senderName}`.slice(0, 120),
        messageEn: msg.text.slice(0, 300),
        messageAr: msg.text.slice(0, 300),
        read: false,
      });
    }
    return;
  }

  const path = `coachMessages/${id}`;
  try {
    await setDoc(doc(db, 'coachMessages', id), {
      ...msg,
      id,
      text: clampString(msg.text, 1500),
      senderName: clampString(msg.senderName, 100),
      read: false,
      createdAt: serverTimestamp(),
    });

    // Trigger reminder for announcement or check-in when coach targets a specific athlete
    if (msg.athleteUid && msg.senderId === msg.coachId) {
      const remId = generateSafeId('remmsg');
      const remType =
        msg.type === 'announcement'
          ? 'team_announcement'
          : msg.type === 'checkin'
            ? 'checkin_reminder'
            : 'coach_feedback';
      await setDoc(doc(db, 'users', msg.athleteUid, 'reminders', remId), {
        id: remId,
        userId: msg.athleteUid,
        type: remType,
        titleEn: `${msg.senderName} sent a message`.slice(0, 120),
        titleAr: `رسالة جديدة من ${msg.senderName}`.slice(0, 120),
        messageEn: msg.text.slice(0, 300),
        messageAr: msg.text.slice(0, 300),
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function markCoachMessageRead(messageId: string): Promise<void> {
  if (isLocalDeviceModeEnabled() || localGetCollection('coachMessages').some((m) => m.id === messageId)) {
    localPatchCollectionItem('coachMessages', 'id', messageId, { read: true });
    return;
  }
  try {
    await updateDoc(doc(db, 'coachMessages', messageId), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `coachMessages/${messageId}`);
  }
}

export function subscribeCoachMessages(
  uid: string,
  mode: 'coach' | 'athlete',
  cb: (msgs: CoachMessage[]) => void
): Unsubscribe {
  if (isLocalDeviceUid(uid)) {
    return localSubscribeCollection<CoachMessage>(
      'coachMessages',
      cb,
      (m) => (mode === 'coach' ? m.coachId === uid : m.athleteUid === uid),
      'createdAt',
      'desc'
    );
  }
  const field = mode === 'coach' ? 'coachId' : 'athleteUid';
  const q = query(collection(db, 'coachMessages'), where(field, '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => d.data() as CoachMessage);
      items.sort((a, b) => {
        const ta = a.createdAt && typeof a.createdAt === 'object' && 'toMillis' in a.createdAt ? (a.createdAt as { toMillis: () => number }).toMillis() : 0;
        const tb = b.createdAt && typeof b.createdAt === 'object' && 'toMillis' in b.createdAt ? (b.createdAt as { toMillis: () => number }).toMillis() : 0;
        return tb - ta;
      });
      cb(items);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'coachMessages')
  );
}

// Exercise Accuracy Flags
export async function submitExerciseFlag(
  uid: string,
  userName: string,
  exerciseId: string,
  exerciseName: string,
  reason: string
): Promise<void> {
  const id = generateSafeId('flag');
  if (isLocalDeviceUid(uid)) {
    localUpsertCollectionItem('exerciseFlags', 'id', {
      id,
      userId: uid,
      userName: clampString(userName, 100) || 'User',
      exerciseId: clampString(exerciseId, 128),
      exerciseName: clampString(exerciseName, 120),
      reason: clampString(reason, 600),
      status: 'open',
    });
    return;
  }
  try {
    await setDoc(doc(db, 'exerciseFlags', id), {
      id,
      userId: uid,
      userName: clampString(userName, 100) || 'User',
      exerciseId: clampString(exerciseId, 128),
      exerciseName: clampString(exerciseName, 120),
      reason: clampString(reason, 600),
      status: 'open',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `exerciseFlags/${id}`);
  }
}

export async function reviewExerciseFlag(flagId: string): Promise<void> {
  if (isLocalDeviceModeEnabled() || localGetCollection('exerciseFlags').some((f) => f.id === flagId)) {
    localPatchCollectionItem('exerciseFlags', 'id', flagId, { status: 'reviewed' });
    return;
  }
  try {
    await updateDoc(doc(db, 'exerciseFlags', flagId), { status: 'reviewed' });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `exerciseFlags/${flagId}`);
  }
}

export function subscribeExerciseFlags(isAdminUser: boolean, uid: string, cb: (flags: ExerciseFlag[]) => void): Unsubscribe {
  if (isLocalDeviceUid(uid)) {
    return localSubscribeCollection<ExerciseFlag>(
      'exerciseFlags',
      cb,
      (f) => isAdminUser || f.userId === uid,
      'createdAt',
      'desc'
    );
  }
  const q = isAdminUser
    ? query(collection(db, 'exerciseFlags'))
    : query(collection(db, 'exerciseFlags'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as ExerciseFlag)),
    (err) => handleFirestoreError(err, OperationType.LIST, 'exerciseFlags')
  );
}

// Gym Organization Admin
export async function saveGymOrganization(
  org: Omit<GymOrganization, 'createdAt' | 'updatedAt'>,
  isEdit: boolean
): Promise<void> {
  if (isLocalDeviceUid(org.ownerUid)) {
    localUpsertCollectionItem('organizations', 'id', {
      ...org,
      name: clampString(org.name, 120) || 'APEX Performance Club',
    } as unknown as Record<string, unknown>);
    return;
  }
  const refDoc = doc(db, 'organizations', org.id);
  try {
    if (isEdit) {
      await updateDoc(refDoc, {
        name: clampString(org.name, 120) || 'APEX Performance Club',
        defaultLanguage: org.defaultLanguage,
        allowAthleteSelfProgram: Boolean(org.allowAthleteSelfProgram),
        requireCoachApprovalForYouth: Boolean(org.requireCoachApprovalForYouth),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(refDoc, {
        ...org,
        name: clampString(org.name, 120) || 'APEX Performance Club',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `organizations/${org.id}`);
  }
}

export function subscribeGymOrganizations(ownerUid: string, cb: (orgs: GymOrganization[]) => void): Unsubscribe {
  if (isLocalDeviceUid(ownerUid)) {
    return localSubscribeCollection<GymOrganization>(
      'organizations',
      cb,
      (o) => o.ownerUid === ownerUid,
      'updatedAt',
      'desc'
    );
  }
  const q = query(collection(db, 'organizations'), where('ownerUid', '==', ownerUid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as GymOrganization)),
    (err) => handleFirestoreError(err, OperationType.LIST, 'organizations')
  );
}

export async function saveOrganizationMember(
  member: Omit<OrganizationMember, 'email' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean
): Promise<void> {
  if (isLocalDeviceModeEnabled()) {
    localUpsertCollectionItem('organizationMembers', 'uid', {
      uid: member.uid,
      organizationId: member.organizationId,
      displayName: clampString(member.displayName, 100),
      role: member.role,
      status: member.status,
    });
    return;
  }
  const refDoc = doc(db, 'organizations', member.organizationId, 'members', member.uid);
  try {
    if (isEdit) {
      await updateDoc(refDoc, {
        displayName: clampString(member.displayName, 100),
        role: member.role,
        status: member.status,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(refDoc, {
        uid: member.uid,
        organizationId: member.organizationId,
        displayName: clampString(member.displayName, 100),
        role: member.role,
        status: member.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `organizations/${member.organizationId}/members/${member.uid}`);
  }
}

export async function deleteOrganizationMember(orgId: string, memberUid: string): Promise<void> {
  if (isLocalDeviceModeEnabled() || localGetCollection('organizationMembers').some((m) => m.uid === memberUid)) {
    localDeleteCollectionItem('organizationMembers', 'uid', memberUid);
    return;
  }
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'members', memberUid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `organizations/${orgId}/members/${memberUid}`);
  }
}

export function subscribeOrganizationMembers(orgId: string, cb: (members: OrganizationMember[]) => void): Unsubscribe {
  if (isLocalDeviceModeEnabled()) {
    return localSubscribeCollection<OrganizationMember>(
      'organizationMembers',
      cb,
      (m) => m.organizationId === orgId,
      'updatedAt',
      'desc'
    );
  }
  return onSnapshot(
    collection(db, 'organizations', orgId, 'members'),
    (snap) => cb(snap.docs.map((d) => d.data() as OrganizationMember)),
    (err) => handleFirestoreError(err, OperationType.LIST, `organizations/${orgId}/members`)
  );
}

// Permanent Coach QR Code & Gym Subscription Accounting
const FIXED_GYM_CURRENCY = 'د.ع';

function isUntouchedLegacyPresetTiers(tiers: CoachSubscriptionTier[] | undefined): boolean {
  if (!tiers || tiers.length === 0) return false;
  const legacyIds = new Set(['tier_monthly', 'tier_vip', 'tier_quarterly', 'tier-std', 'tier-vip', 'tier-qtr']);
  const legacyPrices = new Set([50000, 100000, 130000, 50, 120, 135]);
  return tiers.every((t) => legacyIds.has(t.id) && legacyPrices.has(Number(t.price)));
}

function generatePermanentCoachCode(coachId: string): string {
  const suffix = coachId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'COACH';
  const rand = Math.floor(100 + Math.random() * 900);
  return `CAP-${suffix}${rand}`;
}

export async function ensureOrGetCoachCode(
  coachId: string,
  coachName: string,
  language: Language = 'ar'
): Promise<CoachProfileCode> {
  const cleanCoachName = clampString(coachName, 100) || (language === 'ar' ? 'الكابتن' : 'Coach');
  const defaultCurrency = FIXED_GYM_CURRENCY;
  const defaultGymName = language === 'ar' ? 'القاعة الرياضية' : 'APEX Gym Hall';

  if (isLocalDeviceUid(coachId)) {
    const existing = localGetCollection<CoachProfileCode & Record<string, unknown>>('coachCodes').find(
      (c) => c.coachId === coachId
    );
    if (existing) {
      const legacyTiers = isUntouchedLegacyPresetTiers(existing.subscriptionTiers);
      const wrongCurrency = existing.currency !== FIXED_GYM_CURRENCY;
      if (legacyTiers || wrongCurrency) {
        const patch: Partial<CoachProfileCode> = {
          currency: FIXED_GYM_CURRENCY,
          ...(legacyTiers ? { subscriptionTiers: [] } : {}),
        };
        const cleaned = { ...existing, ...patch };
        localPatchCollectionItem('coachCodes', 'coachCode', existing.coachCode, patch as Record<string, unknown>);
        return cleaned;
      }
      return existing;
    }
    const created: CoachProfileCode = {
      coachCode: generatePermanentCoachCode(coachId),
      coachId,
      coachName: cleanCoachName,
      gymName: defaultGymName,
      currency: defaultCurrency,
      subscriptionTiers: [],
      isActive: true,
    };
    localUpsertCollectionItem('coachCodes', 'coachCode', created as unknown as Record<string, unknown>);
    return created;
  }

  try {
    const q = query(collection(db, 'coachCodes'), where('coachId', '==', coachId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const existing = snap.docs[0].data() as CoachProfileCode;
      const legacyTiers = isUntouchedLegacyPresetTiers(existing.subscriptionTiers);
      const wrongCurrency = existing.currency !== FIXED_GYM_CURRENCY;
      if (legacyTiers || wrongCurrency) {
        const patch: Record<string, unknown> = {
          currency: FIXED_GYM_CURRENCY,
          updatedAt: serverTimestamp(),
          ...(legacyTiers ? { subscriptionTiers: [] } : {}),
        };
        await updateDoc(doc(db, 'coachCodes', existing.coachCode), patch).catch(() => {});
        return {
          ...existing,
          currency: FIXED_GYM_CURRENCY,
          subscriptionTiers: legacyTiers ? [] : existing.subscriptionTiers,
        };
      }
      return existing;
    }
    const coachCode = generatePermanentCoachCode(coachId);
    const newDoc: CoachProfileCode = {
      coachCode,
      coachId,
      coachName: cleanCoachName,
      gymName: defaultGymName,
      currency: defaultCurrency,
      subscriptionTiers: [],
      isActive: true,
    };
    await setDoc(doc(db, 'coachCodes', coachCode), {
      ...newDoc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'coachCodes');
  }
}

export async function updateCoachCodeConfig(
  coachCode: string,
  updates: Partial<Pick<CoachProfileCode, 'coachName' | 'gymName' | 'currency' | 'subscriptionTiers' | 'isActive'>>
): Promise<void> {
  const payload: Record<string, unknown> = {
    currency: FIXED_GYM_CURRENCY,
  };
  if (updates.coachName !== undefined) payload.coachName = clampString(updates.coachName, 100) || 'Coach';
  if (updates.gymName !== undefined) payload.gymName = clampString(updates.gymName, 120);
  if (updates.subscriptionTiers !== undefined) {
    payload.subscriptionTiers = updates.subscriptionTiers.slice(0, 20).map((t) => ({
      id: clampString(t.id, 64) || generateSafeId('tier'),
      name: clampString(t.name, 80) || 'Tier',
      price: Math.max(0, Number(t.price) || 0),
      durationDays: Math.max(1, Math.min(1825, Math.round(Number(t.durationDays) || 30))),
      description: clampString(t.description || '', 160),
    }));
  }
  if (updates.isActive !== undefined) payload.isActive = Boolean(updates.isActive);

  if (isLocalDeviceModeEnabled() || localGetCollection('coachCodes').some((c) => c.coachCode === coachCode)) {
    localPatchCollectionItem('coachCodes', 'coachCode', coachCode, payload);
    return;
  }

  try {
    await updateDoc(doc(db, 'coachCodes', coachCode), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `coachCodes/${coachCode}`);
  }
}

export function subscribeCoachCode(
  coachId: string,
  cb: (docItem: CoachProfileCode | null) => void
): Unsubscribe {
  if (isLocalDeviceUid(coachId)) {
    return localSubscribeCollection<CoachProfileCode>(
      'coachCodes',
      (items) => cb(items[0] ?? null),
      (c) => c.coachId === coachId
    );
  }
  const q = query(collection(db, 'coachCodes'), where('coachId', '==', coachId));
  return onSnapshot(
    q,
    (snap) => cb(snap.empty ? null : (snap.docs[0].data() as CoachProfileCode)),
    (err) => handleFirestoreError(err, OperationType.LIST, 'coachCodes')
  );
}

export function subscribeGymSubscriptions(
  coachId: string,
  cb: (subs: GymSubscriptionRecord[]) => void
): Unsubscribe {
  if (isLocalDeviceUid(coachId)) {
    return localSubscribeCollection<GymSubscriptionRecord>(
      'gymSubscriptions',
      cb,
      (s) => s.coachId === coachId,
      'endDate',
      'asc'
    );
  }
  const q = query(collection(db, 'gymSubscriptions'), where('coachId', '==', coachId));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => d.data() as GymSubscriptionRecord);
      items.sort((a, b) => a.endDate.localeCompare(b.endDate));
      cb(items);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'gymSubscriptions')
  );
}

export function subscribeAthleteGymSubscriptions(
  athleteUid: string,
  cb: (subs: GymSubscriptionRecord[]) => void
): Unsubscribe {
  if (isLocalDeviceUid(athleteUid)) {
    return localSubscribeCollection<GymSubscriptionRecord>(
      'gymSubscriptions',
      cb,
      (s) => s.athleteUid === athleteUid,
      'endDate',
      'desc'
    );
  }
  const q = query(collection(db, 'gymSubscriptions'), where('athleteUid', '==', athleteUid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => d.data() as GymSubscriptionRecord);
      items.sort((a, b) => b.endDate.localeCompare(a.endDate));
      cb(items);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'gymSubscriptions')
  );
}

export async function saveGymSubscription(
  coachId: string,
  record: Omit<GymSubscriptionRecord, 'coachId' | 'createdAt' | 'updatedAt'>,
  isUpdate: boolean
): Promise<void> {
  const cleanPayload: Omit<GymSubscriptionRecord, 'createdAt' | 'updatedAt'> = {
    id: record.id,
    coachId,
    athleteUid: clampString(record.athleteUid, 128),
    linkId: clampString(record.linkId, 128),
    memberName: clampString(record.memberName, 100) || 'Member',
    memberPhone: clampString(record.memberPhone, 30),
    tierId: clampString(record.tierId, 128) || 'custom',
    tierName: clampString(record.tierName, 100) || 'Membership',
    tierPrice: Math.max(0, Number(record.tierPrice) || 0),
    amountPaid: Math.max(0, Number(record.amountPaid) || 0),
    currency: FIXED_GYM_CURRENCY,
    paymentStatus: record.paymentStatus,
    startDate: record.startDate.slice(0, 10),
    endDate: record.endDate.slice(0, 10),
    status: record.status,
    notes: clampString(record.notes, 500),
  };

  if (isLocalDeviceUid(coachId)) {
    localUpsertCollectionItem('gymSubscriptions', 'id', cleanPayload as unknown as Record<string, unknown>);
    return;
  }

  const refDoc = doc(db, 'gymSubscriptions', record.id);
  try {
    if (isUpdate) {
      await updateDoc(refDoc, {
        athleteUid: cleanPayload.athleteUid,
        linkId: cleanPayload.linkId,
        memberName: cleanPayload.memberName,
        memberPhone: cleanPayload.memberPhone,
        tierId: cleanPayload.tierId,
        tierName: cleanPayload.tierName,
        tierPrice: cleanPayload.tierPrice,
        amountPaid: cleanPayload.amountPaid,
        currency: cleanPayload.currency,
        paymentStatus: cleanPayload.paymentStatus,
        startDate: cleanPayload.startDate,
        endDate: cleanPayload.endDate,
        status: cleanPayload.status,
        notes: cleanPayload.notes,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(refDoc, {
        ...cleanPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `gymSubscriptions/${record.id}`);
  }
}

export async function deleteGymSubscription(subId: string): Promise<void> {
  if (isLocalDeviceModeEnabled() || localGetCollection('gymSubscriptions').some((s) => s.id === subId)) {
    localDeleteCollectionItem('gymSubscriptions', 'id', subId);
    return;
  }
  try {
    await deleteDoc(doc(db, 'gymSubscriptions', subId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `gymSubscriptions/${subId}`);
  }
}

export async function sendSubscriptionExpiryAlert(
  coachId: string,
  coachName: string,
  sub: GymSubscriptionRecord
): Promise<void> {
  if (!sub.athleteUid) return;
  const isExpired = sub.endDate < new Date().toISOString().slice(0, 10);
  const titleAr = isExpired ? 'انتهى اشتراكك في القاعة الرياضية' : 'تنبيه قرب انتهاء اشتراك القاعة';
  const titleEn = isExpired ? 'Gym Membership Expired' : 'Gym Membership Expiring Soon';
  const msgAr = isExpired
    ? `الكابتن ${coachName} يذكّرك بأن اشتراك (${sub.tierName}) قد انتهى بتاريخ ${sub.endDate}. يُرجى التجديد.`
    : `الكابتن ${coachName} يذكّرك بأن اشتراك (${sub.tierName}) ينتهي بتاريخ ${sub.endDate}.`;
  const msgEn = isExpired
    ? `Coach ${coachName}: your "${sub.tierName}" gym membership expired on ${sub.endDate}. Please renew.`
    : `Coach ${coachName}: your "${sub.tierName}" gym membership expires on ${sub.endDate}.`;

  await createReminder(sub.athleteUid, {
    id: generateSafeId('subrem'),
    type: 'subscription_alert',
    titleEn: titleEn.slice(0, 120),
    titleAr: titleAr.slice(0, 120),
    messageEn: msgEn.slice(0, 300),
    messageAr: msgAr.slice(0, 300),
    read: false,
  });

  await sendCoachMessage({
    coachId,
    athleteUid: sub.athleteUid,
    senderId: coachId,
    senderName: coachName,
    senderRole: 'coach',
    type: 'checkin',
    text: msgAr,
  });
}


