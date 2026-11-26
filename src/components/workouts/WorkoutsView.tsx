import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Edit3,
  GripVertical,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EQUIPMENT_LABELS, MUSCLE_LABELS, tLabel } from '../../i18n/translations';
import {
  deleteWorkoutTemplate,
  generateSafeId,
  saveWorkoutTemplate,
} from '../../services/firestoreService';
import { Exercise, SetTechnique, WorkoutExerciseItem, WorkoutTemplate } from '../../types/ironlog';
import { toDisplayWeight, toStorageKg } from '../../utils/calculations';

export const WorkoutsView: React.FC = () => {
  const {
    firebaseUser,
    profile,
    language,
    unit,
    t,
    allExercises,
    workouts,
    startWorkoutFromTemplate,
    showToast,
  } = useApp();

  const [editingWorkout, setEditingWorkout] = useState<WorkoutTemplate | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<WorkoutExerciseItem[]>([]);
  const [saving, setSaving] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const openBuilder = (w?: WorkoutTemplate) => {
    if (w) {
      setEditingWorkout(w);
      setName(w.name);
      setDescription(w.description || '');
      setItems(w.exercises.map((ex) => ({ ...ex })));
    } else {
      setEditingWorkout(null);
      setName('');
      setDescription('');
      setItems([]);
    }
    setBuilderOpen(true);
  };

  const addExerciseToDraft = (ex: Exercise) => {
    setItems((prev) => [
      ...prev,
      {
        itemId: generateSafeId('wex'),
        exerciseId: ex.id,
        exerciseNameEn: ex.nameEn,
        exerciseNameAr: ex.nameAr,
        sets: 3,
        warmupSets: 0,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 90,
        technique: 'standard',
        supersetGroup: '',
        notes: '',
      },
    ]);
    setPickerOpen(false);
    setPickerSearch('');
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const handleDrop = (targetIdx: number) => {
    if (dragIndex === null || dragIndex === targetIdx) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const updateItem = (idx: number, patch: Partial<WorkoutExerciseItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !name.trim()) return;
    setSaving(true);
    try {
      const id = editingWorkout ? editingWorkout.id : generateSafeId('wrk');
      await saveWorkoutTemplate(
        firebaseUser.uid,
        {
          id,
          name: name.trim(),
          description: description.trim(),
          exercises: items,
        },
        Boolean(editingWorkout),
        profile?.coachId
      );
      showToast(t.common.savedSuccess);
      setBuilderOpen(false);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (w: WorkoutTemplate) => {
    if (!firebaseUser) return;
    try {
      const copyId = generateSafeId('wrk');
      await saveWorkoutTemplate(
        firebaseUser.uid,
        {
          id: copyId,
          name: `${w.name} (${language === 'ar' ? 'نسخة' : 'Copy'})`.slice(0, 120),
          description: w.description || '',
          exercises: w.exercises.map((ex) => ({ ...ex, itemId: generateSafeId('wex') })),
        },
        false,
        profile?.coachId
      );
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleDelete = async (workoutId: string) => {
    if (!firebaseUser) return;
    try {
      await deleteWorkoutTemplate(firebaseUser.uid, workoutId);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const filteredPicker = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return allExercises;
    return allExercises.filter(
      (ex) =>
        ex.nameEn.toLowerCase().includes(q) ||
        ex.nameAr.toLowerCase().includes(q) ||
        ex.primaryMuscles.some((m) => MUSCLE_LABELS[m].en.toLowerCase().includes(q) || MUSCLE_LABELS[m].ar.includes(q))
    );
  }, [allExercises, pickerSearch]);

  if (builderOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {editingWorkout ? t.workouts.editWorkout : t.workouts.newWorkout}
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
                  {t.workouts.workoutName}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: دفع علوي A' : 'e.g., Push Day A'}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.workouts.workoutDesc}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Exercises List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {t.workouts.exercisesInWorkout} ({items.length})
              </h2>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {t.workouts.addExercise}
              </button>
            </div>

            {items.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl text-sm text-neutral-500">
                {t.workouts.pickExercise}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.itemId}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(idx)}
                    className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab shrink-0 hidden sm:block" />
                        <span className="font-mono text-xs text-emerald-500 font-semibold shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-sm font-semibold truncate">
                          {language === 'ar' ? item.exerciseNameAr : item.exerciseNameEn}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveItem(idx, -1)}
                          disabled={idx === 0}
                          aria-label={t.workouts.moveUp}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(idx, 1)}
                          disabled={idx === items.length - 1}
                          aria-label={t.workouts.moveDown}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          aria-label={t.common.remove}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">
                          {t.workouts.targetSets}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={item.sets}
                          onChange={(e) => updateItem(idx, { sets: Number(e.target.value) || 1 })}
                          className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">
                          {t.workouts.repRange} ({language === 'ar' ? 'الحد الأدنى' : 'Min'})
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={item.targetRepsMin}
                          onChange={(e) =>
                            updateItem(idx, { targetRepsMin: Number(e.target.value) || 1 })
                          }
                          className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">
                          {t.workouts.repRange} ({language === 'ar' ? 'الحد الأقصى' : 'Max'})
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={item.targetRepsMax}
                          onChange={(e) =>
                            updateItem(idx, { targetRepsMax: Number(e.target.value) || 1 })
                          }
                          className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">
                          {t.workouts.restSeconds}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={600}
                          step={15}
                          value={item.restSeconds}
                          onChange={(e) =>
                            updateItem(idx, { restSeconds: Number(e.target.value) || 0 })
                          }
                          className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">
                          {t.apex.warmupSets}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={6}
                          value={item.warmupSets ?? 0}
                          onChange={(e) =>
                            updateItem(idx, { warmupSets: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">
                          {t.apex.targetWeight} ({unit === 'lb' ? t.common.lb : t.common.kg})
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.5"
                          placeholder="—"
                          value={item.targetWeightKg ? toDisplayWeight(item.targetWeightKg, unit) : ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : toStorageKg(Number(e.target.value) || 0, unit);
                            updateItem(idx, { targetWeightKg: val });
                          }}
                          className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">
                          {t.apex.targetRpe}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          step="0.5"
                          placeholder="—"
                          value={item.targetRpe ?? ''}
                          onChange={(e) =>
                            updateItem(idx, {
                              targetRpe: e.target.value === '' ? undefined : Math.min(10, Math.max(1, Number(e.target.value))),
                            })
                          }
                          className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">
                          {t.apex.targetRir}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          step={1}
                          placeholder="—"
                          value={item.targetRir ?? ''}
                          onChange={(e) =>
                            updateItem(idx, {
                              targetRir: e.target.value === '' ? undefined : Math.min(10, Math.max(0, Number(e.target.value))),
                            })
                          }
                          className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[11px] text-neutral-500 mb-1">
                          {t.apex.techniqueLabel}
                        </label>
                        <select
                          value={item.technique ?? 'standard'}
                          onChange={(e) =>
                            updateItem(idx, { technique: e.target.value as SetTechnique })
                          }
                          className="w-full min-h-[40px] px-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                        >
                          <option value="standard">{t.apex.techStandard}</option>
                          <option value="superset">{t.apex.techSuperset}</option>
                          <option value="circuit">{t.apex.techCircuit}</option>
                          <option value="drop_set">{t.apex.techDropSet}</option>
                        </select>
                      </div>
                    </div>

                    {(item.technique === 'superset' || item.technique === 'circuit') && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-500 shrink-0">
                          {language === 'ar' ? 'رمز المجموعة:' : 'Group Tag:'}
                        </span>
                        <input
                          type="text"
                          maxLength={8}
                          value={item.supersetGroup || 'A'}
                          onChange={(e) => updateItem(idx, { supersetGroup: e.target.value.toUpperCase() })}
                          className="w-20 min-h-[34px] px-2.5 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-center"
                        />
                      </div>
                    )}

                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateItem(idx, { notes: e.target.value })}
                      placeholder={t.workouts.exerciseNotes}
                      className="w-full min-h-[38px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
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

        {/* Exercise Picker Modal */}
        {pickerOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder={t.common.searchPlaceholder}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                <button
                  onClick={() => setPickerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredPicker.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => addExerciseToDraft(ex)}
                    className="w-full px-3.5 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-start flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {language === 'ar' ? ex.nameAr : ex.nameEn}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {ex.primaryMuscles.map((m) => tLabel(MUSCLE_LABELS[m], language)).join(language === 'ar' ? '، ' : ', ')} ·{' '}
                        {tLabel(EQUIPMENT_LABELS[ex.equipment], language)}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.workouts.title}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{t.workouts.subtitle}</p>
        </div>
        <button
          onClick={() => openBuilder()}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t.workouts.newWorkout}
        </button>
      </div>

      {workouts.length === 0 ? (
        <div className="py-14 text-center bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl px-4 space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            {t.workouts.noWorkouts}
          </p>
          <button
            onClick={() => openBuilder()}
            className="min-h-[42px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.workouts.newWorkout}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map((w) => {
            const totalSets = w.exercises.reduce((acc, ex) => acc + ex.sets, 0);
            return (
              <div
                key={w.id}
                className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold truncate">{w.name}</h3>
                      {w.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                          {w.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-mono tabular-nums text-neutral-500 shrink-0">
                      {w.exercises.length} {t.workouts.exercisesInWorkout} · {totalSets} {t.common.sets}
                    </span>
                  </div>

                  {w.exercises.length > 0 && (
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                      {w.exercises.slice(0, 4).map((ex) => (
                        <div key={ex.itemId} className="flex items-center justify-between gap-2">
                          <span className="truncate">
                            {language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn}
                            {ex.technique && ex.technique !== 'standard'
                              ? ` · ${
                                  ex.technique === 'superset'
                                    ? `${t.apex.techSuperset}${ex.supersetGroup ? ` ${ex.supersetGroup}` : ''}`
                                    : ex.technique === 'circuit'
                                      ? t.apex.techCircuit
                                      : t.apex.techDropSet
                                }`
                              : ''}
                          </span>
                          <span className="font-mono tabular-nums text-neutral-500 shrink-0">
                            {ex.warmupSets
                              ? `${ex.warmupSets} ${language === 'ar' ? 'إحماء' : 'W'} + `
                              : ''}
                            {ex.sets} × {ex.targetRepsMin}–{ex.targetRepsMax}
                          </span>
                        </div>
                      ))}
                      {w.exercises.length > 4 && (
                        <p className="text-[11px] text-neutral-400">
                          +{w.exercises.length - 4} {t.workouts.exercisesInWorkout}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => startWorkoutFromTemplate(w)}
                    className="min-h-[38px] px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {t.workouts.startLive}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openBuilder(w)}
                      className="min-h-[36px] px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {t.common.edit}
                    </button>
                    <button
                      onClick={() => handleDuplicate(w)}
                      className="min-h-[36px] px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {t.common.duplicate}
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
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
    </div>
  );
};
