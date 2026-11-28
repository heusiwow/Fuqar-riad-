import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Dumbbell,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURATED_PROGRAM_TEMPLATES, localizeTemplateNote } from '../../data/programTemplates';
import {
  DIFFICULTY_LABELS,
  GOAL_LABELS,
  MUSCLE_LABELS,
  SPLIT_LABELS,
  tLabel,
  WEEKDAYS,
} from '../../i18n/translations';
import { generateSafeId, sendCoachAssignment } from '../../services/firestoreService';
import {
  CoachingLink,
  DifficultyLevel,
  MuscleGroup,
  SplitType,
  TrainingGoal,
  WorkoutExerciseItem,
  WorkoutTemplate,
} from '../../types/ironlog';
import { toDisplayWeight, toStorageKg } from '../../utils/calculations';
import { formatAppError } from '../../utils/errorMessages';

interface CustomCourseModalProps {
  link: CoachingLink;
  onClose: () => void;
  onAssigned: (link: CoachingLink, programName: string) => void;
}

interface DayDraft {
  dayIndex: number;
  isRestDay: boolean;
  workoutName: string;
  exercises: WorkoutExerciseItem[];
}

function buildBlankDays(): DayDraft[] {
  return WEEKDAYS.map((wd) => ({
    dayIndex: wd.index,
    isRestDay: wd.index >= 5,
    workoutName: '',
    exercises: [],
  }));
}

export const CustomCourseModal: React.FC<CustomCourseModalProps> = ({
  link,
  onClose,
  onAssigned,
}) => {
  const {
    firebaseUser,
    profile,
    language,
    unit,
    t,
    allExercises,
    programs,
    workouts,
    showToast,
  } = useApp();

  const unitText = unit === 'lb' ? t.common.lb : t.common.kg;

  const [sourceTab, setSourceTab] = useState<'custom' | 'curated' | 'my'>('custom');
  const [courseName, setCourseName] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(6);
  const [goal, setGoal] = useState<TrainingGoal>('hypertrophy');
  const [level, setLevel] = useState<DifficultyLevel>(link.experienceLevel || 'intermediate');
  const [coachNotes, setCoachNotes] = useState('');

  // Custom 7-day builder state
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [days, setDays] = useState<DayDraft[]>(() => buildBlankDays());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exSearch, setExSearch] = useState('');
  const [exMuscleFilter, setExMuscleFilter] = useState<MuscleGroup | 'all'>('all');

  // Library / Saved programs state
  const [selectedTplId, setSelectedTplId] = useState(CURATED_PROGRAM_TEMPLATES[0].id);
  const [selectedMyProgId, setSelectedMyProgId] = useState(programs[0]?.id || '');

  const [submitting, setSubmitting] = useState(false);

  const activeDay = days[selectedDayIdx];

  const filteredExercises = useMemo(() => {
    const q = exSearch.trim().toLowerCase();
    return allExercises
      .filter((ex) => {
        if (exMuscleFilter !== 'all' && !ex.primaryMuscles.includes(exMuscleFilter)) {
          return false;
        }
        if (q) {
          const hay = `${ex.nameEn} ${ex.nameAr}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .slice(0, 40);
  }, [allExercises, exSearch, exMuscleFilter]);

  const handlePrefillFromTemplate = (tplId: string) => {
    if (!tplId) return;
    const tpl = CURATED_PROGRAM_TEMPLATES.find((c) => c.id === tplId);
    if (!tpl) return;
    if (!courseName.trim()) {
      setCourseName(language === 'ar' ? tpl.nameAr : tpl.nameEn);
    }
    setDurationWeeks(tpl.durationWeeks);
    setGoal(tpl.goal);
    setLevel(tpl.level);

    const nextDays = WEEKDAYS.map((wd) => {
      const matched = tpl.workouts.find((w) => w.dayIndex === wd.index);
      if (!matched) {
        return {
          dayIndex: wd.index,
          isRestDay: true,
          workoutName: '',
          exercises: [],
        };
      }
      return {
        dayIndex: wd.index,
        isRestDay: false,
        workoutName: language === 'ar' ? matched.workoutNameAr : matched.workoutNameEn,
        exercises: matched.exercises.map((ex) => ({
          ...ex,
          itemId: generateSafeId('wex'),
          notes: localizeTemplateNote(ex.notes, language),
        })),
      };
    });
    setDays(nextDays);
    const firstTrain = nextDays.findIndex((d) => !d.isRestDay);
    if (firstTrain >= 0) setSelectedDayIdx(firstTrain);
  };

  const patchDay = (dayIdx: number, patch: Partial<DayDraft>) => {
    setDays((prev) => prev.map((d, i) => (i === dayIdx ? { ...d, ...patch } : d)));
  };

  const handleAddExerciseToActiveDay = (exerciseId: string) => {
    const refEx = allExercises.find((e) => e.id === exerciseId);
    if (!refEx) return;
    const newItem: WorkoutExerciseItem = {
      itemId: generateSafeId('wex'),
      exerciseId: refEx.id,
      exerciseNameEn: refEx.nameEn,
      exerciseNameAr: refEx.nameAr,
      sets: 3,
      warmupSets: 0,
      targetRepsMin: 8,
      targetRepsMax: 12,
      restSeconds: 90,
      technique: 'standard',
      notes: '',
    };
    setDays((prev) =>
      prev.map((d, i) =>
        i === selectedDayIdx
          ? {
              ...d,
              isRestDay: false,
              workoutName:
                d.workoutName ||
                (language === 'ar'
                  ? `تمرين ${WEEKDAYS[selectedDayIdx].ar}`
                  : `${WEEKDAYS[selectedDayIdx].en} Session`),
              exercises: [...d.exercises, newItem],
            }
          : d
      )
    );
    setPickerOpen(false);
  };

  const updateExerciseItem = (itemId: string, patch: Partial<WorkoutExerciseItem>) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === selectedDayIdx
          ? {
              ...d,
              exercises: d.exercises.map((ex) =>
                ex.itemId === itemId ? { ...ex, ...patch } : ex
              ),
            }
          : d
      )
    );
  };

  const moveExerciseItem = (idx: number, dir: -1 | 1) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== selectedDayIdx) return d;
        const targetIdx = idx + dir;
        if (targetIdx < 0 || targetIdx >= d.exercises.length) return d;
        const copy = [...d.exercises];
        const [removed] = copy.splice(idx, 1);
        copy.splice(targetIdx, 0, removed);
        return { ...d, exercises: copy };
      })
    );
  };

  const removeExerciseItem = (itemId: string) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === selectedDayIdx
          ? { ...d, exercises: d.exercises.filter((ex) => ex.itemId !== itemId) }
          : d
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !link.athleteUid) return;
    setSubmitting(true);
    try {
      const coachDisplayName = profile?.displayName || (language === 'ar' ? 'الكابتن' : 'Coach');

      if (sourceTab === 'custom') {
        const activeTrainingDays = days.filter((d) => !d.isRestDay && d.exercises.length > 0);
        if (activeTrainingDays.length === 0) {
          showToast(
            language === 'ar'
              ? 'أضف تمريناً واحداً على الأقل في أحد أيام الكورس قبل الإرسال.'
              : 'Add at least one training day with exercises before sending.',
            'error'
          );
          setSubmitting(false);
          return;
        }

        const workoutsData: Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'>[] = [];
        const scheduledDays = WEEKDAYS.map((wd) => {
          const draft = days[wd.index];
          if (!draft || draft.isRestDay || draft.exercises.length === 0) {
            return {
              dayIndex: wd.index,
              label: wd.en,
              isRestDay: true,
              workoutId: '',
              workoutName: '',
            };
          }
          const wId = generateSafeId('cw');
          const wName =
            draft.workoutName.trim() ||
            (language === 'ar' ? `تمرين ${wd.ar}` : `${wd.en} Workout`);
          workoutsData.push({
            id: wId,
            name: wName,
            description: coachNotes.trim(),
            exercises: draft.exercises.map((ex) => ({
              ...ex,
              itemId: generateSafeId('wex'),
            })),
          });
          return {
            dayIndex: wd.index,
            label: wd.en,
            isRestDay: false,
            workoutId: wId,
            workoutName: wName,
          };
        });

        const finalName =
          courseName.trim() ||
          (language === 'ar'
            ? `كورس مخصص — ${link.athleteName}`
            : `Custom Course — ${link.athleteName}`);

        const freq = Math.max(1, Math.min(7, activeTrainingDays.length));
        const inferredSplit: SplitType =
          freq >= 5 ? 'push_pull_legs' : freq === 4 ? 'upper_lower' : 'custom';

        await sendCoachAssignment({
          id: generateSafeId('asgn'),
          coachId: firebaseUser.uid,
          coachName: coachDisplayName,
          athleteUid: link.athleteUid,
          linkId: link.id,
          groupId: link.groupId || '',
          programName: finalName,
          programData: {
            id: generateSafeId('cp'),
            name: finalName,
            durationWeeks: Math.max(1, Math.min(52, Number(durationWeeks) || 6)),
            goal,
            level,
            weeklyFrequency: freq,
            splitType: inferredSplit,
            status: 'active',
            scheduledDays,
            completedSessions: 0,
            startDate: new Date().toISOString().slice(0, 10),
          },
          workoutsData,
          notes: coachNotes.trim(),
          status: 'assigned',
        });

        onAssigned(link, finalName);
        showToast(
          language === 'ar'
            ? `تم إرسال وتفعيل «${finalName}» لدى ${link.athleteName} مع إشعار فوري`
            : `Sent "${finalName}" to ${link.athleteName} with auto-activation`
        );
        onClose();
        return;
      }

      if (sourceTab === 'curated') {
        const tpl =
          CURATED_PROGRAM_TEMPLATES.find((c) => c.id === selectedTplId) ||
          CURATED_PROGRAM_TEMPLATES[0];
        const workoutsData: Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'>[] = [];
        const scheduledDays = WEEKDAYS.map((wd) => ({
          dayIndex: wd.index,
          label: wd.en,
          isRestDay: true,
          workoutId: '',
          workoutName: '',
        }));
        for (const w of tpl.workouts) {
          const wId = generateSafeId('cw');
          const wName = language === 'ar' ? w.workoutNameAr : w.workoutNameEn;
          workoutsData.push({
            id: wId,
            name: wName,
            description: language === 'ar' ? w.descriptionAr : w.descriptionEn,
            exercises: w.exercises.map((ex) => ({
              ...ex,
              itemId: generateSafeId('wex'),
              notes: localizeTemplateNote(ex.notes, language),
            })),
          });
          if (scheduledDays[w.dayIndex]) {
            scheduledDays[w.dayIndex] = {
              dayIndex: w.dayIndex,
              label: WEEKDAYS[w.dayIndex].en,
              isRestDay: false,
              workoutId: wId,
              workoutName: wName,
            };
          }
        }
        const finalName = courseName.trim() || (language === 'ar' ? tpl.nameAr : tpl.nameEn);
        await sendCoachAssignment({
          id: generateSafeId('asgn'),
          coachId: firebaseUser.uid,
          coachName: coachDisplayName,
          athleteUid: link.athleteUid,
          linkId: link.id,
          groupId: link.groupId || '',
          programName: finalName,
          programData: {
            id: generateSafeId('cp'),
            name: finalName,
            durationWeeks: tpl.durationWeeks,
            goal: tpl.goal,
            level: tpl.level,
            weeklyFrequency: tpl.weeklyFrequency,
            splitType: tpl.splitType,
            status: 'active',
            philosophy: tpl.philosophy,
            sourceTemplateId: tpl.id,
            originNote:
              language === 'ar'
                ? `${tpl.originCreatorAr} — ${tpl.apexAdaptationAr}`
                : `${tpl.originCreatorEn} — ${tpl.apexAdaptationEn}`,
            scheduledDays,
            completedSessions: 0,
            startDate: new Date().toISOString().slice(0, 10),
            progressionApproach:
              language === 'ar' ? tpl.progressionApproachAr : tpl.progressionApproachEn,
            deloadGuidance: language === 'ar' ? tpl.deloadGuidanceAr : tpl.deloadGuidanceEn,
            intensityGuidance:
              language === 'ar' ? tpl.intensityGuidanceAr : tpl.intensityGuidanceEn,
          },
          workoutsData,
          notes: coachNotes.trim(),
          status: 'assigned',
        });

        onAssigned(link, finalName);
        showToast(
          language === 'ar'
            ? `تم إرسال وتفعيل «${finalName}» لدى ${link.athleteName}`
            : `Sent "${finalName}" to ${link.athleteName}`
        );
        onClose();
        return;
      }

      // sourceTab === 'my'
      const prog = programs.find((p) => p.id === selectedMyProgId) || programs[0];
      if (!prog) {
        showToast(t.programs.noPrograms, 'error');
        setSubmitting(false);
        return;
      }
      const linkedWorkoutIds = new Set(
        prog.scheduledDays.filter((d) => !d.isRestDay && d.workoutId).map((d) => d.workoutId!)
      );
      const workoutsData = workouts
        .filter((w) => linkedWorkoutIds.has(w.id))
        .map(({ userId: _u, createdAt: _c, updatedAt: _up, ...rest }) => rest);
      const finalName = courseName.trim() || prog.name;
      const { userId: _pu, createdAt: _pc, updatedAt: _pup, ...progRest } = prog;

      await sendCoachAssignment({
        id: generateSafeId('asgn'),
        coachId: firebaseUser.uid,
        coachName: coachDisplayName,
        athleteUid: link.athleteUid,
        linkId: link.id,
        groupId: link.groupId || '',
        programName: finalName,
        programData: { ...progRest, name: finalName },
        workoutsData,
        notes: coachNotes.trim(),
        status: 'assigned',
      });

      onAssigned(link, finalName);
      showToast(
        language === 'ar'
          ? `تم إرسال وتفعيل «${finalName}» لدى ${link.athleteName}`
          : `Sent "${finalName}" to ${link.athleteName}`
      );
      onClose();
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold truncate">
              {t.apex.coachCustomCourseTitle}: {link.athleteName}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
              {t.apex.coachCustomCourseSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Source Switch */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setSourceTab('custom')}
              className={`min-h-[38px] px-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                sourceTab === 'custom'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {language === 'ar' ? 'تصميم كورس مخصص' : 'Custom Builder'}
            </button>
            <button
              type="button"
              onClick={() => setSourceTab('curated')}
              className={`min-h-[38px] px-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                sourceTab === 'curated'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t.apex.programLibraryTab}
            </button>
            <button
              type="button"
              onClick={() => setSourceTab('my')}
              className={`min-h-[38px] px-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                sourceTab === 'my'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t.apex.myProgramsTab}
            </button>
          </div>

          {/* Course Name */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {t.apex.coachCourseNameLabel}
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder={
                language === 'ar'
                  ? `مثال: كورس تضخيم مخصص لـ ${link.athleteName}`
                  : `e.g., Custom Hypertrophy Plan for ${link.athleteName}`
              }
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {sourceTab === 'custom' && (
            <div className="space-y-4">
              {/* Metadata & Prefill */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as TrainingGoal)}
                  className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  {(Object.keys(GOAL_LABELS) as TrainingGoal[]).map((g) => (
                    <option key={g} value={g}>
                      {tLabel(GOAL_LABELS[g], language)}
                    </option>
                  ))}
                </select>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                  className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((l) => (
                    <option key={l} value={l}>
                      {tLabel(DIFFICULTY_LABELS[l], language)}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs">
                  <span className="text-neutral-500 shrink-0">
                    {language === 'ar' ? 'الأسابيع:' : 'Weeks:'}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value) || 6)}
                    className="w-full bg-transparent font-mono tabular-nums focus:outline-none"
                  />
                </div>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    handlePrefillFromTemplate(e.target.value);
                    e.target.value = '';
                  }}
                  className="min-h-[40px] px-3 rounded-xl bg-emerald-500/8 border border-emerald-500/30 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                >
                  <option value="">{t.apex.coachLoadFromTemplate}</option>
                  {CURATED_PROGRAM_TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {language === 'ar' ? tpl.nameAr : tpl.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* 7-Day Schedule Strip */}
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((wd, idx) => {
                  const d = days[idx];
                  const isSel = selectedDayIdx === idx;
                  const activeExCount = d.isRestDay ? 0 : d.exercises.length;
                  return (
                    <button
                      key={wd.index}
                      type="button"
                      onClick={() => setSelectedDayIdx(idx)}
                      className={`min-h-[38px] px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isSel
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : activeExCount > 0
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <span>{language === 'ar' ? wd.ar : wd.shortEn}</span>
                      {activeExCount > 0 && (
                        <span className="font-mono text-[10px] opacity-85">({activeExCount})</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Day Editor */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">
                      {language === 'ar'
                        ? WEEKDAYS[selectedDayIdx].ar
                        : WEEKDAYS[selectedDayIdx].en}
                    </span>
                    <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer px-2.5 py-1 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={activeDay.isRestDay}
                        onChange={(e) =>
                          patchDay(selectedDayIdx, { isRestDay: e.target.checked })
                        }
                        className="accent-emerald-600"
                      />
                      <span>{t.programs.restDay}</span>
                    </label>
                  </div>

                  {!activeDay.isRestDay && (
                    <button
                      type="button"
                      onClick={() => setPickerOpen((o) => !o)}
                      className="min-h-[36px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t.apex.coachAddExerciseToDay}
                    </button>
                  )}
                </div>

                {!activeDay.isRestDay && (
                  <>
                    <input
                      type="text"
                      value={activeDay.workoutName}
                      onChange={(e) =>
                        patchDay(selectedDayIdx, { workoutName: e.target.value })
                      }
                      placeholder={t.apex.coachDayWorkoutPlaceholder}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
                    />

                    {/* Inline Exercise Search Picker */}
                    {pickerOpen && (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#121417] border border-emerald-500/40 space-y-2.5">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute start-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              autoFocus
                              value={exSearch}
                              onChange={(e) => setExSearch(e.target.value)}
                              placeholder={t.common.searchPlaceholder}
                              className="w-full min-h-[36px] ps-8 pe-3 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                            />
                          </div>
                          <select
                            value={exMuscleFilter}
                            onChange={(e) =>
                              setExMuscleFilter(e.target.value as MuscleGroup | 'all')
                            }
                            className="min-h-[36px] px-2.5 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                          >
                            <option value="all">{t.common.all}</option>
                            {(Object.keys(MUSCLE_LABELS) as MuscleGroup[]).map((m) => (
                              <option key={m} value={m}>
                                {tLabel(MUSCLE_LABELS[m], language)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="max-h-48 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/70">
                          {filteredExercises.map((ex) => (
                            <button
                              key={ex.id}
                              type="button"
                              onClick={() => handleAddExerciseToActiveDay(ex.id)}
                              className="w-full py-2 px-2 hover:bg-neutral-50 dark:hover:bg-[#090A0B] flex items-center justify-between gap-2 text-start text-xs cursor-pointer"
                            >
                              <span className="font-medium truncate">
                                {language === 'ar' ? ex.nameAr : ex.nameEn}
                              </span>
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0 inline-flex items-center gap-1">
                                <Plus className="w-3 h-3" />
                                {t.common.add}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ordered Exercise List for Active Day */}
                    {activeDay.exercises.length === 0 ? (
                      <div className="py-6 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
                        <Dumbbell className="w-5 h-5 text-neutral-400 mx-auto" />
                        <p className="text-xs text-neutral-500">
                          {language === 'ar'
                            ? 'لا توجد تمارين في هذا اليوم بعد. اضغط «إضافة تمرين» لبناء الترتيب.'
                            : 'No exercises added to this day yet.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeDay.exercises.map((item, idx) => (
                          <div
                            key={item.itemId}
                            className="p-3 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-lg bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-xs sm:text-sm font-semibold truncate">
                                  {language === 'ar' ? item.exerciseNameAr : item.exerciseNameEn}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveExerciseItem(idx, -1)}
                                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                                  aria-label={t.workouts.moveUp}
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === activeDay.exercises.length - 1}
                                  onClick={() => moveExerciseItem(idx, 1)}
                                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                                  aria-label={t.workouts.moveDown}
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeExerciseItem(item.itemId)}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 cursor-pointer"
                                  aria-label={t.common.delete}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                              <div>
                                <span className="text-neutral-500 block mb-0.5">
                                  {t.workouts.targetSets}
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  max={15}
                                  value={item.sets}
                                  onChange={(e) =>
                                    updateExerciseItem(item.itemId, {
                                      sets: Math.max(1, Number(e.target.value) || 3),
                                    })
                                  }
                                  className="w-full min-h-[34px] px-2 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono tabular-nums"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-500 block mb-0.5">
                                  {language === 'ar' ? 'أقل عدّات' : 'Min Reps'}
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={item.targetRepsMin}
                                  onChange={(e) =>
                                    updateExerciseItem(item.itemId, {
                                      targetRepsMin: Math.max(1, Number(e.target.value) || 8),
                                    })
                                  }
                                  className="w-full min-h-[34px] px-2 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono tabular-nums"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-500 block mb-0.5">
                                  {language === 'ar' ? 'أعلى عدّات' : 'Max Reps'}
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={item.targetRepsMax}
                                  onChange={(e) =>
                                    updateExerciseItem(item.itemId, {
                                      targetRepsMax: Math.max(1, Number(e.target.value) || 12),
                                    })
                                  }
                                  className="w-full min-h-[34px] px-2 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono tabular-nums"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-500 block mb-0.5">
                                  {t.apex.targetWeight} ({unitText})
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  step="0.5"
                                  value={
                                    item.targetWeightKg
                                      ? toDisplayWeight(item.targetWeightKg, unit)
                                      : ''
                                  }
                                  placeholder="—"
                                  onChange={(e) =>
                                    updateExerciseItem(item.itemId, {
                                      targetWeightKg: e.target.value
                                        ? toStorageKg(Number(e.target.value), unit)
                                        : undefined,
                                    })
                                  }
                                  className="w-full min-h-[34px] px-2 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono tabular-nums"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-500 block mb-0.5">
                                  {t.workouts.restSeconds}
                                </span>
                                <input
                                  type="number"
                                  min={30}
                                  max={360}
                                  step={15}
                                  value={item.restSeconds}
                                  onChange={(e) =>
                                    updateExerciseItem(item.itemId, {
                                      restSeconds: Math.max(30, Number(e.target.value) || 90),
                                    })
                                  }
                                  className="w-full min-h-[34px] px-2 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono tabular-nums"
                                />
                              </div>
                            </div>

                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) =>
                                updateExerciseItem(item.itemId, { notes: e.target.value })
                              }
                              placeholder={t.workouts.exerciseNotes}
                              className="w-full min-h-[32px] px-2.5 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-[11px]"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {sourceTab === 'curated' && (
            <div className="space-y-2.5">
              <select
                value={selectedTplId}
                onChange={(e) => setSelectedTplId(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              >
                {CURATED_PROGRAM_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {language === 'ar' ? tpl.nameAr : tpl.nameEn}
                  </option>
                ))}
              </select>
              {(() => {
                const tpl = CURATED_PROGRAM_TEMPLATES.find((c) => c.id === selectedTplId);
                if (!tpl) return null;
                return (
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-1.5 text-xs">
                    <p className="font-semibold">
                      {language === 'ar' ? tpl.nameAr : tpl.nameEn} · {tpl.weeklyFrequency}{' '}
                      {language === 'ar' ? 'أيام/أسبوع' : 'days/wk'} ·{' '}
                      {tLabel(SPLIT_LABELS[tpl.splitType], language)}
                    </p>
                    <p className="text-neutral-500 leading-relaxed">
                      {language === 'ar' ? tpl.summaryAr : tpl.summaryEn}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {sourceTab === 'my' && (
            <select
              value={selectedMyProgId}
              onChange={(e) => setSelectedMyProgId(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
            >
              {programs.length === 0 ? (
                <option value="">{t.programs.noPrograms}</option>
              ) : (
                programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          )}

          {/* Coach Instructions / Notification Message */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {language === 'ar'
                ? 'رسالة وتوجيهات الكابتن للاعب (تظهر مع التنبيه الفوري)'
                : 'Coach Instructions (shown with instant notification)'}
            </label>
            <textarea
              rows={2}
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: ركّز على النزول البطيء في البنش واسترح 3 دقائق بين الجولات الثقيلة.'
                  : 'e.g., Control eccentric tempo and take full rest between heavy sets.'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || (sourceTab === 'my' && programs.length === 0)}
            className="w-full min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? t.common.loading : t.apex.coachSendCourseToAthlete}
          </button>
        </form>
      </div>
    </div>
  );
};
