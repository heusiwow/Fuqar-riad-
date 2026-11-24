import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  FlaskConical,
  History,
  Layers,
  Scale,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  HISTORICAL_APPROACHES,
  MODERN_SCIENCE_PRINCIPLES,
  OLD_SCHOOL_PRINCIPLES,
  PHILOSOPHY_COMPARISON_MATRIX,
  buildSystemProgram,
} from '../../data/trainingPhilosophies';
import { EQUIPMENT_LABELS, GOAL_LABELS, SPLIT_LABELS, WEEKDAYS, tLabel } from '../../i18n/translations';
import {
  generateSafeId,
  saveTrainingProgram,
  saveWorkoutTemplate,
  setActiveProgramId,
} from '../../services/firestoreService';
import {
  DifficultyLevel,
  EquipmentType,
  TrainingGoal,
  TrainingPhilosophy,
} from '../../types/ironlog';

type PhilTab = 'modern' | 'old_school' | 'compare' | 'hybrid';

export const PhilosophiesView: React.FC = () => {
  const { firebaseUser, profile, language, t, showToast, setActiveSection } = useApp();
  const isAr = language === 'ar';

  const [tab, setTab] = useState<PhilTab>('modern');

  // Hybrid Builder state
  const [philosophy, setPhilosophy] = useState<TrainingPhilosophy>('hybrid');
  const [goal, setGoal] = useState<TrainingGoal>(profile?.trainingGoal || 'hypertrophy');
  const [level, setLevel] = useState<DifficultyLevel>(profile?.experienceLevel || 'intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(Math.min(6, Math.max(2, profile?.weeklyFrequency || 4)));
  const [equipMode, setEquipMode] = useState<'full_gym' | 'limited'>('full_gym');
  const [saving, setSaving] = useState(false);

  const equipmentList: EquipmentType[] = useMemo(
    () =>
      equipMode === 'full_gym'
        ? ['barbell', 'dumbbell', 'cable', 'machine', 'smith_machine', 'bodyweight']
        : ['dumbbell', 'bodyweight', 'resistance_bands'],
    [equipMode]
  );

  const generated = useMemo(
    () =>
      buildSystemProgram({
        philosophy,
        goal,
        level,
        daysPerWeek,
        equipment: equipmentList,
        ageGroup: profile?.ageGroup === 'youth' ? 'youth' : 'adult',
        language,
      }),
    [philosophy, goal, level, daysPerWeek, equipmentList, profile?.ageGroup, language]
  );

  const handleSaveAndActivate = async () => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      const createdWorkouts = await Promise.all(
        generated.workouts.map(async (w) => {
          const wId = generateSafeId('wrk');
          await saveWorkoutTemplate(
            firebaseUser.uid,
            {
              id: wId,
              name: w.name,
              description: w.description,
              exercises: w.exercises.map((ex, i) => ({
                ...ex,
                itemId: generateSafeId(`item${i}`),
              })),
            },
            false
          );
          return { dayIndex: w.dayIndex, workoutId: wId, workoutName: w.name };
        })
      );

      const pId = generateSafeId('prg');
      const scheduledDays = generated.scheduledDays.map((day) => {
        const match = createdWorkouts.find((cw) => cw.dayIndex === day.dayIndex);
        if (!match) return day;
        return {
          ...day,
          isRestDay: false,
          workoutId: match.workoutId,
          workoutName: match.workoutName,
        };
      });

      const originNote = isAr
        ? `مبني بواسطة منشئ الأنظمة (${philosophy === 'hybrid' ? 'هجين' : philosophy === 'old_school' ? 'المدرسة القديمة' : 'علمي حديث'}) — ${daysPerWeek} أيام أسبوعياً`
        : `Generated via APEX ${philosophy.replace('_', ' ')} system builder (${daysPerWeek} days/wk)`;

      await saveTrainingProgram(
        firebaseUser.uid,
        {
          id: pId,
          name: generated.programName,
          durationWeeks: generated.durationWeeks,
          goal,
          level,
          weeklyFrequency: generated.weeklyFrequency,
          splitType: generated.splitType,
          status: 'active',
          philosophy,
          sourceTemplateId: `builder-${philosophy}`,
          originNote,
          scheduledDays,
          intensityGuidance: generated.intensityGuidance,
          progressionApproach: generated.progressionApproach,
          deloadGuidance: generated.deloadGuidance,
          completedSessions: 0,
          startDate: new Date().toISOString().slice(0, 10),
        },
        false
      );

      await setActiveProgramId(firebaseUser.uid, pId);
      showToast(t.common.savedSuccess);
      setActiveSection('programs');
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSaving(false);
    }
  };

  const evidenceLabel = (tier: 'supported' | 'nuanced' | 'individual') => {
    if (tier === 'supported') return t.apex.evidenceSupported;
    if (tier === 'nuanced') return t.apex.evidenceNuanced;
    return t.apex.evidenceIndividual;
  };

  const evidenceStyle = (tier: 'supported' | 'nuanced' | 'individual') => {
    if (tier === 'supported') return 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5';
    if (tier === 'nuanced') return 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/5';
    return 'border-sky-500/30 text-sky-700 dark:text-sky-400 bg-sky-500/5';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>{t.nav.philosophies}</span>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight">{t.apex.philTitle}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            {t.apex.philSubtitle}
          </p>
        </div>
      </div>

      {/* 4-Section Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-neutral-100 dark:bg-[#121417] p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
        {(
          [
            { id: 'modern', label: t.apex.philModernTab, icon: FlaskConical },
            { id: 'old_school', label: t.apex.philOldSchoolTab, icon: History },
            { id: 'compare', label: t.apex.philCompareTab, icon: Scale },
            { id: 'hybrid', label: t.apex.philHybridTab, icon: Layers },
          ] as { id: PhilTab; label: string; icon: React.ComponentType<{ className?: string }> }[]
        ).map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                active
                  ? 'bg-white dark:bg-[#1A1D22] text-emerald-600 dark:text-emerald-400 border border-neutral-200 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MODERN SCIENTIFIC TRAINING */}
      {tab === 'modern' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <FlaskConical className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {isAr
                ? 'يميز هذا القسم بوضوح بين ما تدعمه التجارب العلمية المحكمة، وما يزال يعتمد على السياق العملي، وما يختلف بين الأفراد بناءً على الوراثة والنوم والخبرة.'
                : 'This module distinguishes between principles backed by replicated resistance-training research, areas where evidence remains nuanced, and variables that differ meaningfully across individuals.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MODERN_SCIENCE_PRINCIPLES.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold">
                    {isAr ? p.titleAr : p.titleEn}
                  </h2>
                  <span className={`px-2 py-1 rounded-md border text-[11px] font-medium shrink-0 ${evidenceStyle(p.evidenceTier)}`}>
                    {evidenceLabel(p.evidenceTier)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {isAr ? p.summaryAr : p.summaryEn}
                </p>
                <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                  <div>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                      {t.apex.whatResearchSupports}
                    </p>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {isAr ? p.researchSupportsAr : p.researchSupportsEn}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-600 dark:text-amber-400 mb-0.5">
                      {t.apex.uncertaintyAndLimits}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {isAr ? p.uncertaintyOrLimitsAr : p.uncertaintyOrLimitsEn}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-0.5">
                      {t.apex.practicalApp}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {isAr ? p.practicalApplicationAr : p.practicalApplicationEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: OLD SCHOOL BODYBUILDING & STRENGTH PHILOSOPHY */}
      {tab === 'old_school' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {isAr
                ? 'تحترم المدرسة القديمة التمارين الحرة الأساسية، الانضباط وتدوين السجلات عبر السنوات، والاتصال الذهني العضلي. لا تروّج APEX لرفع الأوزان بأداء عشوائي أو التمرين مع الألم الحاد.'
                : 'Classic bodybuilding and strength culture prized foundational compound lifts, relentless logbook tracking, controlled reps, and balanced physiques—presented here with safety boundaries and modern evidence context.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {OLD_SCHOOL_PRINCIPLES.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3"
              >
                <h2 className="text-base font-semibold">{isAr ? item.titleAr : item.titleEn}</h2>
                <div className="space-y-2.5 text-xs leading-relaxed">
                  <div>
                    <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[11px] mb-0.5">
                      {t.apex.historicalContext}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {isAr ? item.historicalContextAr : item.historicalContextEn}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px] uppercase tracking-wider mb-0.5">
                      {t.apex.corePractice}
                    </p>
                    <p className="text-neutral-800 dark:text-neutral-200">
                      {isAr ? item.corePracticeAr : item.corePracticeEn}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-sky-600 dark:text-sky-400 text-[11px] uppercase tracking-wider mb-0.5">
                      {t.apex.modernPerspective}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {isAr ? item.modernPerspectiveAr : item.modernPerspectiveEn}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <p className="font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                      {t.apex.safeExecution}
                    </p>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      {isAr ? item.safeExecutionAr : item.safeExecutionEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Historical Approaches */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>{t.apex.historicalApproachesTitle}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {HISTORICAL_APPROACHES.map((era) => (
                <div
                  key={era.id}
                  className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-2.5"
                >
                  <h3 className="text-sm font-bold">{isAr ? era.eraOrApproachAr : era.eraOrApproachEn}</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {t.apex.notableFigures}: {isAr ? era.notableFiguresAr : era.notableFiguresEn}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {isAr ? era.characteristicsAr : era.characteristicsEn}
                  </p>
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                    <p className="font-semibold text-neutral-700 dark:text-neutral-200 mb-0.5">{t.apex.evidenceNote}</p>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {isAr ? era.evidenceNoteAr : era.evidenceNoteEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPARE BOTH SCHOOLS */}
      {tab === 'compare' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {isAr
                ? 'المدرستان ليستا عدوتين؛ البرنامج الذكي يجمع بين بساطة وانضباط المدرسة القديمة في التمارين المركبة والالتزام، مع الضبط العلمي الحديث للحجم التدريبي والاستشفاء ومؤشرات RIR.'
                : 'Evidence-based training and Old School culture are not enemies. The strongest long-term programs combine Old School compound discipline and consistency with Modern Science volume, recovery, and autoregulation limits.'}
            </p>
          </div>

          <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-[#090A0B] border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                    <th className="p-3.5 font-semibold min-w-[140px]">{isAr ? 'المحور' : 'Dimension'}</th>
                    <th className="p-3.5 font-semibold min-w-[210px] text-emerald-600 dark:text-emerald-400">
                      {t.apex.philModern}
                    </th>
                    <th className="p-3.5 font-semibold min-w-[210px] text-amber-600 dark:text-amber-400">
                      {t.apex.philOldSchool}
                    </th>
                    <th className="p-3.5 font-semibold min-w-[220px] text-sky-600 dark:text-sky-400">
                      {t.apex.bridgePrinciple}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {PHILOSOPHY_COMPARISON_MATRIX.map((row) => (
                    <tr key={row.dimensionEn} className="align-top">
                      <td className="p-3.5 font-semibold text-neutral-900 dark:text-neutral-100">
                        {isAr ? row.dimensionAr : row.dimensionEn}
                      </td>
                      <td className="p-3.5 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {isAr ? row.modernAr : row.modernEn}
                      </td>
                      <td className="p-3.5 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {isAr ? row.oldSchoolAr : row.oldSchoolEn}
                      </td>
                      <td className="p-3.5 text-neutral-700 dark:text-neutral-300 leading-relaxed bg-sky-500/5">
                        {isAr ? row.bridgeAr : row.bridgeEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HYBRID TRAINING SYSTEM BUILDER */}
      {tab === 'hybrid' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Configuration Form */}
          <div className="lg:col-span-5 bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>{t.apex.hybridTitle}</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t.apex.hybridDesc}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">{t.apex.selectPhilosophy}</label>
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
                    onClick={() => setPhilosophy(item.id)}
                    className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      philosophy === item.id
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">{t.programs.goal}</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as TrainingGoal)}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  {Object.entries(GOAL_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {tLabel(v, language)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">{t.programs.level}</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  <option value="beginner">{isAr ? 'مبتدئ' : 'Beginner'}</option>
                  <option value="intermediate">{isAr ? 'متوسط' : 'Intermediate'}</option>
                  <option value="advanced">{isAr ? 'متقدم' : 'Advanced'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">{t.programs.weeklyFreq}</label>
                <select
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs tabular-nums"
                >
                  {[2, 3, 4, 5, 6].map((d) => (
                    <option key={d} value={d}>
                      {d} {isAr ? 'أيام / أسبوع' : 'days / week'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">{t.apex.allEquipment}</label>
                <select
                  value={equipMode}
                  onChange={(e) => setEquipMode(e.target.value as 'full_gym' | 'limited')}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  <option value="full_gym">{t.apex.fullGym}</option>
                  <option value="limited">{t.apex.limitedEquipment}</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80 space-y-2">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t.apex.whyThisSystem}</p>
              <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {generated.rationalePoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleSaveAndActivate}
              disabled={saving}
              className="w-full min-h-[46px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {saving ? t.common.loading : t.apex.saveAndActivatePlan}
            </button>
          </div>

          {/* Live Program Preview */}
          <div className="lg:col-span-7 bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-lg font-bold">{generated.programName}</h3>
                <p className="text-xs text-neutral-500">
                  {tLabel(SPLIT_LABELS[generated.splitType], language)} ·{' '}
                  <span className="tabular-nums">
                    {generated.weeklyFrequency}×/{isAr ? 'أسبوع' : 'wk'} · {generated.durationWeeks}{' '}
                    {isAr ? 'أسابيع' : 'wks'}
                  </span>
                </p>
              </div>
              <div className="text-xs text-neutral-500">
                {equipmentList.map((e) => tLabel(EQUIPMENT_LABELS[e], language)).slice(0, 3).join(' · ')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80">
                <p className="font-semibold text-neutral-500 mb-1">{t.apex.intensityGuidance}</p>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{generated.intensityGuidance}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80">
                <p className="font-semibold text-neutral-500 mb-1">{t.apex.progressionMethod}</p>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{generated.progressionApproach}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80">
                <p className="font-semibold text-neutral-500 mb-1">{t.apex.deloadGuidance}</p>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{generated.deloadGuidance}</p>
              </div>
            </div>

            <div className="space-y-3">
              {generated.workouts.map((w) => {
                const dayLabel = WEEKDAYS.find((wd) => wd.index === w.dayIndex);
                return (
                  <div
                    key={w.dayIndex}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{w.name}</p>
                        <p className="text-xs text-neutral-500">{w.description}</p>
                      </div>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                        {dayLabel ? (isAr ? dayLabel.ar : dayLabel.en) : ''}
                      </span>
                    </div>
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                      {w.exercises.map((ex, i) => (
                        <div key={i} className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-medium">
                            {isAr ? ex.exerciseNameAr : ex.exerciseNameEn}
                          </span>
                          <span className="font-mono text-neutral-500 tabular-nums">
                            {ex.sets} × {ex.targetRepsMin}–{ex.targetRepsMax} · RPE {ex.targetRpe ?? 8} · {ex.restSeconds}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
