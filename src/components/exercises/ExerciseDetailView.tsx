import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Edit3, Film, Flag, Heart, Layers, ShieldAlert, Wind, CheckCircle2, AlertTriangle, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_LABELS,
  tLabel,
} from '../../i18n/translations';
import { deleteCustomExercise, saveExerciseNote, submitExerciseFlag } from '../../services/firestoreService';
import { Exercise, MuscleGroup } from '../../types/ironlog';
import { formatWeight, getExerciseHistoryPoints } from '../../utils/calculations';
import { getExerciseBiomechanics } from '../../utils/exerciseBiomechanics';
import { getExerciseQuickGuide } from '../../data/exerciseGuides';
import { getExerciseVideoAsset } from '../../data/exerciseVideos';
import { ExerciseVideoViewer } from './ExerciseVideoViewer';
import { MuscleDiagram } from '../common/MuscleDiagram';

interface ExerciseDetailViewProps {
  exercise: Exercise;
  onBack: () => void;
  onSelectExercise: (id: string) => void;
  onEditCustom?: (exercise: Exercise) => void;
}

export const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({
  exercise,
  onBack,
  onSelectExercise,
  onEditCustom,
}) => {
  const {
    firebaseUser,
    profile,
    language,
    unit,
    t,
    allExercises,
    exerciseNotes,
    sessions,
    toggleFavoriteExercise,
    showToast,
  } = useApp();

  const isFavorite = (profile?.favoriteExerciseIds || []).includes(exercise.id);
  const savedNote = exerciseNotes[exercise.id];

  const [personalInstructions, setPersonalInstructions] = useState(savedNote?.personalInstructions || '');
  const [notes, setNotes] = useState(savedNote?.notes || exercise.personalNotes || '');
  const [preferredAlts, setPreferredAlts] = useState<string[]>(savedNote?.preferredAlternativeIds || []);
  const [savingNote, setSavingNote] = useState(false);
  const [activeMuscle, setActiveMuscle] = useState<MuscleGroup | null>(null);
  const [anatomyMode, setAnatomyMode] = useState<'video' | '2d'>('video');
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [submittingFlag, setSubmittingFlag] = useState(false);

  const biomechanics = getExerciseBiomechanics(exercise);
  const quickGuide = getExerciseQuickGuide(exercise);
  const hasBuiltinVideo = Boolean(getExerciseVideoAsset(exercise.id, 'general'));

  useEffect(() => {
    const n = exerciseNotes[exercise.id];
    setPersonalInstructions(n?.personalInstructions || '');
    setNotes(n?.notes || exercise.personalNotes || '');
    setPreferredAlts(n?.preferredAlternativeIds || []);
    setActiveMuscle(null);
  }, [exercise.id, exerciseNotes, exercise.personalNotes]);

  const handleSaveNotes = async () => {
    if (!firebaseUser) return;
    setSavingNote(true);
    try {
      await saveExerciseNote(firebaseUser.uid, {
        exerciseId: exercise.id,
        personalInstructions,
        notes,
        preferredAlternativeIds: preferredAlts,
      });
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteCustom = async () => {
    if (!firebaseUser || !exercise.isCustom) return;
    try {
      await deleteCustomExercise(firebaseUser.uid, exercise.id);
      showToast(t.common.savedSuccess);
      onBack();
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const togglePreferredAlt = (altId: string) => {
    setPreferredAlts((prev) =>
      prev.includes(altId) ? prev.filter((id) => id !== altId) : [...prev, altId].slice(0, 10)
    );
  };

  const alternatives = allExercises.filter(
    (e) => exercise.alternativeIds.includes(e.id) || preferredAlts.includes(e.id)
  );
  const easierOptions = allExercises.filter((e) => biomechanics.easierAlternativeIds.includes(e.id));
  const harderOptions = allExercises.filter((e) => biomechanics.harderAlternativeIds.includes(e.id));
  const recentHistory = getExerciseHistoryPoints(exercise.id, sessions).slice(-5).reverse();

  const BackIcon = language === 'ar' ? ArrowRight : ArrowLeft;
  const title = language === 'ar' ? exercise.nameAr : exercise.nameEn;
  const secondaryTitle = language === 'ar' ? exercise.nameEn : exercise.nameAr;
  const breathing = language === 'ar' ? exercise.breathingAr : exercise.breathingEn;
  const safety = language === 'ar' ? exercise.safetyAr : exercise.safetyEn;

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="min-h-[40px] px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
        >
          <BackIcon className="w-4 h-4" />
          {t.common.back}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFlagModalOpen(true)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-xs font-medium inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-amber-500" />
            {t.apex.flagExercise}
          </button>
          {exercise.isCustom && onEditCustom && (
            <>
              <button
                onClick={() => onEditCustom(exercise)}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {t.common.edit}
              </button>
              <button
                onClick={handleDeleteCustom}
                className="min-h-[40px] px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.common.delete}
              </button>
            </>
          )}
          <button
            onClick={() => toggleFavoriteExercise(exercise.id)}
            className={`min-h-[40px] px-4 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFavorite
                ? 'bg-emerald-500/12 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? t.exercises.favorited : t.exercises.addToFavorites}
          </button>
        </div>
      </div>

      {/* Main Title & Metadata */}
      <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{secondaryTitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <span>
            <strong className="text-neutral-900 dark:text-neutral-100">{t.exercises.equipmentRequired}:</strong>{' '}
            {tLabel(EQUIPMENT_LABELS[exercise.equipment], language)}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong className="text-neutral-900 dark:text-neutral-100">{t.exercises.classification}:</strong>{' '}
            {tLabel(CATEGORY_LABELS[exercise.category], language)}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong className="text-neutral-900 dark:text-neutral-100">{t.exercises.difficulty}:</strong>{' '}
            {tLabel(DIFFICULTY_LABELS[exercise.difficulty], language)}
          </span>
          {exercise.isCustom && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t.exercises.customBadge}</span>
            </>
          )}
        </div>
      </div>

      {/* Exercise Video + 2D Muscle Diagram + Execution Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Demonstration & 2D Anatomical Map */}
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">
              {anatomyMode === 'video'
                ? hasBuiltinVideo
                  ? t.apex.view3d
                  : language === 'ar'
                    ? 'خطوات التمرين بالصور'
                    : '3-Step Visual Guide'
                : t.exercises.muscleDiagram}
            </h2>
            <div className="inline-flex rounded-xl border border-neutral-200 dark:border-neutral-800 p-0.5 bg-neutral-100 dark:bg-[#090A0B]">
              <button
                type="button"
                onClick={() => setAnatomyMode('video')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                  anatomyMode === 'video' ? 'bg-emerald-600 text-white' : 'text-neutral-500'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                {hasBuiltinVideo
                  ? language === 'ar'
                    ? 'فيديو'
                    : 'Video'
                  : language === 'ar'
                    ? 'الخطوات'
                    : 'Steps'}
              </button>
              <button
                type="button"
                onClick={() => setAnatomyMode('2d')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                  anatomyMode === '2d' ? 'bg-emerald-600 text-white' : 'text-neutral-500'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                2D
              </button>
            </div>
          </div>

          {anatomyMode === 'video' ? (
            <ExerciseVideoViewer
              exercise={exercise}
              movementPattern={biomechanics.movementPattern}
              stabilizerMuscles={biomechanics.stabilizerMuscles}
              language={language}
              activeMuscle={activeMuscle}
              onSelectMuscle={setActiveMuscle}
              showChecklist={false}
            />
          ) : (
            <MuscleDiagram
              primaryMuscles={exercise.primaryMuscles}
              secondaryMuscles={exercise.secondaryMuscles}
              stabilizerMuscles={biomechanics.stabilizerMuscles}
              movementPattern={biomechanics.movementPattern}
              language={language}
              activeMuscle={activeMuscle}
              onHoverMuscle={setActiveMuscle}
            />
          )}

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {t.apex.muscleFocusHint}
          </p>

          <div className="space-y-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-neutral-500 dark:text-neutral-400">{t.exercises.primaryMuscles}:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {exercise.primaryMuscles.map((m, i) => {
                  const focused = activeMuscle === m;
                  return (
                    <React.Fragment key={m}>
                      {i > 0 && <span className="text-neutral-400" aria-hidden="true">·</span>}
                      <button
                        type="button"
                        onMouseEnter={() => setActiveMuscle(m)}
                        onMouseLeave={() => setActiveMuscle(null)}
                        onClick={() => setActiveMuscle((prev) => (prev === m ? null : m))}
                        className={`font-semibold transition-colors cursor-pointer ${
                          focused
                            ? 'text-emerald-400 underline underline-offset-4'
                            : 'text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4'
                        }`}
                      >
                        {tLabel(MUSCLE_LABELS[m], language)}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-neutral-500 dark:text-neutral-400">{t.exercises.secondaryMuscles}:</span>
              {exercise.secondaryMuscles.length ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {exercise.secondaryMuscles.map((m, i) => {
                    const focused = activeMuscle === m;
                    return (
                      <React.Fragment key={m}>
                        {i > 0 && <span className="text-neutral-400" aria-hidden="true">·</span>}
                        <button
                          type="button"
                          onMouseEnter={() => setActiveMuscle(m)}
                          onMouseLeave={() => setActiveMuscle(null)}
                          onClick={() => setActiveMuscle((prev) => (prev === m ? null : m))}
                          className={`font-medium transition-colors cursor-pointer ${
                            focused
                              ? 'text-amber-500 underline underline-offset-4'
                              : 'text-neutral-700 dark:text-neutral-300 hover:text-amber-500'
                          }`}
                        >
                          {tLabel(MUSCLE_LABELS[m], language)}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <span className="font-medium text-neutral-500">—</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-neutral-500 dark:text-neutral-400">{t.apex.stabilizerMuscles}:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {biomechanics.stabilizerMuscles.map((m, i) => (
                  <React.Fragment key={m}>
                    {i > 0 && <span className="text-neutral-400" aria-hidden="true">·</span>}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveMuscle(m)}
                      onMouseLeave={() => setActiveMuscle(null)}
                      onClick={() => setActiveMuscle((prev) => (prev === m ? null : m))}
                      className="font-medium text-sky-600 dark:text-sky-400 hover:underline underline-offset-4 cursor-pointer"
                    >
                      {tLabel(MUSCLE_LABELS[m], language)}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Execution Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Simple Guide: Simple Explanation + 3 Tips + 3 Things to Avoid */}
          <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="space-y-2 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {language === 'ar' ? 'شرح التمرين وطريقة الأداء الدقيقة' : 'Detailed Exercise Explanation & Mechanics'}
              </h2>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {language === 'ar' ? quickGuide.simpleExplanationAr : quickGuide.simpleExplanationEn}
              </p>
              {hasBuiltinVideo && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  {(language === 'ar' ? quickGuide.stepCaptionsAr : quickGuide.stepCaptionsEn).map((stepText, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80 text-xs space-y-1"
                    >
                      <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 block">
                        0{idx + 1}
                      </span>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{stepText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{language === 'ar' ? '٣ نصائح مهمة للأداء' : '3 Key Form Tips'}</span>
                </h3>
                <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {(language === 'ar' ? quickGuide.tipsAr : quickGuide.tipsEn).map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        0{idx + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{language === 'ar' ? '٣ أخطاء ينبغي تجنبها' : '3 Things to Avoid'}</span>
                </h3>
                <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {(language === 'ar' ? quickGuide.avoidAr : quickGuide.avoidEn).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400 shrink-0">
                        0{idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {(breathing || safety) && (
            <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Wind className="w-4 h-4 text-sky-500" />
                    {t.exercises.breathing}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {breathing || '—'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    {t.exercises.safety}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {safety || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Variations, Alternatives, Regressions/Progressions & Mechanical Comparisons */}
          {(biomechanics.variationsEn.length > 0 ||
            alternatives.length > 0 ||
            easierOptions.length > 0 ||
            harderOptions.length > 0 ||
            biomechanics.comparisons.length > 0) && (
            <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-5">
              {biomechanics.variationsEn.length > 0 && (
                <div className="space-y-1.5">
                  <h2 className="text-sm font-semibold">{t.apex.variations}</h2>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {(language === 'ar' ? biomechanics.variationsAr : biomechanics.variationsEn).join(' · ')}
                  </p>
                </div>
              )}

              {(easierOptions.length > 0 || harderOptions.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  {easierOptions.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                        {t.apex.easierOption}
                      </h3>
                      <div className="space-y-1.5">
                        {easierOptions.map((alt) => (
                          <button
                            key={alt.id}
                            onClick={() => onSelectExercise(alt.id)}
                            className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-sky-500/50 text-start transition-colors cursor-pointer"
                          >
                            <p className="text-xs font-medium truncate">
                              {language === 'ar' ? alt.nameAr : alt.nameEn}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {tLabel(EQUIPMENT_LABELS[alt.equipment], language)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {harderOptions.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {t.apex.harderOption}
                      </h3>
                      <div className="space-y-1.5">
                        {harderOptions.map((alt) => (
                          <button
                            key={alt.id}
                            onClick={() => onSelectExercise(alt.id)}
                            className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/50 text-start transition-colors cursor-pointer"
                          >
                            <p className="text-xs font-medium truncate">
                              {language === 'ar' ? alt.nameAr : alt.nameEn}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {tLabel(EQUIPMENT_LABELS[alt.equipment], language)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {alternatives.length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <h2 className="text-sm font-semibold">{t.exercises.alternatives}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {alternatives.map((alt) => (
                      <button
                        key={alt.id}
                        onClick={() => onSelectExercise(alt.id)}
                        className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 text-start transition-colors cursor-pointer"
                      >
                        <p className="text-sm font-medium truncate">
                          {language === 'ar' ? alt.nameAr : alt.nameEn}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {tLabel(EQUIPMENT_LABELS[alt.equipment], language)} ·{' '}
                          {tLabel(CATEGORY_LABELS[alt.category], language)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {biomechanics.comparisons.length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <h2 className="text-sm font-semibold">{t.apex.comparisonsTitle}</h2>
                  <div className="space-y-2.5">
                    {biomechanics.comparisons.map((cmp) => (
                      <div
                        key={cmp.otherExerciseId}
                        className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80 space-y-1 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectExercise(cmp.otherExerciseId)}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {language === 'ar' ? 'مقارنة مع: ' : 'vs. '}
                          {language === 'ar' ? cmp.otherNameAr : cmp.otherNameEn}
                        </button>
                        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {language === 'ar' ? cmp.mechanicalDiffAr : cmp.mechanicalDiffEn}
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                          {language === 'ar' ? cmp.practicalChoiceAr : cmp.practicalChoiceEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Personal Notes & Preferred Alternatives */}
          <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-500" />
              {t.exercises.personalNotesTitle}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.exercises.personalInstructionsLabel}
                </label>
                <textarea
                  rows={2}
                  value={personalInstructions}
                  onChange={(e) => setPersonalInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.exercises.personalNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                  {t.exercises.preferredAlternativesLabel}
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {allExercises
                    .filter((e) => e.id !== exercise.id && e.primaryMuscles.some((m) => exercise.primaryMuscles.includes(m)))
                    .slice(0, 12)
                    .map((cand) => {
                      const active = preferredAlts.includes(cand.id);
                      return (
                        <button
                          key={cand.id}
                          type="button"
                          onClick={() => togglePreferredAlt(cand.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs border transition-colors cursor-pointer ${
                            active
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                              : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {language === 'ar' ? cand.nameAr : cand.nameEn}
                        </button>
                      );
                    })}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNote}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {t.exercises.savePersonalNotes}
              </button>
            </div>
          </div>



          {/* Recent User Performance */}
          {recentHistory.length > 0 && (
            <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-base font-semibold">{t.exercises.recentPerformance}</h2>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                {recentHistory.map((pt) => (
                  <div key={pt.sessionId} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{pt.workoutName}</p>
                      <p className="text-neutral-500">
                        {new Date(pt.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </p>
                    </div>
                    <div className="font-mono tabular-nums text-end">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatWeight(pt.maxWeightKg, unit)} {unit === 'lb' ? t.common.lb : t.common.kg}
                      </span>
                      <span className="text-neutral-500 ms-2">× {pt.bestReps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flag Incorrect Exercise Information Modal */}
      {flagModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-500" />
                {t.apex.flagExercise}
              </h3>
              <button onClick={() => setFlagModalOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={4}
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder={t.apex.flagReasonPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFlagModalOpen(false)}
                className="min-h-[40px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={submittingFlag || !flagReason.trim()}
                onClick={async () => {
                  if (!firebaseUser || !flagReason.trim()) return;
                  setSubmittingFlag(true);
                  try {
                    await submitExerciseFlag(
                      firebaseUser.uid,
                      profile?.displayName || (language === 'ar' ? 'مستخدم' : 'User'),
                      exercise.id,
                      title,
                      flagReason.trim()
                    );
                    showToast(t.apex.flagSubmitted);
                    setFlagReason('');
                    setFlagModalOpen(false);
                  } catch {
                    showToast(t.common.errorGeneric, 'error');
                  } finally {
                    setSubmittingFlag(false);
                  }
                }}
                className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
