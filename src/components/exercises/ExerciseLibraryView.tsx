import React, { useMemo, useState } from 'react';
import { Dumbbell, Heart, Plus, Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_LABELS,
  tLabel,
} from '../../i18n/translations';
import { generateSafeId, saveCustomExercise } from '../../services/firestoreService';
import {
  DifficultyLevel,
  EquipmentType,
  Exercise,
  ExerciseCategory,
  MuscleGroup,
} from '../../types/ironlog';
import { getExerciseQuickGuide } from '../../data/exerciseGuides';
import { getExerciseVideoAsset } from '../../data/exerciseVideos';
import { ExerciseDetailView } from './ExerciseDetailView';

const ALL_MUSCLES: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'abdominals',
];

const ALL_EQUIPMENT: EquipmentType[] = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'smith_machine',
  'bodyweight',
  'resistance_bands',
];

export const ExerciseLibraryView: React.FC = () => {
  const {
    firebaseUser,
    profile,
    language,
    t,
    allExercises,
    selectedExerciseId,
    openExerciseDetail,
    clearSelectedExercise,
    toggleFavoriteExercise,
    showToast,
  } = useApp();

  const [viewingId, setViewingId] = useState<string | null>(selectedExerciseId);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [customOnly, setCustomOnly] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustom, setEditingCustom] = useState<Exercise | null>(null);

  React.useEffect(() => {
    setViewingId(selectedExerciseId);
  }, [selectedExerciseId]);

  // Form state for custom exercise
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [primaryMuscles, setPrimaryMuscles] = useState<MuscleGroup[]>(['chest']);
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState<EquipmentType>('dumbbell');
  const [category, setCategory] = useState<ExerciseCategory>('compound');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [startingPosition, setStartingPosition] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [breathing, setBreathing] = useState('');
  const [safety, setSafety] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreateModal = (ex?: Exercise) => {
    if (ex) {
      setEditingCustom(ex);
      setNameEn(ex.nameEn);
      setNameAr(ex.nameAr);
      setPrimaryMuscles(ex.primaryMuscles);
      setSecondaryMuscles(ex.secondaryMuscles);
      setEquipment(ex.equipment);
      setCategory(ex.category);
      setDifficulty(ex.difficulty);
      setStartingPosition(language === 'ar' ? ex.startingPositionAr : ex.startingPositionEn);
      setInstructionsText((language === 'ar' ? ex.instructionsAr : ex.instructionsEn).join('\n'));
      setBreathing(language === 'ar' ? ex.breathingAr : ex.breathingEn);
      setSafety(language === 'ar' ? ex.safetyAr : ex.safetyEn);
      setPersonalNotes(ex.personalNotes || '');
    } else {
      setEditingCustom(null);
      setNameEn('');
      setNameAr('');
      setPrimaryMuscles(['chest']);
      setSecondaryMuscles([]);
      setEquipment('dumbbell');
      setCategory('compound');
      setDifficulty('intermediate');
      setStartingPosition('');
      setInstructionsText('');
      setBreathing('');
      setSafety('');
      setPersonalNotes('');
    }
    setModalOpen(true);
  };

  const handleSaveCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || primaryMuscles.length === 0) return;
    setSaving(true);
    try {
      const steps = instructionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const id = editingCustom ? editingCustom.id : generateSafeId('cx');
      await saveCustomExercise(
        firebaseUser.uid,
        {
          id,
          nameEn: nameEn.trim() || nameAr.trim(),
          nameAr: nameAr.trim() || nameEn.trim(),
          primaryMuscles,
          secondaryMuscles,
          equipment,
          category,
          difficulty,
          startingPositionEn: startingPosition,
          startingPositionAr: startingPosition,
          instructionsEn: steps,
          instructionsAr: steps,
          breathingEn: breathing,
          breathingAr: breathing,
          commonMistakesEn: [],
          commonMistakesAr: [],
          safetyEn: safety,
          safetyAr: safety,
          personalNotes,
          alternativeIds: [],
        },
        Boolean(editingCustom)
      );
      showToast(t.common.savedSuccess);
      setModalOpen(false);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSaving(false);
    }
  };

  const favoritesSet = useMemo(() => new Set(profile?.favoriteExerciseIds || []), [profile?.favoriteExerciseIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allExercises.filter((ex) => {
      if (favoritesOnly && !favoritesSet.has(ex.id)) return false;
      if (customOnly && !ex.isCustom) return false;
      if (
        muscleFilter !== 'all' &&
        !ex.primaryMuscles.includes(muscleFilter) &&
        !ex.secondaryMuscles.includes(muscleFilter)
      ) {
        return false;
      }
      if (equipmentFilter !== 'all' && ex.equipment !== equipmentFilter) return false;
      if (categoryFilter !== 'all' && ex.category !== categoryFilter) return false;
      if (q) {
        const hit =
          ex.nameEn.toLowerCase().includes(q) ||
          ex.nameAr.toLowerCase().includes(q) ||
          ex.primaryMuscles.some((m) => MUSCLE_LABELS[m].en.toLowerCase().includes(q) || MUSCLE_LABELS[m].ar.includes(q)) ||
          ex.secondaryMuscles.some((m) => MUSCLE_LABELS[m].en.toLowerCase().includes(q) || MUSCLE_LABELS[m].ar.includes(q)) ||
          EQUIPMENT_LABELS[ex.equipment].en.toLowerCase().includes(q) ||
          EQUIPMENT_LABELS[ex.equipment].ar.includes(q) ||
          CATEGORY_LABELS[ex.category].en.toLowerCase().includes(q) ||
          CATEGORY_LABELS[ex.category].ar.includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [allExercises, search, muscleFilter, equipmentFilter, categoryFilter, favoritesOnly, customOnly, favoritesSet]);

  const activeExercise = viewingId ? allExercises.find((e) => e.id === viewingId) : null;

  if (activeExercise) {
    return (
      <>
        <ExerciseDetailView
          exercise={activeExercise}
          onBack={() => {
            setViewingId(null);
            clearSelectedExercise();
          }}
          onSelectExercise={(id) => {
            setViewingId(id);
            openExerciseDetail(id);
          }}
          onEditCustom={(ex) => openCreateModal(ex)}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.exercises.title}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{t.exercises.subtitle}</p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t.exercises.createCustom}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-neutral-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="w-full min-h-[42px] ps-10 pe-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value as MuscleGroup | 'all')}
            className="min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="all">{t.exercises.filterMuscle}: {t.common.all}</option>
            {ALL_MUSCLES.map((m) => (
              <option key={m} value={m}>
                {tLabel(MUSCLE_LABELS[m], language)}
              </option>
            ))}
          </select>

          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value as EquipmentType | 'all')}
            className="min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="all">{t.exercises.filterEquipment}: {t.common.all}</option>
            {ALL_EQUIPMENT.map((eq) => (
              <option key={eq} value={eq}>
                {tLabel(EQUIPMENT_LABELS[eq], language)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
          <button
            type="button"
            onClick={() => setMuscleFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              muscleFilter === 'all'
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {t.common.all}
          </button>
          {ALL_MUSCLES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMuscleFilter(m)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                muscleFilter === m
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {tLabel(MUSCLE_LABELS[m], language)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'compound', 'isolation'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-transparent'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {cat === 'all' ? t.common.all : tLabel(CATEGORY_LABELS[cat], language)}
              </button>
            ))}

            <button
              onClick={() => setFavoritesOnly((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                favoritesOnly
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              {t.exercises.favoritesOnly}
            </button>

            <button
              onClick={() => setCustomOnly((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                customOnly
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t.exercises.customOnly}
            </button>
          </div>

          <span className="text-xs font-mono tabular-nums text-neutral-500">
            {filtered.length} / {allExercises.length}
          </span>
        </div>
      </div>

      {/* Exercise Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl text-sm text-neutral-500">
          {t.common.noResults}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((ex) => {
            const isFav = favoritesSet.has(ex.id);
            const quickGuide = getExerciseQuickGuide(ex);
            const hasVideo = Boolean(getExerciseVideoAsset(ex.id, 'general'));
            const summaryText =
              language === 'ar' ? quickGuide.simpleExplanationAr : quickGuide.simpleExplanationEn;
            return (
              <div
                key={ex.id}
                className="group bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setViewingId(ex.id)}
                    className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800 bg-[#111317] flex items-center justify-center cursor-pointer"
                    aria-label={language === 'ar' ? ex.nameAr : ex.nameEn}
                  >
                    {quickGuide.stepImage ? (
                      <img
                        src={quickGuide.stepImage}
                        alt={language === 'ar' ? ex.nameAr : ex.nameEn}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Dumbbell className="w-6 h-6 text-emerald-500/80" />
                    )}
                    {hasVideo && (
                      <span className="absolute bottom-1 end-1 px-1 py-0.5 rounded bg-emerald-600/95 text-white text-[9px] font-mono font-bold leading-none">
                        MP4
                      </span>
                    )}
                  </button>

                  <div className="flex-1 min-w-0 flex items-start justify-between gap-1.5">
                    <button
                      onClick={() => setViewingId(ex.id)}
                      className="text-start flex-1 min-w-0 cursor-pointer"
                    >
                      <h3 className="text-sm font-semibold leading-snug group-hover:text-emerald-500 transition-colors">
                        {language === 'ar' ? ex.nameAr : ex.nameEn}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {language === 'ar' ? ex.nameEn : ex.nameAr}
                      </p>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                        {summaryText}
                      </p>
                    </button>
                    <button
                      onClick={() => toggleFavoriteExercise(ex.id)}
                      className={`p-1.5 rounded-lg shrink-0 transition-colors cursor-pointer ${
                        isFav
                          ? 'text-emerald-500'
                          : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                      }`}
                      aria-label={t.exercises.addToFavorites}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setViewingId(ex.id)}
                  className="text-start text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="truncate text-neutral-600 dark:text-neutral-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {ex.primaryMuscles
                        .map((m) => tLabel(MUSCLE_LABELS[m], language))
                        .join(language === 'ar' ? '، ' : ', ')}
                    </span>
                    {' · '}
                    {tLabel(EQUIPMENT_LABELS[ex.equipment], language)}
                  </span>
                  <span className="text-neutral-500 shrink-0 whitespace-nowrap">
                    {ex.isCustom
                      ? t.exercises.customBadge
                      : `${tLabel(CATEGORY_LABELS[ex.category], language)} · ${tLabel(DIFFICULTY_LABELS[ex.difficulty], language)}`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Exercise Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {editingCustom ? t.exercises.editCustom : t.exercises.createCustom}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {language === 'ar' ? 'الاسم (بالإنجليزية)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {language === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {t.exercises.equipmentRequired}
                  </label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                  >
                    {ALL_EQUIPMENT.map((eq) => (
                      <option key={eq} value={eq}>
                        {tLabel(EQUIPMENT_LABELS[eq], language)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {t.exercises.classification}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                  >
                    <option value="compound">{tLabel(CATEGORY_LABELS.compound, language)}</option>
                    <option value="isolation">{tLabel(CATEGORY_LABELS.isolation, language)}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {t.exercises.difficulty}
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                  >
                    {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {tLabel(DIFFICULTY_LABELS[lvl], language)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                  {t.exercises.primaryMuscles}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_MUSCLES.map((m) => {
                    const active = primaryMuscles.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() =>
                          setPrimaryMuscles((prev) =>
                            prev.includes(m)
                              ? prev.length > 1
                                ? prev.filter((x) => x !== m)
                                : prev
                              : [...prev, m].slice(0, 5)
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs border cursor-pointer ${
                          active
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
                        }`}
                      >
                        {tLabel(MUSCLE_LABELS[m], language)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                  {t.exercises.secondaryMuscles}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_MUSCLES.filter((m) => !primaryMuscles.includes(m)).map((m) => {
                    const active = secondaryMuscles.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() =>
                          setSecondaryMuscles((prev) =>
                            prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].slice(0, 8)
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs border cursor-pointer ${
                          active
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
                        }`}
                      >
                        {tLabel(MUSCLE_LABELS[m], language)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.exercises.startingPosition}
                </label>
                <textarea
                  rows={2}
                  value={startingPosition}
                  onChange={(e) => setStartingPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.exercises.executionSteps} ({language === 'ar' ? 'خطوة في كل سطر' : '1 per line'})
                </label>
                <textarea
                  rows={3}
                  value={instructionsText}
                  onChange={(e) => setInstructionsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {t.exercises.breathing}
                  </label>
                  <input
                    type="text"
                    value={breathing}
                    onChange={(e) => setBreathing(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {t.exercises.safety}
                  </label>
                  <input
                    type="text"
                    value={safety}
                    onChange={(e) => setSafety(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.exercises.personalNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[42px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
