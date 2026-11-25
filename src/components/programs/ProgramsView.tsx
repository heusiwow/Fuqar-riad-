import React, { useMemo, useState } from 'react';
import {
  Archive,
  BookOpenCheck,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  Layers,
  Pause,
  Play,
  Plus,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  CURATED_PROGRAM_TEMPLATES,
  CuratedProgramTemplate,
  localizeTemplateNote,
} from '../../data/programTemplates';
import {
  DIFFICULTY_LABELS,
  GOAL_LABELS,
  PROGRAM_STATUS_LABELS,
  SPLIT_LABELS,
  tLabel,
  WEEKDAYS,
} from '../../i18n/translations';
import {
  acceptCoachAssignment,
  deleteTrainingProgram,
  dismissCoachAssignment,
  generateSafeId,
  saveTrainingProgram,
  saveWorkoutTemplate,
  setActiveProgramId,
  updateProgramStatus,
} from '../../services/firestoreService';
import {
  DifficultyLevel,
  ProgramDaySchedule,
  SplitType,
  TrainingGoal,
  TrainingPhilosophy,
  TrainingProgram,
} from '../../types/ironlog';

function buildDefaultDays(): ProgramDaySchedule[] {
  return WEEKDAYS.map((wd) => ({
    dayIndex: wd.index,
    label: wd.en,
    isRestDay: true,
    workoutId: '',
    workoutName: '',
  }));
}

export const ProgramsView: React.FC = () => {
  const {
    firebaseUser,
    profile,
    isCoach,
    activeOrg,
    language,
    t,
    programs,
    activeProgram,
    workouts,
    coachAssignments,
    startWorkoutFromTemplate,
    setActiveSection,
    showToast,
  } = useApp();

  const [viewTab, setViewTab] = useState<'my' | 'library'>('my');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingProgram | null>(null);

  const [name, setName] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [goal, setGoal] = useState<TrainingGoal>('hypertrophy');
  const [level, setLevel] = useState<DifficultyLevel>('intermediate');
  const [weeklyFrequency, setWeeklyFrequency] = useState(4);
  const [splitType, setSplitType] = useState<SplitType>('push_pull_legs');
  const [scheduledDays, setScheduledDays] = useState<ProgramDaySchedule[]>(buildDefaultDays());
  const [saving, setSaving] = useState(false);

  // Program Library filters & preview modal
  const [libLevel, setLibLevel] = useState<DifficultyLevel | 'all'>('all');
  const [libGoal, setLibGoal] = useState<TrainingGoal | 'all'>('all');
  const [libEquip, setLibEquip] = useState<'all' | 'full_gym' | 'limited_equipment'>('all');
  const [libPhilosophy, setLibPhilosophy] = useState<TrainingPhilosophy | 'all'>('all');
  const [previewTpl, setPreviewTpl] = useState<CuratedProgramTemplate | null>(null);
  const [customTplName, setCustomTplName] = useState('');
  const [customTplWeeks, setCustomTplWeeks] = useState(8);
  const [importingTpl, setImportingTpl] = useState(false);
  const [acceptingAssignmentId, setAcceptingAssignmentId] = useState<string | null>(null);

  const pendingAssignments = useMemo(
    () => coachAssignments.filter((a) => a.status === 'assigned'),
    [coachAssignments]
  );

  const filteredTemplates = useMemo(() => {
    return CURATED_PROGRAM_TEMPLATES.filter((tpl) => {
      if (libLevel !== 'all' && tpl.level !== libLevel) return false;
      if (libGoal !== 'all' && tpl.goal !== libGoal) return false;
      if (libEquip !== 'all' && tpl.equipmentProfile !== libEquip) return false;
      if (libPhilosophy !== 'all' && tpl.philosophy !== libPhilosophy) return false;
      return true;
    });
  }, [libLevel, libGoal, libEquip, libPhilosophy]);

  const openBuilder = (p?: TrainingProgram) => {
    if (p) {
      setEditing(p);
      setName(p.name);
      setDurationWeeks(p.durationWeeks);
      setGoal(p.goal);
      setLevel(p.level);
      setWeeklyFrequency(p.weeklyFrequency);
      setSplitType(p.splitType);
      setScheduledDays(
        p.scheduledDays.length === 7 ? p.scheduledDays.map((d) => ({ ...d })) : buildDefaultDays()
      );
    } else {
      setEditing(null);
      setName('');
      setDurationWeeks(8);
      setGoal('hypertrophy');
      setLevel('intermediate');
      setWeeklyFrequency(4);
      setSplitType('push_pull_legs');
      setScheduledDays(buildDefaultDays());
    }
    setBuilderOpen(true);
  };

  const openTemplatePreview = (tpl: CuratedProgramTemplate) => {
    setPreviewTpl(tpl);
    setCustomTplName(language === 'ar' ? tpl.nameAr : tpl.nameEn);
    setCustomTplWeeks(tpl.durationWeeks);
  };

  const handleUseTemplate = async () => {
    if (!firebaseUser || !previewTpl) return;
    setImportingTpl(true);
    try {
      const days = buildDefaultDays();
      for (const w of previewTpl.workouts) {
        const wId = generateSafeId('wrk');
        const wName = language === 'ar' ? w.workoutNameAr : w.workoutNameEn;
        await saveWorkoutTemplate(
          firebaseUser.uid,
          {
            id: wId,
            name: wName,
            description: language === 'ar' ? w.descriptionAr : w.descriptionEn,
            exercises: w.exercises.map((ex) => ({
              ...ex,
              itemId: generateSafeId('wex'),
              notes: localizeTemplateNote(ex.notes, language),
            })),
          },
          false,
          profile?.coachId
        );
        if (days[w.dayIndex]) {
          days[w.dayIndex] = {
            dayIndex: w.dayIndex,
            label: WEEKDAYS[w.dayIndex].en,
            isRestDay: false,
            workoutId: wId,
            workoutName: wName,
          };
        }
      }

      const progId = generateSafeId('prg');
      await saveTrainingProgram(
        firebaseUser.uid,
        {
          id: progId,
          name: customTplName.trim() || (language === 'ar' ? previewTpl.nameAr : previewTpl.nameEn),
          durationWeeks: Math.max(1, customTplWeeks || previewTpl.durationWeeks),
          goal: previewTpl.goal,
          level: previewTpl.level,
          weeklyFrequency: previewTpl.weeklyFrequency,
          splitType: previewTpl.splitType,
          status: 'active',
          philosophy: previewTpl.philosophy,
          sourceTemplateId: previewTpl.id,
          originNote:
            language === 'ar'
              ? `${previewTpl.originCreatorAr} — ${previewTpl.apexAdaptationAr}`
              : `${previewTpl.originCreatorEn} — ${previewTpl.apexAdaptationEn}`,
          scheduledDays: days,
          completedSessions: 0,
          startDate: new Date().toISOString().slice(0, 10),
          progressionApproach:
            language === 'ar' ? previewTpl.progressionApproachAr : previewTpl.progressionApproachEn,
          deloadGuidance: language === 'ar' ? previewTpl.deloadGuidanceAr : previewTpl.deloadGuidanceEn,
          intensityGuidance:
            language === 'ar' ? previewTpl.intensityGuidanceAr : previewTpl.intensityGuidanceEn,
        },
        false,
        profile?.coachId
      );

      await setActiveProgramId(firebaseUser.uid, progId);
      setPreviewTpl(null);
      setViewTab('my');
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setImportingTpl(false);
    }
  };

  const handleAcceptAssignment = async (assignmentId: string) => {
    if (!firebaseUser) return;
    const item = coachAssignments.find((a) => a.id === assignmentId);
    if (!item) return;
    setAcceptingAssignmentId(assignmentId);
    try {
      await acceptCoachAssignment(firebaseUser.uid, item);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setAcceptingAssignmentId(null);
    }
  };

  const handleDismissAssignment = async (assignmentId: string) => {
    try {
      await dismissCoachAssignment(assignmentId);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const updateDay = (idx: number, patch: Partial<ProgramDaySchedule>) => {
    setScheduledDays((prev) =>
      prev.map((d, i) => {
        if (i !== idx) return d;
        const merged = { ...d, ...patch };
        if (merged.isRestDay) {
          merged.workoutId = '';
          merged.workoutName = '';
        }
        return merged;
      })
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !name.trim()) return;
    setSaving(true);
    try {
      const id = editing ? editing.id : generateSafeId('prg');
      const trainedDaysCount = scheduledDays.filter((d) => !d.isRestDay && d.workoutId).length;
      const freq = Math.max(1, trainedDaysCount || weeklyFrequency);

      await saveTrainingProgram(
        firebaseUser.uid,
        {
          id,
          name: name.trim(),
          durationWeeks,
          goal,
          level,
          weeklyFrequency: freq,
          splitType,
          status: editing ? editing.status : 'active',
          scheduledDays,
          completedSessions: editing ? editing.completedSessions : 0,
          startDate: editing?.startDate || new Date().toISOString().slice(0, 10),
        },
        Boolean(editing),
        profile?.coachId
      );

      if (!editing && !activeProgram) {
        await setActiveProgramId(firebaseUser.uid, id);
      }

      showToast(t.common.savedSuccess);
      setBuilderOpen(false);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (p: TrainingProgram) => {
    if (!firebaseUser) return;
    try {
      const id = generateSafeId('prg');
      await saveTrainingProgram(
        firebaseUser.uid,
        {
          id,
          name: `${p.name} (${language === 'ar' ? 'نسخة' : 'Copy'})`.slice(0, 120),
          durationWeeks: p.durationWeeks,
          goal: p.goal,
          level: p.level,
          weeklyFrequency: p.weeklyFrequency,
          splitType: p.splitType,
          status: 'paused',
          scheduledDays: p.scheduledDays.map((d) => ({ ...d })),
          completedSessions: 0,
          startDate: new Date().toISOString().slice(0, 10),
        },
        false,
        profile?.coachId
      );
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleActivate = async (p: TrainingProgram) => {
    if (!firebaseUser) return;
    try {
      if (p.status !== 'active') {
        await updateProgramStatus(firebaseUser.uid, p.id, 'active');
      }
      await setActiveProgramId(firebaseUser.uid, p.id);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleStatusChange = async (p: TrainingProgram, nextStatus: 'active' | 'paused' | 'archived') => {
    if (!firebaseUser) return;
    try {
      await updateProgramStatus(firebaseUser.uid, p.id, nextStatus);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleDelete = async (programId: string) => {
    if (!firebaseUser) return;
    try {
      await deleteTrainingProgram(firebaseUser.uid, programId);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  if (builderOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {editing ? t.programs.editProgram : t.programs.newProgram}
          </h1>
          <button
            onClick={() => setBuilderOpen(false)}
            className="min-h-[40px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium cursor-pointer"
          >
            {t.common.cancel}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.programs.programName}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: برنامج التضخيم 8 أسابيع' : 'e.g., 8-Week Hypertrophy PPL'}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.programs.splitType}
                </label>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value as SplitType)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                >
                  {(Object.keys(SPLIT_LABELS) as SplitType[]).map((s) => (
                    <option key={s} value={s}>
                      {tLabel(SPLIT_LABELS[s], language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.programs.durationWeeks}
                </label>
                <input
                  type="number"
                  min={1}
                  max={104}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value) || 4)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.programs.weeklyFreq}
                </label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={weeklyFrequency}
                  onChange={(e) => setWeeklyFrequency(Number(e.target.value) || 4)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.programs.goal}
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as TrainingGoal)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                >
                  {(Object.keys(GOAL_LABELS) as TrainingGoal[]).map((g) => (
                    <option key={g} value={g}>
                      {tLabel(GOAL_LABELS[g], language)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.programs.level}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                >
                  {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((l) => (
                    <option key={l} value={l}>
                      {tLabel(DIFFICULTY_LABELS[l], language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold">{t.programs.scheduleTitle}</h2>
            <div className="space-y-2.5">
              {scheduledDays.map((day, idx) => {
                const wd = WEEKDAYS[idx];
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center justify-between sm:w-44">
                      <span className="text-sm font-medium">{language === 'ar' ? wd.ar : wd.en}</span>
                      <label className="inline-flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.isRestDay}
                          onChange={(e) => updateDay(idx, { isRestDay: e.target.checked })}
                          className="accent-emerald-500"
                        />
                        {t.programs.restDay}
                      </label>
                    </div>

                    {!day.isRestDay && (
                      workouts.length === 0 ? (
                        <div className="flex-1 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-700 text-xs">
                          <span className="text-neutral-500">
                            {language === 'ar' ? 'لا توجد قوالب تمارين بعد' : 'No workout templates yet'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveSection('workouts')}
                            className="min-h-[34px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {t.workouts.newWorkout}
                          </button>
                        </div>
                      ) : (
                        <select
                          value={day.workoutId || ''}
                          onChange={(e) => {
                            const wId = e.target.value;
                            const matched = workouts.find((w) => w.id === wId);
                            updateDay(idx, {
                              workoutId: wId,
                              workoutName: matched ? matched.name : '',
                            });
                          }}
                          className="flex-1 min-h-[40px] px-3 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-sm"
                        >
                          <option value="">{t.programs.assignWorkout}...</option>
                          {workouts.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setBuilderOpen(false)}
              className="min-h-[44px] px-5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.programs.title}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{t.programs.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex rounded-xl p-1 bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setViewTab('my')}
              className={`min-h-[36px] px-3.5 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 ${
                viewTab === 'my'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {t.apex.myProgramsTab}
            </button>
            <button
              type="button"
              onClick={() => setViewTab('library')}
              className={`min-h-[36px] px-3.5 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 ${
                viewTab === 'library'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              {t.apex.programLibraryTab}
            </button>
          </div>
          <button
            onClick={() => openBuilder()}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.programs.newProgram}
          </button>
        </div>
      </div>

      {/* Gym Policy Advisory Banner */}
      {activeOrg && !activeOrg.allowAthleteSelfProgram && !isCoach && (
        <section className="bg-amber-500/8 border border-amber-500/35 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300">
          {language === 'ar'
            ? `سياسة ${activeOrg.name}: يُفضّل اعتماد البرامج المرسلة من مدربك قبل التعديل الذاتي.`
            : `${activeOrg.name} policy: coach-assigned programs are recommended over self-built routines.`}
        </section>
      )}

      {/* Coach Assigned Programs Banner */}
      {pendingAssignments.length > 0 && (
        <section className="bg-emerald-500/8 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <UserCheck className="w-4 h-4 shrink-0" />
            <h2 className="text-sm font-bold">{t.apex.pendingAssignments}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingAssignments.map((a) => (
              <div
                key={a.id}
                className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{a.programName}</p>
                  <p className="text-xs text-neutral-500">
                    {t.apex.linkedCoachLabel}: {a.coachName} · {a.workoutsData.length}{' '}
                    {t.workouts.exercisesInWorkout}
                  </p>
                  {a.notes && <p className="text-xs text-neutral-600 dark:text-neutral-300">{a.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={acceptingAssignmentId === a.id}
                    onClick={() => handleAcceptAssignment(a.id)}
                    className="flex-1 min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {acceptingAssignmentId === a.id ? t.common.loading : t.apex.acceptAssignment}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismissAssignment(a.id)}
                    className="min-h-[40px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t.apex.dismissAssignment}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {viewTab === 'library' ? (
        <div className="space-y-4">
          {/* Library Filters */}
          <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={libPhilosophy}
              onChange={(e) => setLibPhilosophy(e.target.value as TrainingPhilosophy | 'all')}
              className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
            >
              <option value="all">{t.apex.allPhilosophies}</option>
              <option value="modern">{t.apex.philModern}</option>
              <option value="old_school">{t.apex.philOldSchool}</option>
              <option value="hybrid">{t.apex.philHybrid}</option>
            </select>
            <select
              value={libLevel}
              onChange={(e) => setLibLevel(e.target.value as DifficultyLevel | 'all')}
              className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
            >
              <option value="all">{t.apex.allLevels}</option>
              {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((l) => (
                <option key={l} value={l}>
                  {tLabel(DIFFICULTY_LABELS[l], language)}
                </option>
              ))}
            </select>
            <select
              value={libGoal}
              onChange={(e) => setLibGoal(e.target.value as TrainingGoal | 'all')}
              className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
            >
              <option value="all">{t.programs.goal}: {t.common.all}</option>
              {(Object.keys(GOAL_LABELS) as TrainingGoal[]).map((g) => (
                <option key={g} value={g}>
                  {tLabel(GOAL_LABELS[g], language)}
                </option>
              ))}
            </select>
            <select
              value={libEquip}
              onChange={(e) => setLibEquip(e.target.value as 'all' | 'full_gym' | 'limited_equipment')}
              className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
            >
              <option value="all">{t.apex.allEquipment}</option>
              <option value="full_gym">{t.apex.fullGym}</option>
              <option value="limited_equipment">{t.apex.limitedEquipment}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => {
              const philLabel =
                tpl.philosophy === 'modern'
                  ? t.apex.philModern
                  : tpl.philosophy === 'old_school'
                    ? t.apex.philOldSchool
                    : t.apex.philHybrid;
              return (
              <div
                key={tpl.id}
                className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        {philLabel} · {language === 'ar' ? tpl.categoryTagAr : tpl.categoryTagEn}
                      </span>
                      <h3 className="text-base font-bold">
                        {language === 'ar' ? tpl.nameAr : tpl.nameEn}
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        {language === 'ar' ? tpl.originCreatorAr : tpl.originCreatorEn}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-neutral-500 shrink-0 tabular-nums">
                      {tpl.weeklyFrequency} {language === 'ar' ? 'أيام/أسبوع' : 'd/wk'} · {tpl.durationWeeks}{' '}
                      {language === 'ar' ? 'أسبوع' : 'w'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {language === 'ar' ? tpl.summaryAr : tpl.summaryEn}
                  </p>
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-500 space-y-1">
                    <p>
                      <strong className="text-neutral-700 dark:text-neutral-300">
                        {t.apex.intensityGuidance}:{' '}
                      </strong>
                      {language === 'ar' ? tpl.intensityGuidanceAr : tpl.intensityGuidanceEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => openTemplatePreview(tpl)}
                    className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t.apex.useTemplate}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      ) : programs.length === 0 ? (
        <div className="py-14 text-center bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl px-4 space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            {t.programs.noPrograms}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => openBuilder()}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.programs.newProgram}
            </button>
            <button
              onClick={() => setViewTab('library')}
              className="min-h-[42px] px-5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
            >
              <BookOpenCheck className="w-4 h-4 text-emerald-500" />
              {t.apex.programLibraryTab}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {programs.map((p) => {
            const isActive = activeProgram?.id === p.id;
            const totalExpected = Math.max(1, p.durationWeeks * p.weeklyFrequency);
            const pct = Math.min(100, Math.round((p.completedSessions / totalExpected) * 100));

            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-[#121417] border rounded-2xl p-5 space-y-4 ${
                  isActive ? 'border-emerald-500/60' : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{p.name}</h3>
                      {isActive && (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          · {t.programs.activeBadge}
                        </span>
                      )}
                      {p.philosophy && (
                        <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
                          ·{' '}
                          {p.philosophy === 'modern'
                            ? t.apex.philModern
                            : p.philosophy === 'old_school'
                              ? t.apex.philOldSchool
                              : t.apex.philHybrid}
                        </span>
                      )}
                      {p.assignedByCoachName && (
                        <span className="text-xs text-sky-500 font-medium">
                          · {p.assignedByCoachName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {tLabel(SPLIT_LABELS[p.splitType], language)} · {tLabel(GOAL_LABELS[p.goal], language)} ·{' '}
                      {tLabel(DIFFICULTY_LABELS[p.level], language)} · {p.durationWeeks}{' '}
                      {language === 'ar' ? 'أسبوع' : 'w'} · {tLabel(PROGRAM_STATUS_LABELS[p.status], language)}
                    </p>
                    {p.originNote && (
                      <p className="text-[11px] text-neutral-500 leading-relaxed">{p.originNote}</p>
                    )}
                  </div>

                  <div className="text-end font-mono tabular-nums text-xs shrink-0">
                    <span className="text-neutral-500">{t.programs.programProgress}: </span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {p.completedSessions} / {totalExpected} ({pct}%)
                    </strong>
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>

                {(p.progressionApproach || p.deloadGuidance) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-neutral-50 dark:bg-[#090A0B] p-3 rounded-xl border border-neutral-200 dark:border-neutral-800/70">
                    {p.progressionApproach && (
                      <p className="text-neutral-600 dark:text-neutral-400">
                        <strong className="text-neutral-800 dark:text-neutral-200">
                          {t.apex.progressionMethod}:{' '}
                        </strong>
                        {p.progressionApproach}
                      </p>
                    )}
                    {p.deloadGuidance && (
                      <p className="text-neutral-600 dark:text-neutral-400">
                        <strong className="text-neutral-800 dark:text-neutral-200">
                          {t.apex.deloadGuidance}:{' '}
                        </strong>
                        {p.deloadGuidance}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {p.scheduledDays.map((day, idx) => {
                    const wd = WEEKDAYS[idx];
                    const linkedWorkout = day.workoutId
                      ? workouts.find((w) => w.id === day.workoutId)
                      : undefined;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80 text-xs flex flex-col justify-between gap-1.5"
                      >
                        <span className="text-[11px] font-medium text-neutral-500">
                          {language === 'ar' ? wd.shortAr : wd.shortEn}
                        </span>
                        <span className="font-medium truncate">
                          {day.isRestDay ? t.programs.restDay : day.workoutName || t.programs.restDay}
                        </span>
                        {linkedWorkout && !day.isRestDay && (
                          <button
                            onClick={() => startWorkoutFromTemplate(linkedWorkout, p)}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline text-start inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3" />
                            {t.common.start}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center gap-2">
                    {!isActive && p.status !== 'archived' && (
                      <button
                        onClick={() => handleActivate(p)}
                        className="min-h-[36px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.programs.setActive}
                      </button>
                    )}
                    {p.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(p, 'paused')}
                        className="min-h-[36px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        {t.programs.pauseProgram}
                      </button>
                    )}
                    {p.status === 'paused' && (
                      <button
                        onClick={() => handleStatusChange(p, 'active')}
                        className="min-h-[36px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {t.programs.resumeProgram}
                      </button>
                    )}
                    {p.status !== 'archived' && (
                      <button
                        onClick={() => handleStatusChange(p, 'archived')}
                        className="min-h-[36px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        {t.programs.archiveProgram}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openBuilder(p)}
                      className="min-h-[36px] px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {t.common.edit}
                    </button>
                    <button
                      onClick={() => handleDuplicate(p)}
                      className="min-h-[36px] px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {t.common.duplicate}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="min-h-[36px] px-2.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 text-xs inline-flex items-center cursor-pointer"
                      aria-label={t.common.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Template Preview & Customize Modal */}
      {previewTpl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-emerald-500">
                  {language === 'ar' ? previewTpl.categoryTagAr : previewTpl.categoryTagEn}
                </span>
                <h3 className="text-lg font-bold truncate">
                  {language === 'ar' ? previewTpl.nameAr : previewTpl.nameEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTpl(null)}
                className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-neutral-500 mb-1">
                    {t.programs.programName}
                  </label>
                  <input
                    type="text"
                    value={customTplName}
                    onChange={(e) => setCustomTplName(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">
                    {t.programs.durationWeeks}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={customTplWeeks}
                    onChange={(e) => setCustomTplWeeks(Number(e.target.value) || 8)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-neutral-50 dark:bg-[#090A0B] p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div>
                  <strong className="block text-emerald-500 mb-0.5">{t.apex.progressionMethod}</strong>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {language === 'ar'
                      ? previewTpl.progressionApproachAr
                      : previewTpl.progressionApproachEn}
                  </p>
                </div>
                <div>
                  <strong className="block text-amber-500 mb-0.5">{t.apex.intensityGuidance}</strong>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {language === 'ar'
                      ? previewTpl.intensityGuidanceAr
                      : previewTpl.intensityGuidanceEn}
                  </p>
                </div>
                <div>
                  <strong className="block text-sky-500 mb-0.5">{t.apex.deloadGuidance}</strong>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {language === 'ar' ? previewTpl.deloadGuidanceAr : previewTpl.deloadGuidanceEn}
                  </p>
                </div>
              </div>

              {/* Attribution, Original vs APEX Structure, Recovery, Modifications, Age Safety & Pros/Limitations */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
                <div>
                  <strong className="text-neutral-800 dark:text-neutral-200">{t.apex.originLabel}: </strong>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {language === 'ar' ? previewTpl.originCreatorAr : previewTpl.originCreatorEn}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800/70">
                  <div>
                    <strong className="block text-neutral-800 dark:text-neutral-200 mb-0.5">
                      {t.apex.originalStructureLabel}
                    </strong>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {language === 'ar' ? previewTpl.originalStructureAr : previewTpl.originalStructureEn}
                    </p>
                  </div>
                  <div>
                    <strong className="block text-emerald-600 dark:text-emerald-400 mb-0.5">
                      {t.apex.apexAdaptationLabel}
                    </strong>
                    <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {language === 'ar' ? previewTpl.apexAdaptationAr : previewTpl.apexAdaptationEn}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800/70">
                  <div>
                    <strong className="block text-neutral-800 dark:text-neutral-200 mb-0.5">
                      {t.apex.recoveryLabel}
                    </strong>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {language === 'ar'
                        ? previewTpl.recoveryRequirementsAr
                        : previewTpl.recoveryRequirementsEn}
                    </p>
                  </div>
                  <div>
                    <strong className="block text-neutral-800 dark:text-neutral-200 mb-0.5">
                      {t.apex.modificationsLabel}
                    </strong>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {language === 'ar' ? previewTpl.modificationsAr : previewTpl.modificationsEn}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/70">
                  <strong className="block text-amber-600 dark:text-amber-400 mb-0.5">
                    {t.apex.ageSafetyLabel}
                  </strong>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {language === 'ar' ? previewTpl.ageSafetyAr : previewTpl.ageSafetyEn}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800/70">
                  <div>
                    <strong className="block text-emerald-600 dark:text-emerald-400 mb-1">
                      {t.apex.prosLabel}
                    </strong>
                    <ul className="list-disc list-inside space-y-0.5 text-neutral-600 dark:text-neutral-400">
                      {(language === 'ar' ? previewTpl.prosAr : previewTpl.prosEn).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="block text-amber-600 dark:text-amber-400 mb-1">
                      {t.apex.limitationsLabel}
                    </strong>
                    <ul className="list-disc list-inside space-y-0.5 text-neutral-600 dark:text-neutral-400">
                      {(language === 'ar' ? previewTpl.limitationsAr : previewTpl.limitationsEn).map(
                        (item, idx) => (
                          <li key={idx}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {previewTpl.workouts.map((w, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-500">
                        {language === 'ar'
                          ? WEEKDAYS[w.dayIndex]?.ar
                          : WEEKDAYS[w.dayIndex]?.en}{' '}
                        — {language === 'ar' ? w.workoutNameAr : w.workoutNameEn}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {w.exercises.length} {t.workouts.exercisesInWorkout}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                      {w.exercises.map((ex, eIdx) => (
                        <div key={eIdx} className="flex items-center justify-between gap-2">
                          <span className="truncate">
                            {language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn}
                          </span>
                          <span className="font-mono tabular-nums shrink-0">
                            {ex.sets}×{ex.targetRepsMin}-{ex.targetRepsMax}
                            {ex.targetRpe ? ` @RPE ${ex.targetRpe}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPreviewTpl(null)}
                className="min-h-[42px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={importingTpl}
                onClick={handleUseTemplate}
                className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                {importingTpl ? t.common.loading : t.apex.useTemplate}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
