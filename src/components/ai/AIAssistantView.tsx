import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Dumbbell,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  formatArabicCount,
  GOAL_LABELS,
  SPLIT_LABELS,
  tLabel,
} from '../../i18n/translations';
import {
  generateSafeId,
  saveTrainingProgram,
  saveWorkoutTemplate,
  setActiveProgramId,
} from '../../services/firestoreService';
import {
  DifficultyLevel,
  EquipmentType,
  ProgramDaySchedule,
  SplitType,
  TrainingGoal,
  TrainingPhilosophy,
  WorkoutExerciseItem,
} from '../../types/ironlog';
import { detectFatigueAndSpikes } from '../../utils/calculations';
import { getApiUrl } from '../../utils/apiUrl';
import { formatAppError } from '../../utils/errorMessages';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AiDraftExercise {
  exerciseId: string;
  sets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
  targetRpe?: number;
  notes?: string;
}

interface AiDraftDay {
  dayKey: string;
  name: string;
  description?: string;
  exercises: AiDraftExercise[];
}

interface AiProgramDraft {
  name: string;
  splitType: SplitType;
  durationWeeks: number;
  weeklyFrequency: number;
  intensityGuidance: string;
  progressionApproach: string;
  deloadGuidance: string;
  safetyNote?: string;
  workoutDays: AiDraftDay[];
  weeklySchedule: { dayIndex: number; isRestDay: boolean; dayKey?: string }[];
}

interface AiAnalysisResult {
  headline: string;
  observedFacts: string[];
  improvingAreas: string[];
  stableOrPlateauAreas: string[];
  fatigueAndIntensityNotes: string;
  recommendations: string[];
  checkInQuestions: string[];
}

interface AiModifyResult {
  summary: string;
  modifiedProgramName: string;
  durationWeeks: number;
  intensityGuidance?: string;
  progressionApproach?: string;
  deloadGuidance?: string;
  workoutsToUpdate: {
    workoutId: string;
    name: string;
    description?: string;
    exercises: AiDraftExercise[];
  }[];
}

const WEEKDAY_NAMES_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AIAssistantView: React.FC = () => {
  const {
    firebaseUser,
    profile,
    userRole,
    language,
    unit,
    t,
    allExercises,
    workouts,
    programs,
    sessions,
    personalRecords,
    activeProgram,
    goals,
    coachRoster,
    setActiveSection,
    showToast,
  } = useApp();

  const isOnline = useOnlineStatus();
  const [tab, setTab] = useState<'chat' | 'program' | 'analysis'>('chat');
  const [progMode, setProgMode] = useState<'create' | 'modify'>('create');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Program generator state
  const [genPhilosophy, setGenPhilosophy] = useState<TrainingPhilosophy>('hybrid');
  const [genLevel, setGenLevel] = useState<DifficultyLevel>(profile?.experienceLevel || 'intermediate');
  const [genDays, setGenDays] = useState<number>(profile?.weeklyFrequency || 4);
  const [genWeeks, setGenWeeks] = useState<number>(8);
  const [genGoal, setGenGoal] = useState<TrainingGoal>(profile?.trainingGoal || 'hypertrophy');
  const [genEquip, setGenEquip] = useState<EquipmentType[]>([
    'barbell',
    'dumbbell',
    'cable',
    'machine',
    'bodyweight',
  ]);
  const [genPreferences, setGenPreferences] = useState('');
  const [genAvoid, setGenAvoid] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [programDraft, setProgramDraft] = useState<AiProgramDraft | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);

  // Modify existing program state
  const [modifyProgramId, setModifyProgramId] = useState<string>('');
  const [modifyInstruction, setModifyInstruction] = useState('');
  const [modifyLoading, setModifyLoading] = useState(false);
  const [modifyDraft, setModifyDraft] = useState<AiModifyResult | null>(null);
  const [applyingModify, setApplyingModify] = useState(false);

  // Performance analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);

  const exerciseMap = useMemo(() => new Map(allExercises.map((e) => [e.id, e])), [allExercises]);

  const trainingContextSnapshot = useMemo(() => {
    const recentSessions = sessions.slice(0, 12).map((s) => ({
      date: s.completedAt.slice(0, 10),
      workoutName: s.workoutName,
      durationMin: Math.round(s.durationSeconds / 60),
      totalSets: s.totalSets,
      totalVolumeKg: s.totalVolumeKg,
      sessionRpe: s.sessionRpe ?? null,
      exercises: s.exercises.slice(0, 8).map((ex) => ({
        name: language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn,
        setsCompleted: ex.sets.filter((st) => st.completed).length,
        topWeightKg: Math.max(0, ...ex.sets.filter((st) => st.completed).map((st) => st.weightKg)),
      })),
    }));

    const topPRs = Object.values(personalRecords)
      .slice(0, 15)
      .map((pr) => ({
        exercise: language === 'ar' ? pr.exerciseNameAr : pr.exerciseNameEn,
        bestWeightKg: pr.bestWeightKg,
        bestWeightReps: pr.bestWeightReps,
        estimated1RMKg: pr.estimated1RMKg,
      }));

    return {
      profile: {
        role: userRole,
        ageGroup: profile?.ageGroup || 'adult',
        unit,
        experienceLevel: profile?.experienceLevel || 'intermediate',
        trainingGoal: profile?.trainingGoal || 'hypertrophy',
        weeklyFrequency: profile?.weeklyFrequency || 4,
      },
      activeProgram: activeProgram
        ? {
            name: activeProgram.name,
            splitType: activeProgram.splitType,
            weeklyFrequency: activeProgram.weeklyFrequency,
            completedSessions: activeProgram.completedSessions,
          }
        : null,
      totalCompletedSessions: sessions.length,
      recentSessions,
      personalRecords: topPRs,
      activeGoals: goals.filter((g) => g.status === 'active').map((g) => g.title),
      fatigueAlert: detectFatigueAndSpikes(sessions),
      ...(userRole === 'coach'
        ? {
            rosterSummary: coachRoster.map((a) => ({
              athleteName: a.athleteName,
              status: a.status,
              completedSessionsCount: a.completedSessionsCount || 0,
              lastSessionAt: a.lastSessionAt || null,
              needsAttention: Boolean(a.needsAttention),
            })),
          }
        : {}),
    };
  }, [
    sessions,
    personalRecords,
    activeProgram,
    goals,
    profile,
    userRole,
    unit,
    language,
    coachRoster,
  ]);

  const sendChat = async (textOverride?: string) => {
    const prompt = (textOverride ?? chatInput).trim();
    if (!prompt || chatLoading) return;
    if (!isOnline) {
      showToast(
        language === 'ar'
          ? 'المساعد الذكي يحتاج إلى اتصال بالإنترنت. جميع التمارين والبرامج والتسجيل الحر تعمل بالكامل دون اتصال.'
          : 'AI Assistant requires an internet connection. Exercises, programs, and live tracking remain fully offline.',
        'info'
      );
      return;
    }

    const userMsg: ChatMessage = { id: generateSafeId('u'), role: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: messages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
          language,
          role: userRole === 'coach' || userRole === 'gym_admin' ? 'coach' : 'athlete',
          context: trainingContextSnapshot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI service unavailable');
      }
      setMessages((prev) => [
        ...prev,
        { id: generateSafeId('m'), role: 'model', text: data.reply || '' },
      ]);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (genLoading) return;
    setGenLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/ai/generate-program'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          philosophy: genPhilosophy,
          experienceLevel: genLevel,
          daysPerWeek: genDays,
          durationWeeks: genWeeks,
          goal: genGoal,
          equipment: genEquip,
          preferences: genPreferences,
          avoidExercises: genAvoid,
          ageGroup: profile?.ageGroup || 'adult',
          catalogExercises: allExercises.slice(0, 80).map((ex) => ({
            id: ex.id,
            nameEn: ex.nameEn,
            nameAr: ex.nameAr,
            primaryMuscles: ex.primaryMuscles,
            equipment: ex.equipment,
            category: ex.category,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Program generation failed');
      setProgramDraft(data.draft as AiProgramDraft);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setGenLoading(false);
    }
  };

  const updateDraftExercise = (
    dayIdx: number,
    exIdx: number,
    patch: Partial<AiDraftExercise>
  ) => {
    setProgramDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        workoutDays: prev.workoutDays.map((d, di) =>
          di !== dayIdx
            ? d
            : {
                ...d,
                exercises: d.exercises.map((ex, ei) => (ei === exIdx ? { ...ex, ...patch } : ex)),
              }
        ),
      };
    });
  };

  const removeDraftExercise = (dayIdx: number, exIdx: number) => {
    setProgramDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        workoutDays: prev.workoutDays.map((d, di) =>
          di !== dayIdx
            ? d
            : { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) }
        ),
      };
    });
  };

  const handleSaveAiProgram = async () => {
    if (!firebaseUser || !programDraft) return;
    setSavingDraft(true);
    try {
      const dayKeyToWorkout = new Map<string, { id: string; name: string }>();

      for (const day of programDraft.workoutDays) {
        const wId = generateSafeId('wrk');
        const workoutExercises: WorkoutExerciseItem[] = day.exercises
          .map((ex) => {
            const ref = exerciseMap.get(ex.exerciseId) || allExercises[0];
            if (!ref) return null;
            return {
              itemId: generateSafeId('wex'),
              exerciseId: ref.id,
              exerciseNameEn: ref.nameEn,
              exerciseNameAr: ref.nameAr,
              sets: Math.max(1, Math.min(12, Number(ex.sets) || 3)),
              warmupSets: 0,
              targetRepsMin: Math.max(1, Number(ex.targetRepsMin) || 8),
              targetRepsMax: Math.max(1, Number(ex.targetRepsMax) || 12),
              targetRpe: ex.targetRpe,
              restSeconds: Math.max(15, Number(ex.restSeconds) || 90),
              technique: 'standard' as const,
              notes: ex.notes || '',
            };
          })
          .filter(Boolean) as WorkoutExerciseItem[];

        await saveWorkoutTemplate(
          firebaseUser.uid,
          {
            id: wId,
            name: day.name,
            description: day.description || '',
            exercises: workoutExercises,
            isAiGenerated: true,
          },
          false,
          profile?.coachId
        );
        dayKeyToWorkout.set(day.dayKey, { id: wId, name: day.name });
      }

      const scheduledDays: ProgramDaySchedule[] = Array.from({ length: 7 }, (_, idx) => {
        const mapped = programDraft.weeklySchedule.find((s) => s.dayIndex === idx);
        const linked = mapped && !mapped.isRestDay && mapped.dayKey ? dayKeyToWorkout.get(mapped.dayKey) : undefined;
        return {
          dayIndex: idx,
          label: WEEKDAY_NAMES_EN[idx],
          isRestDay: !linked,
          workoutId: linked ? linked.id : '',
          workoutName: linked ? linked.name : '',
        };
      });

      const progId = generateSafeId('prg');
      await saveTrainingProgram(
        firebaseUser.uid,
        {
          id: progId,
          name: programDraft.name,
          durationWeeks: Math.max(1, programDraft.durationWeeks || 8),
          goal: genGoal,
          level: genLevel,
          weeklyFrequency: Math.max(1, Math.min(7, programDraft.weeklyFrequency || genDays)),
          splitType: programDraft.splitType || 'custom',
          status: 'active',
          philosophy: genPhilosophy,
          originNote:
            language === 'ar'
              ? `تم توليده بالمدرب الذكي (${genPhilosophy === 'hybrid' ? 'هجين' : genPhilosophy === 'old_school' ? 'المدرسة الكلاسيكية' : 'علمي حديث'})`
              : `AI-designed draft (${genPhilosophy.replace('_', ' ')})`,
          scheduledDays,
          completedSessions: 0,
          startDate: new Date().toISOString().slice(0, 10),
          isAiGenerated: true,
          intensityGuidance: programDraft.intensityGuidance,
          progressionApproach: programDraft.progressionApproach,
          deloadGuidance: programDraft.deloadGuidance,
        },
        false,
        profile?.coachId
      );
      await setActiveProgramId(firebaseUser.uid, progId);
      showToast(t.common.savedSuccess);
      setActiveSection('programs');
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  const selectedTargetProgram = useMemo(() => {
    const id = modifyProgramId || activeProgram?.id || programs[0]?.id || '';
    return programs.find((p) => p.id === id) || null;
  }, [modifyProgramId, activeProgram?.id, programs]);

  const handleRequestModify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetProgram || !modifyInstruction.trim() || modifyLoading) return;
    setModifyLoading(true);
    try {
      const linkedIds = new Set(
        selectedTargetProgram.scheduledDays
          .filter((d) => !d.isRestDay && d.workoutId)
          .map((d) => d.workoutId)
      );
      const linkedWorkouts = workouts
        .filter((w) => linkedIds.has(w.id))
        .map((w) => ({
          workoutId: w.id,
          name: w.name,
          description: w.description || '',
          exercises: w.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            targetRepsMin: ex.targetRepsMin,
            targetRepsMax: ex.targetRepsMax,
            restSeconds: ex.restSeconds,
            targetRpe: ex.targetRpe,
            notes: ex.notes || '',
          })),
        }));

      const res = await fetch(getApiUrl('/api/ai/modify-program'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          philosophy: selectedTargetProgram.philosophy || genPhilosophy,
          instruction: modifyInstruction.trim(),
          currentProgram: {
            id: selectedTargetProgram.id,
            name: selectedTargetProgram.name,
            goal: selectedTargetProgram.goal,
            level: selectedTargetProgram.level,
            durationWeeks: selectedTargetProgram.durationWeeks,
            weeklyFrequency: selectedTargetProgram.weeklyFrequency,
            splitType: selectedTargetProgram.splitType,
          },
          linkedWorkouts,
          catalogExercises: allExercises.slice(0, 80).map((ex) => ({
            id: ex.id,
            nameEn: ex.nameEn,
            nameAr: ex.nameAr,
            primaryMuscles: ex.primaryMuscles,
            equipment: ex.equipment,
            category: ex.category,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Modification failed');
      setModifyDraft(data.modification as AiModifyResult);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setModifyLoading(false);
    }
  };

  const handleApplyModify = async () => {
    if (!firebaseUser || !selectedTargetProgram || !modifyDraft || applyingModify) return;
    setApplyingModify(true);
    try {
      const updatedNamesById = new Map<string, string>();
      for (const wMod of modifyDraft.workoutsToUpdate) {
        const existingWorkout = workouts.find((w) => w.id === wMod.workoutId);
        if (!existingWorkout) continue;
        const mappedExercises: WorkoutExerciseItem[] = wMod.exercises
          .map((ex) => {
            const ref = exerciseMap.get(ex.exerciseId) || allExercises[0];
            if (!ref) return null;
            return {
              itemId: generateSafeId('wex'),
              exerciseId: ref.id,
              exerciseNameEn: ref.nameEn,
              exerciseNameAr: ref.nameAr,
              sets: Math.max(1, Math.min(12, Number(ex.sets) || 3)),
              warmupSets: 0,
              targetRepsMin: Math.max(1, Number(ex.targetRepsMin) || 8),
              targetRepsMax: Math.max(1, Number(ex.targetRepsMax) || 12),
              targetRpe: ex.targetRpe,
              restSeconds: Math.max(15, Number(ex.restSeconds) || 90),
              technique: 'standard' as const,
              notes: ex.notes || '',
            };
          })
          .filter(Boolean) as WorkoutExerciseItem[];

        await saveWorkoutTemplate(
          firebaseUser.uid,
          {
            id: existingWorkout.id,
            name: wMod.name || existingWorkout.name,
            description: wMod.description ?? existingWorkout.description ?? '',
            exercises: mappedExercises,
          },
          true,
          profile?.coachId
        );
        updatedNamesById.set(existingWorkout.id, wMod.name || existingWorkout.name);
      }

      const nextScheduledDays = selectedTargetProgram.scheduledDays.map((day) => {
        if (day.isRestDay || !day.workoutId) return day;
        const newName = updatedNamesById.get(day.workoutId);
        return newName ? { ...day, workoutName: newName } : day;
      });

      await saveTrainingProgram(
        firebaseUser.uid,
        {
          ...selectedTargetProgram,
          name: modifyDraft.modifiedProgramName || selectedTargetProgram.name,
          durationWeeks: Math.max(1, modifyDraft.durationWeeks || selectedTargetProgram.durationWeeks),
          scheduledDays: nextScheduledDays,
          intensityGuidance: modifyDraft.intensityGuidance ?? selectedTargetProgram.intensityGuidance,
          progressionApproach:
            modifyDraft.progressionApproach ?? selectedTargetProgram.progressionApproach,
          deloadGuidance: modifyDraft.deloadGuidance ?? selectedTargetProgram.deloadGuidance,
        },
        true,
        profile?.coachId
      );

      setModifyDraft(null);
      setModifyInstruction('');
      showToast(t.common.savedSuccess);
      setActiveSection('programs');
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setApplyingModify(false);
    }
  };

  const handleAnalyzePerformance = async () => {
    if (analysisLoading) return;
    setAnalysisLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/ai/analyze-performance'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          role: userRole === 'coach' || userRole === 'gym_admin' ? 'coach' : 'athlete',
          athleteName: profile?.displayName || (language === 'ar' ? 'رياضي' : 'Athlete'),
          summaryData: trainingContextSnapshot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysisResult(data.analysis as AiAnalysisResult);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const toggleEquip = (eq: EquipmentType) => {
    setGenEquip((prev) =>
      prev.includes(eq) ? (prev.length > 1 ? prev.filter((x) => x !== eq) : prev) : [...prev, eq]
    );
  };

  const quickPrompts =
    language === 'ar'
      ? [
          'حلل حجم التمرين الأسبوعي بناءً على جلساتي المسجلة واقترح تحسيناً',
          'كيف أطبق التدرج في الأوزان مع الحفاظ على RIR 2؟',
          'هل توجد علامات إجهاد أو قفزة في الحمل التدريبي في سجلي الأخير؟',
        ]
      : [
          'Review my logged training volume and suggest safe progression adjustments.',
          'How should I balance RPE 8 working sets and deload timing this block?',
          'Summarize my strongest lifts and lagging muscle groups from my logs.',
        ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            {t.nav.ai}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t.apex.aiDisclaimer}</p>
        </div>

        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
          {(
            [
              ['chat', t.apex.aiChatTab, Bot],
              ['program', t.apex.aiProgramTab, Dumbbell],
              ['analysis', t.apex.aiAnalysisTab, Activity],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                tab === key
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {profile?.ageGroup === 'youth' && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {language === 'ar'
              ? 'حساب رياضي ناشئ: يُركّز المساعد الذكي على إتقان التكنيك والأحمال المعتدلة بإشراف مدرب مؤهل.'
              : 'Youth athlete profile active: guidance emphasizes technical mastery, moderate loads, and qualified coaching supervision.'}
          </p>
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {language === 'ar'
              ? 'أنت الآن في وضع عدم الاتصال: ميزة المحادثة وتوليد البرامج بالذكاء الاصطناعي تتطلب اتصالاً بالإنترنت، بينما مكتبة التمارين والصور الإيضاحية ومقاطع الفيديو المحفوظة وتسجيل التمارين تعمل بالكامل دون اتصال.'
              : 'You are currently offline: AI generation requires an internet connection, while your exercise library, illustrated guides, saved videos, programs, and live workout logging work 100% offline.'}
          </p>
        </div>
      )}

      {/* TAB 1: AI COACH CHAT */}
      {tab === 'chat' && (
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col h-[66vh] min-h-[440px]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {messages.length === 0 ? (
              <div className="py-8 text-center space-y-4">
                <Bot className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                  {language === 'ar'
                    ? 'اسألني عن تصميم التمارين، التدرج في الأوزان، تحليل جلساتك المسجلة، أو استراتيجية الاستشفاء.'
                    : 'Ask about exercise selection, load progression, analyzing your saved sessions, or fatigue management.'}
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                  {quickPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendChat(qp)}
                      className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 text-xs text-start cursor-pointer"
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="text-xs text-neutral-500 px-2">{t.common.loading}</div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendChat();
            }}
            className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                language === 'ar' ? 'اكتب سؤالك التدريبي هنا...' : 'Ask a training or coaching question...'
              }
              className="flex-1 min-h-[44px] px-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              aria-label={language === 'ar' ? 'إرسال' : 'Send'}
              className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4 rtl:-scale-x-100" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: EDITABLE AI PROGRAM GENERATOR & MODIFIER */}
      {tab === 'program' && (
        <div className="space-y-6">
          <div className="inline-flex rounded-xl p-1 bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setProgMode('create')}
              className={`min-h-[38px] px-4 rounded-lg text-xs font-semibold cursor-pointer ${
                progMode === 'create'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t.apex.aiCreateMode}
            </button>
            <button
              type="button"
              onClick={() => setProgMode('modify')}
              className={`min-h-[38px] px-4 rounded-lg text-xs font-semibold cursor-pointer ${
                progMode === 'modify'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t.apex.aiModifyMode}
            </button>
          </div>

          {progMode === 'modify' ? (
            <div className="space-y-5">
              {programs.length === 0 ? (
                <div className="bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-6 text-sm text-neutral-500">
                  {t.apex.aiNoProgramsToModify}
                </div>
              ) : (
                <form
                  onSubmit={handleRequestModify}
                  className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4"
                >
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">
                      {t.apex.aiSelectProgramModify}
                    </label>
                    <select
                      value={selectedTargetProgram?.id || ''}
                      onChange={(e) => setModifyProgramId(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                    >
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">
                      {t.apex.aiModifyMode}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={modifyInstruction}
                      onChange={(e) => setModifyInstruction(e.target.value)}
                      placeholder={t.apex.aiModifyInstruction}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={modifyLoading || !modifyInstruction.trim()}
                    className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    {modifyLoading ? t.common.loading : t.apex.aiModifyBtn}
                  </button>
                </form>
              )}

              {modifyDraft && (
                <div className="bg-white dark:bg-[#121417] border border-emerald-500/40 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{modifyDraft.modifiedProgramName}</h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        {modifyDraft.summary}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={applyingModify}
                      onClick={handleApplyModify}
                      className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {applyingModify ? t.common.loading : t.apex.aiApplyModifyBtn}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {modifyDraft.workoutsToUpdate.map((wMod) => (
                      <div
                        key={wMod.workoutId}
                        className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-2"
                      >
                        <p className="text-sm font-semibold">{wMod.name}</p>
                        <div className="divide-y divide-neutral-200 dark:divide-neutral-800/70 text-xs">
                          {wMod.exercises.map((ex, idx) => {
                            const ref = exerciseMap.get(ex.exerciseId);
                            return (
                              <div key={idx} className="py-2 flex items-center justify-between gap-2">
                                <span className="font-medium">
                                  {ref ? (language === 'ar' ? ref.nameAr : ref.nameEn) : ex.exerciseId}
                                </span>
                                <span className="font-mono tabular-nums text-neutral-500">
                                  {ex.sets} × {ex.targetRepsMin}-{ex.targetRepsMax} · {ex.restSeconds}
                                  {language === 'ar' ? ' ث' : 's'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
          <form
            onSubmit={handleGenerateProgram}
            className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-[11px] text-neutral-500">{t.apex.selectPhilosophy}</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'modern', label: t.apex.philModern },
                    { id: 'old_school', label: t.apex.philOldSchool },
                    { id: 'hybrid', label: t.apex.philHybrid },
                  ] as { id: TrainingPhilosophy; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGenPhilosophy(item.id)}
                    className={`min-h-[42px] px-3 rounded-xl text-xs font-semibold border cursor-pointer ${
                      genPhilosophy === item.id
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">{t.programs.level}</label>
                <select
                  value={genLevel}
                  onChange={(e) => setGenLevel(e.target.value as DifficultyLevel)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((l) => (
                    <option key={l} value={l}>
                      {tLabel(DIFFICULTY_LABELS[l], language)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">{t.programs.goal}</label>
                <select
                  value={genGoal}
                  onChange={(e) => setGenGoal(e.target.value as TrainingGoal)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  {(Object.keys(GOAL_LABELS) as TrainingGoal[]).map((g) => (
                    <option key={g} value={g}>
                      {tLabel(GOAL_LABELS[g], language)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">{t.programs.weeklyFreq}</label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={genDays}
                  onChange={(e) => setGenDays(Number(e.target.value) || 4)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">{t.programs.durationWeeks}</label>
                <input
                  type="number"
                  min={4}
                  max={16}
                  value={genWeeks}
                  onChange={(e) => setGenWeeks(Number(e.target.value) || 8)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] text-neutral-500">{t.exercises.equipmentRequired}</label>
              <div className="flex flex-wrap gap-2">
                {(['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'resistance_bands'] as EquipmentType[]).map(
                  (eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquip(eq)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                        genEquip.includes(eq)
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800 text-neutral-500'
                      }`}
                    >
                      {tLabel(EQUIPMENT_LABELS[eq], language)}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={genPreferences}
                onChange={(e) => setGenPreferences(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'تفضيلات إضافية (مثال: تركيز على الأكتاف والظهر)'
                    : 'Preferences (e.g., extra upper back & deltoid focus)'
                }
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <input
                type="text"
                value={genAvoid}
                onChange={(e) => setGenAvoid(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'تمارين أو حركات يجب تجنبها (اختياري)'
                    : 'Exercises or movements to avoid (optional)'
                }
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={genLoading}
              className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {genLoading ? t.common.loading : t.apex.aiGenerateBtn}
            </button>
          </form>

          {programDraft && (
            <div className="bg-white dark:bg-[#121417] border border-emerald-500/40 rounded-2xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={programDraft.name}
                    onChange={(e) => setProgramDraft({ ...programDraft, name: e.target.value })}
                    className="w-full text-lg font-bold bg-transparent border-b border-neutral-200 dark:border-neutral-800 pb-1 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {tLabel(SPLIT_LABELS[programDraft.splitType] || SPLIT_LABELS.custom, language)} ·{' '}
                    {language === 'ar'
                      ? `${formatArabicCount(programDraft.weeklyFrequency, 'يوم', 'يومان', 'أيام', 'يوماً')}/أسبوع · ${formatArabicCount(programDraft.durationWeeks, 'أسبوع', 'أسبوعان', 'أسابيع', 'أسبوعاً')}`
                      : `${programDraft.weeklyFrequency} d/wk · ${programDraft.durationWeeks} w`}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={savingDraft}
                  onClick={handleSaveAiProgram}
                  className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {savingDraft ? t.common.loading : t.apex.aiSaveProgramBtn}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-neutral-50 dark:bg-[#090A0B] p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div>
                  <strong className="text-emerald-500 block mb-0.5">{t.apex.progressionMethod}</strong>
                  <p className="text-neutral-600 dark:text-neutral-300">{programDraft.progressionApproach}</p>
                </div>
                <div>
                  <strong className="text-amber-500 block mb-0.5">{t.apex.intensityGuidance}</strong>
                  <p className="text-neutral-600 dark:text-neutral-300">{programDraft.intensityGuidance}</p>
                </div>
                <div>
                  <strong className="text-sky-500 block mb-0.5">{t.apex.deloadGuidance}</strong>
                  <p className="text-neutral-600 dark:text-neutral-300">{programDraft.deloadGuidance}</p>
                </div>
              </div>

              <div className="space-y-4">
                {programDraft.workoutDays.map((day, dIdx) => (
                  <div
                    key={day.dayKey}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3"
                  >
                    <input
                      type="text"
                      value={day.name}
                      onChange={(e) =>
                        setProgramDraft({
                          ...programDraft,
                          workoutDays: programDraft.workoutDays.map((wd, i) =>
                            i === dIdx ? { ...wd, name: e.target.value } : wd
                          ),
                        })
                      }
                      className="font-semibold text-sm bg-transparent border-b border-neutral-200 dark:border-neutral-800 pb-1 w-full"
                    />
                    <div className="space-y-2">
                      {day.exercises.map((ex, eIdx) => {
                        const ref = exerciseMap.get(ex.exerciseId);
                        return (
                          <div
                            key={eIdx}
                            className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-[#121417] p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs"
                          >
                            <div className="col-span-12 sm:col-span-5 font-medium truncate">
                              {ref ? (language === 'ar' ? ref.nameAr : ref.nameEn) : ex.exerciseId}
                            </div>
                            <div className="col-span-3 sm:col-span-2">
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={ex.sets}
                                onChange={(e) =>
                                  updateDraftExercise(dIdx, eIdx, { sets: Number(e.target.value) || 3 })
                                }
                                aria-label={t.common.sets}
                                className="w-full min-h-[34px] px-2 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-center"
                              />
                            </div>
                            <div className="col-span-4 sm:col-span-2 flex items-center gap-1">
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={ex.targetRepsMin}
                                onChange={(e) =>
                                  updateDraftExercise(dIdx, eIdx, {
                                    targetRepsMin: Number(e.target.value) || 8,
                                  })
                                }
                                className="w-full min-h-[34px] px-1 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-center"
                              />
                              <span>-</span>
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={ex.targetRepsMax}
                                onChange={(e) =>
                                  updateDraftExercise(dIdx, eIdx, {
                                    targetRepsMax: Number(e.target.value) || 12,
                                  })
                                }
                                className="w-full min-h-[34px] px-1 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-center"
                              />
                            </div>
                            <div className="col-span-3 sm:col-span-2">
                              <input
                                type="number"
                                min={15}
                                max={360}
                                step={15}
                                value={ex.restSeconds}
                                onChange={(e) =>
                                  updateDraftExercise(dIdx, eIdx, {
                                    restSeconds: Number(e.target.value) || 90,
                                  })
                                }
                                className="w-full min-h-[34px] px-2 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-center"
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeDraftExercise(dIdx, eIdx)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      )}

      {/* TAB 3: PERFORMANCE & FATIGUE ANALYSIS */}
      {tab === 'analysis' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold">{t.apex.aiAnalysisTab}</h2>
              <p className="text-xs text-neutral-500">
                {language === 'ar'
                  ? `سيتم التحليل اعتماداً على ${formatArabicCount(sessions.length, 'جلسة مسجلة', 'جلستين مسجلتين', 'جلسات مسجلة', 'جلسة مسجلة')} فقط.`
                  : `Analysis strictly grounded in your ${sessions.length} recorded workout sessions.`}
              </p>
            </div>
            <button
              type="button"
              disabled={analysisLoading}
              onClick={handleAnalyzePerformance}
              className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Activity className="w-4 h-4" />
              {analysisLoading ? t.common.loading : t.apex.aiAnalyzeBtn}
            </button>
          </div>

          {analysisResult && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#121417] border border-emerald-500/40 rounded-2xl p-5 space-y-2">
                <h3 className="text-lg font-bold">{analysisResult.headline}</h3>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {analysisResult.fatigueAndIntensityNotes}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-sm font-bold text-emerald-500">
                    {language === 'ar' ? 'حقائق مرصودة من السجل' : 'Observed Facts (Logged Data)'}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 list-disc list-inside leading-relaxed">
                    {analysisResult.observedFacts.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-sm font-bold text-sky-500">
                    {language === 'ar' ? 'توصيات عملية' : 'Practical Recommendations'}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 list-disc list-inside leading-relaxed">
                    {analysisResult.recommendations.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-sm font-bold text-emerald-500">
                    {language === 'ar' ? 'نقاط التطور' : 'Improving Areas'}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 list-disc list-inside leading-relaxed">
                    {analysisResult.improvingAreas.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-sm font-bold text-amber-500">
                    {language === 'ar' ? 'أسئلة المتابعة الأسبوعية' : 'Weekly Check-In Questions'}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 list-disc list-inside leading-relaxed">
                    {analysisResult.checkInQuestions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
