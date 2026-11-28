export type Language = 'en' | 'ar';
export type ThemeMode = 'dark' | 'light';
export type WeightUnit = 'kg' | 'lb';
export type UserRole = 'athlete' | 'coach' | 'gym_admin';
export type AgeGroup = 'adult' | 'youth';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abdominals';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'smith_machine'
  | 'bodyweight'
  | 'resistance_bands';

export type ExerciseCategory = 'compound' | 'isolation';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingGoal = 'strength' | 'hypertrophy' | 'endurance' | 'recomposition' | 'general_fitness';
export type SplitType = 'push_pull_legs' | 'upper_lower' | 'full_body' | 'bro_split' | 'custom';
export type TrainingPhilosophy = 'modern' | 'old_school' | 'hybrid';
export type ProgramStatus = 'active' | 'paused' | 'archived' | 'completed';
export type SetTechnique = 'standard' | 'superset' | 'circuit' | 'drop_set';
export type SetType = 'warmup' | 'working' | 'drop';

export type MovementPattern =
  | 'bench_press'
  | 'incline_press'
  | 'chest_fly'
  | 'row'
  | 'pulldown'
  | 'overhead_press'
  | 'lateral_raise'
  | 'bicep_curl'
  | 'tricep_extension'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'leg_extension'
  | 'leg_curl'
  | 'calf_raise'
  | 'core_flexion';

export type AppSection =
  | 'dashboard'
  | 'exercises'
  | 'workouts'
  | 'programs'
  | 'philosophies'
  | 'live'
  | 'history'
  | 'analytics'
  | 'progress'
  | 'ai'
  | 'coach'
  | 'messaging'
  | 'admin'
  | 'profile';

export interface MovementPhaseDetail {
  phase: 'setup' | 'eccentric' | 'isometric' | 'concentric';
  labelEn: string;
  labelAr: string;
  cueEn: string;
  cueAr: string;
}

export interface ExerciseComparison {
  otherExerciseId: string;
  otherNameEn: string;
  otherNameAr: string;
  mechanicalDiffEn: string;
  mechanicalDiffAr: string;
  practicalChoiceEn: string;
  practicalChoiceAr: string;
}

export interface NotificationSettings {
  scheduledWorkout: boolean;
  programSchedule: boolean;
  personalRecord: boolean;
  workoutCompletion: boolean;
  coachFeedback?: boolean;
  programChange?: boolean;
  goalMilestone?: boolean;
  missedWorkout?: boolean;
  teamAnnouncement?: boolean;
  checkinReminder?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  role: UserRole;
  roleSelected?: boolean;
  coachId?: string;
  coachName?: string;
  organizationId?: string;
  ageGroup?: AgeGroup;
  language: Language;
  theme: ThemeMode;
  unit: WeightUnit;
  heightCm?: number;
  weightKg?: number;
  experienceLevel?: DifficultyLevel;
  trainingAgeMonths?: number;
  weeklyFrequency?: number;
  trainingGoal?: TrainingGoal;
  preferredSplit?: SplitType;
  personalNotes?: string;
  favoriteExerciseIds: string[];
  activeProgramId?: string;
  notificationSettings: NotificationSettings;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Exercise {
  id: string;
  isCustom?: boolean;
  userId?: string;
  nameEn: string;
  nameAr: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  stabilizerMuscles?: MuscleGroup[];
  movementPattern?: MovementPattern;
  equipment: EquipmentType;
  category: ExerciseCategory;
  difficulty: DifficultyLevel;
  techniqueSummaryEn?: string;
  techniqueSummaryAr?: string;
  startingPositionEn: string;
  startingPositionAr: string;
  gripStanceEn?: string;
  gripStanceAr?: string;
  instructionsEn: string[];
  instructionsAr: string[];
  phases?: MovementPhaseDetail[];
  breathingEn: string;
  breathingAr: string;
  commonMistakesEn: string[];
  commonMistakesAr: string[];
  variationsEn?: string[];
  variationsAr?: string[];
  easierAlternativeIds?: string[];
  harderAlternativeIds?: string[];
  comparisons?: ExerciseComparison[];
  safetyEn: string;
  safetyAr: string;
  alternativeIds: string[];
  personalNotes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ExerciseNote {
  exerciseId: string;
  userId: string;
  personalInstructions: string;
  notes: string;
  preferredAlternativeIds: string[];
  updatedAt?: unknown;
}

export interface WorkoutExerciseItem {
  itemId: string;
  exerciseId: string;
  exerciseNameEn: string;
  exerciseNameAr: string;
  sets: number;
  warmupSets?: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetWeightKg?: number;
  targetRpe?: number;
  targetRir?: number;
  restSeconds: number;
  technique?: SetTechnique;
  supersetGroup?: string;
  notes: string;
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  coachId?: string;
  name: string;
  description: string;
  exercises: WorkoutExerciseItem[];
  isAiGenerated?: boolean;
  assignedByCoachId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProgramDaySchedule {
  dayIndex: number; // 0 = Monday ... 6 = Sunday
  label: string;
  isRestDay: boolean;
  workoutId?: string;
  workoutName?: string;
}

export interface TrainingProgram {
  id: string;
  userId: string;
  coachId?: string;
  name: string;
  durationWeeks: number;
  goal: TrainingGoal;
  level: DifficultyLevel;
  weeklyFrequency: number;
  splitType: SplitType;
  status: ProgramStatus;
  scheduledDays: ProgramDaySchedule[];
  completedSessions: number;
  startDate?: string;
  isAiGenerated?: boolean;
  assignedByCoachId?: string;
  assignedByCoachName?: string;
  intensityGuidance?: string;
  progressionApproach?: string;
  deloadGuidance?: string;
  philosophy?: TrainingPhilosophy;
  sourceTemplateId?: string;
  originNote?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LiveSetEntry {
  setNumber: number;
  setType?: SetType;
  targetWeightKg?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  targetRpe?: number | null;
  targetRir?: number | null;
  weightKg: number;
  reps: number;
  rpe?: number | null;
  rir?: number | null;
  completed: boolean;
  isPR?: boolean;
}

export interface LiveExerciseEntry {
  itemId: string;
  exerciseId: string;
  exerciseNameEn: string;
  exerciseNameAr: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  stabilizerMuscles?: MuscleGroup[];
  technique?: SetTechnique;
  supersetGroup?: string;
  restSeconds: number;
  notes: string;
  skipped: boolean;
  sets: LiveSetEntry[];
}

export interface ActiveWorkoutSession {
  sessionId: string;
  userId: string;
  workoutId?: string;
  workoutName: string;
  programId?: string;
  programName?: string;
  startedAtMs: number;
  pausedAtMs?: number | null;
  accumulatedPauseMs: number;
  isPaused: boolean;
  currentExerciseIndex: number;
  notes: string;
  exercises: LiveExerciseEntry[];
  updatedAt?: unknown;
}

export interface WorkoutSessionHistory {
  id: string;
  userId: string;
  workoutId?: string;
  workoutName: string;
  programId?: string;
  programName?: string;
  status: 'completed';
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  totalSets: number;
  totalVolumeKg: number;
  sessionRpe?: number | null;
  notes: string;
  coachFeedback?: string;
  coachFeedbackAt?: string;
  coachId?: string;
  exercises: LiveExerciseEntry[];
  createdAt?: unknown;
}

export interface PRMilestone {
  type: 'weight' | 'reps' | 'estimated_1rm';
  value: number;
  reps?: number;
  weightKg?: number;
  date: string;
  sessionId: string;
  isTested?: boolean;
}

export interface PersonalRecord {
  exerciseId: string;
  userId: string;
  exerciseNameEn: string;
  exerciseNameAr: string;
  bestWeightKg: number;
  bestWeightReps: number;
  bestWeightDate: string;
  bestWeightSessionId: string;
  bestReps: number;
  bestRepsWeightKg: number;
  bestRepsDate: string;
  bestRepsSessionId: string;
  estimated1RMKg: number;
  estimated1RMWeightKg: number;
  estimated1RMReps: number;
  estimated1RMDate: string;
  estimated1RMSessionId: string;
  milestones: PRMilestone[];
  updatedAt?: unknown;
}

export interface PerformanceGoal {
  id: string;
  userId: string;
  title: string;
  targetType: 'weight' | 'reps' | 'estimated_1rm' | 'milestone';
  exerciseId?: string;
  exerciseNameEn?: string;
  exerciseNameAr?: string;
  targetWeightKg?: number;
  targetReps?: number;
  targetDate?: string;
  status: 'active' | 'achieved' | 'paused';
  assignedByCoachId?: string;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  coachId?: string;
  date: string;
  bodyWeightKg?: number;
  armCm?: number;
  chestCm?: number;
  waistCm?: number;
  thighCm?: number;
  customLabel?: string;
  customValue?: number;
  notes?: string;
  photoPath?: string;
  photoUrl?: string;
  isPrivatePhoto?: boolean;
  createdAt?: unknown;
}

export interface ManualMacroLog {
  dateKey: string;
  userId: string;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  notes?: string;
  updatedAt?: unknown;
}

export type ReminderType =
  | 'scheduled_workout'
  | 'program_schedule'
  | 'personal_record'
  | 'workout_completed'
  | 'coach_feedback'
  | 'program_change'
  | 'goal_milestone'
  | 'missed_workout'
  | 'team_announcement'
  | 'checkin_reminder'
  | 'subscription_alert';

export interface UserReminder {
  id: string;
  userId: string;
  type: ReminderType;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  read: boolean;
  createdAt?: unknown;
}

// Coaching & Ecosystem Models
export interface CoachGroup {
  id: string;
  coachId: string;
  organizationId?: string;
  name: string;
  description: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CoachingLink {
  id: string;
  coachId: string;
  coachName: string;
  athleteUid: string; // Empty string until athlete joins via inviteCode, or equals athleteUid when linked/managed
  athleteName: string;
  athleteEmail?: string;
  inviteCode: string;
  coachCode?: string;
  groupId?: string;
  status: 'pending' | 'active' | 'archived';
  goalSummary?: string;
  experienceLevel?: DifficultyLevel;
  weeklyTarget?: number;
  privateNotes?: string;
  assignedProgramName?: string;
  lastSessionAt?: string;
  completedSessionsCount?: number;
  recentAdherencePct?: number;
  recentPrText?: string;
  needsAttention?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CoachAssignment {
  id: string;
  coachId: string;
  coachName: string;
  athleteUid: string;
  linkId: string;
  groupId?: string;
  programName: string;
  programData: Omit<TrainingProgram, 'userId' | 'createdAt' | 'updatedAt'>;
  workoutsData: Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'>[];
  notes: string;
  status: 'assigned' | 'accepted' | 'archived';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CoachMessage {
  id: string;
  coachId: string;
  athleteUid: string;
  groupId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  type: 'direct' | 'session_feedback' | 'announcement' | 'checkin';
  sessionId?: string;
  text: string;
  read: boolean;
  createdAt?: unknown;
}

export interface ExerciseFlag {
  id: string;
  userId: string;
  userName: string;
  exerciseId: string;
  exerciseName: string;
  reason: string;
  status: 'open' | 'reviewed';
  createdAt?: unknown;
}

export interface GymOrganization {
  id: string;
  name: string;
  ownerUid: string;
  defaultLanguage: Language;
  allowAthleteSelfProgram: boolean;
  requireCoachApprovalForYouth: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrganizationMember {
  uid: string;
  organizationId: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'invited' | 'suspended';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CoachSubscriptionTier {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
}

export interface CoachProfileCode {
  coachCode: string;
  coachId: string;
  coachName: string;
  gymName?: string;
  currency: string;
  subscriptionTiers: CoachSubscriptionTier[];
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type SubscriptionPaymentStatus = 'paid' | 'partial' | 'unpaid';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface GymSubscriptionRecord {
  id: string;
  coachId: string;
  athleteUid?: string;
  linkId?: string;
  memberName: string;
  memberPhone?: string;
  tierId: string;
  tierName: string;
  tierPrice: number;
  amountPaid: number;
  currency: string;
  paymentStatus: SubscriptionPaymentStatus;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
