import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, Plus, Trash2, Upload, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  deleteBodyMeasurement,
  deleteManualMacroLog,
  generateSafeId,
  saveBodyMeasurement,
  saveManualMacroLog,
} from '../../services/firestoreService';
import { getLocalDateKey, toDisplayWeight, toStorageKg } from '../../utils/calculations';
import { TrendLineChart } from '../common/Charts';

export const ProgressView: React.FC = () => {
  const { firebaseUser, profile, language, unit, t, measurements, macros, showToast } = useApp();

  const [tab, setTab] = useState<'measurements' | 'macros'>('measurements');

  // Measurement form state
  const [date, setDate] = useState(() => getLocalDateKey());
  const [bodyWeightInput, setBodyWeightInput] = useState('');
  const [armCm, setArmCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [thighCm, setThighCm] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [savingMeasure, setSavingMeasure] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; date: string } | null>(null);

  const [chartMetric, setChartMetric] = useState<'bodyWeightKg' | 'waistCm' | 'armCm' | 'chestCm' | 'thighCm'>(
    'bodyWeightKg'
  );

  // Macro form state
  const [macroDate, setMacroDate] = useState(() => getLocalDateKey());
  const [proteinGrams, setProteinGrams] = useState('');
  const [carbsGrams, setCarbsGrams] = useState('');
  const [fatGrams, setFatGrams] = useState('');
  const [macroNotes, setMacroNotes] = useState('');
  const [savingMacro, setSavingMacro] = useState(false);

  const prevMacroDateRef = useRef(macroDate);

  useEffect(() => {
    const existing = macros.find((m) => m.dateKey === macroDate);
    if (existing) {
      setProteinGrams(String(existing.proteinGrams));
      setCarbsGrams(String(existing.carbsGrams));
      setFatGrams(String(existing.fatGrams));
      setMacroNotes(existing.notes || '');
    } else if (prevMacroDateRef.current !== macroDate) {
      setProteinGrams('');
      setCarbsGrams('');
      setFatGrams('');
      setMacroNotes('');
    }
    prevMacroDateRef.current = macroDate;
  }, [macroDate, macros]);

  const unitText = unit === 'lb' ? t.common.lb : t.common.kg;

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setSavingMeasure(true);
    const payload = {
      id: generateSafeId('meas'),
      date,
      bodyWeightKg: bodyWeightInput ? toStorageKg(Number(bodyWeightInput), unit) : undefined,
      armCm: armCm ? Number(armCm) : undefined,
      chestCm: chestCm ? Number(chestCm) : undefined,
      waistCm: waistCm ? Number(waistCm) : undefined,
      thighCm: thighCm ? Number(thighCm) : undefined,
      customLabel: customLabel.trim() || undefined,
      customValue: customValue ? Number(customValue) : undefined,
      notes: notes.trim() || undefined,
    };

    const resetForm = () => {
      setBodyWeightInput('');
      setArmCm('');
      setChestCm('');
      setWaistCm('');
      setThighCm('');
      setCustomLabel('');
      setCustomValue('');
      setNotes('');
      setPhotoFile(null);
    };

    try {
      await saveBodyMeasurement(firebaseUser.uid, payload, photoFile, profile?.coachId);
      resetForm();
      showToast(t.common.savedSuccess);
    } catch {
      if (photoFile) {
        try {
          await saveBodyMeasurement(firebaseUser.uid, payload, null, profile?.coachId);
          resetForm();
          showToast(t.progress.photoUploadFailedFallback, 'info');
          return;
        } catch {
          // Fall through to generic error toast
        }
      }
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSavingMeasure(false);
    }
  };

  const handleSaveMacro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setSavingMacro(true);
    try {
      await saveManualMacroLog(firebaseUser.uid, {
        dateKey: macroDate,
        proteinGrams: Number(proteinGrams) || 0,
        carbsGrams: Number(carbsGrams) || 0,
        fatGrams: Number(fatGrams) || 0,
        notes: macroNotes.trim(),
      });
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSavingMacro(false);
    }
  };

  const measurementPoints = useMemo(() => {
    const ordered = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
    return ordered
      .filter((m) => m[chartMetric] !== undefined)
      .map((m) => {
        const raw = Number(m[chartMetric] || 0);
        const val = chartMetric === 'bodyWeightKg' ? toDisplayWeight(raw, unit) : raw;
        return {
          label: new Date(m.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
          }),
          value: val,
        };
      });
  }, [measurements, chartMetric, unit, language]);

  const macroChartPoints = useMemo(() => {
    const ordered = [...macros].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    return ordered.map((m) => ({
      label: new Date(m.dateKey).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: m.proteinGrams,
      secondaryValue: m.carbsGrams,
    }));
  }, [macros, language]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.progress.title}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{t.progress.subtitle}</p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 shrink-0">
          <button
            onClick={() => setTab('measurements')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              tab === 'measurements'
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {t.progress.tabMeasurements}
          </button>
          <button
            onClick={() => setTab('macros')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              tab === 'macros'
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {t.progress.tabMacros}
          </button>
        </div>
      </div>

      {tab === 'measurements' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Measurement Form */}
          <form
            onSubmit={handleSaveMeasurement}
            className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4 h-fit"
          >
            <h2 className="text-base font-semibold">{t.progress.logMeasurement}</h2>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t.common.date}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  {t.progress.bodyWeight} ({unitText})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={20}
                  max={600}
                  value={bodyWeightInput}
                  onChange={(e) => setBodyWeightInput(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  {t.progress.armCircumference} ({t.common.cm})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={armCm}
                  onChange={(e) => setArmCm(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  {t.progress.chestCircumference} ({t.common.cm})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={chestCm}
                  onChange={(e) => setChestCm(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  {t.progress.waistCircumference} ({t.common.cm})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  {t.progress.thighCircumference} ({t.common.cm})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={thighCm}
                  onChange={(e) => setThighCm(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  {t.progress.customMetricValue}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t.progress.customMetricLabel}</label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
            </div>

            {/* Optional Private Photo */}
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  {t.progress.progressPhoto}
                </span>
                <span className="text-[11px] text-neutral-500">{t.common.optional}</span>
              </div>
              <p className="text-[11px] text-neutral-500">{t.progress.privatePhotoNote}</p>
              <label className="min-h-[38px] px-3 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center gap-2 text-xs cursor-pointer hover:border-emerald-500">
                <Upload className="w-3.5 h-3.5" />
                <span className="truncate">{photoFile ? photoFile.name : t.progress.uploadPhoto}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.common.notes}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
            />

            <button
              type="submit"
              disabled={savingMeasure}
              className="w-full min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.common.save}
            </button>
          </form>

          {/* Chart & History */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">{t.progress.measurementTrend}</h2>
                <select
                  value={chartMetric}
                  onChange={(e) => setChartMetric(e.target.value as typeof chartMetric)}
                  className="min-h-[38px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  <option value="bodyWeightKg">{t.progress.bodyWeight}</option>
                  <option value="waistCm">{t.progress.waistCircumference}</option>
                  <option value="chestCm">{t.progress.chestCircumference}</option>
                  <option value="armCm">{t.progress.armCircumference}</option>
                  <option value="thighCm">{t.progress.thighCircumference}</option>
                </select>
              </div>
              <TrendLineChart
                points={measurementPoints}
                unitLabel={chartMetric === 'bodyWeightKg' ? unitText : t.common.cm}
                primaryLabel={t.progress.measurementTrend}
                emptyMessage={t.progress.noMeasurements}
              />
            </section>

            <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
              {measurements.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-6">{t.progress.noMeasurements}</p>
              ) : (
                <div className="space-y-3">
                  {measurements.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {m.date}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono tabular-nums">
                          {m.bodyWeightKg !== undefined && (
                            <span>
                              {t.progress.bodyWeight}:{' '}
                              <strong>
                                {toDisplayWeight(m.bodyWeightKg, unit)} {unitText}
                              </strong>
                            </span>
                          )}
                          {m.armCm !== undefined && (
                            <span>
                              {t.progress.armCircumference}: <strong>{m.armCm} {t.common.cm}</strong>
                            </span>
                          )}
                          {m.chestCm !== undefined && (
                            <span>
                              {t.progress.chestCircumference}: <strong>{m.chestCm} {t.common.cm}</strong>
                            </span>
                          )}
                          {m.waistCm !== undefined && (
                            <span>
                              {t.progress.waistCircumference}: <strong>{m.waistCm} {t.common.cm}</strong>
                            </span>
                          )}
                          {m.thighCm !== undefined && (
                            <span>
                              {t.progress.thighCircumference}: <strong>{m.thighCm} {t.common.cm}</strong>
                            </span>
                          )}
                          {m.customLabel && m.customValue !== undefined && (
                            <span>
                              {m.customLabel}: <strong>{m.customValue}</strong>
                            </span>
                          )}
                        </div>
                        {m.notes && <p className="text-xs text-neutral-500">{m.notes}</p>}
                        {m.photoUrl && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setPreviewPhoto({ url: m.photoUrl!, date: m.date })}
                              className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 transition-colors cursor-pointer focus:outline-none"
                              aria-label={`${t.progress.progressPhoto} ${m.date}`}
                            >
                              <img
                                src={m.photoUrl}
                                alt={`${t.progress.progressPhoto} ${m.date}`}
                                referrerPolicy="no-referrer"
                                className="w-24 h-24 object-cover block"
                              />
                            </button>
                          </div>
                        )}
                      </div>
                      {firebaseUser && (
                        <button
                          onClick={async () => {
                            try {
                              await deleteBodyMeasurement(firebaseUser.uid, m);
                              showToast(t.common.savedSuccess);
                            } catch {
                              showToast(t.common.errorGeneric, 'error');
                            }
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 cursor-pointer shrink-0"
                          aria-label={t.common.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : (
        /* Manual Macronutrient Tracking (Strict manual entry, no food DB or calorie engine) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSaveMacro}
            className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4 h-fit"
          >
            <div>
              <h2 className="text-base font-semibold">{t.progress.macroTitle}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {t.progress.macroDisclaimer}
              </p>
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t.common.date}</label>
              <input
                type="date"
                required
                value={macroDate}
                onChange={(e) => setMacroDate(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">{t.progress.protein}</label>
                <input
                  type="number"
                  min={0}
                  max={2000}
                  required
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(e.target.value)}
                  className="w-full min-h-[42px] px-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">{t.progress.carbs}</label>
                <input
                  type="number"
                  min={0}
                  max={3000}
                  required
                  value={carbsGrams}
                  onChange={(e) => setCarbsGrams(e.target.value)}
                  className="w-full min-h-[42px] px-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">{t.progress.fat}</label>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  required
                  value={fatGrams}
                  onChange={(e) => setFatGrams(e.target.value)}
                  className="w-full min-h-[42px] px-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
                />
              </div>
            </div>

            <input
              type="text"
              value={macroNotes}
              onChange={(e) => setMacroNotes(e.target.value)}
              placeholder={t.common.notes}
              className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
            />

            <button
              type="submit"
              disabled={savingMacro}
              className="w-full min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
            >
              {t.progress.saveMacros}
            </button>
          </form>

          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-base font-semibold">{t.progress.macroTrendChart}</h2>
              <TrendLineChart
                points={macroChartPoints}
                unitLabel={t.common.grams}
                primaryLabel={t.progress.protein}
                secondaryLabel={t.progress.carbs}
                emptyMessage={t.progress.noMacros}
              />
            </section>

            <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-base font-semibold">{t.progress.macroHistory}</h2>
              {macros.length === 0 ? (
                <p className="text-sm text-neutral-500 py-8 text-center">{t.progress.noMacros}</p>
              ) : (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {macros.map((m) => (
                    <div key={m.dateKey} className="py-3 flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {m.dateKey}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs font-mono tabular-nums">
                          <span>
                            {t.progress.protein}: <strong>{m.proteinGrams}{t.common.grams}</strong>
                          </span>
                          <span>
                            {t.progress.carbs}: <strong>{m.carbsGrams}{t.common.grams}</strong>
                          </span>
                          <span>
                            {t.progress.fat}: <strong>{m.fatGrams}{t.common.grams}</strong>
                          </span>
                        </div>
                        {m.notes && <p className="text-xs text-neutral-500">{m.notes}</p>}
                      </div>
                      {firebaseUser && (
                        <button
                          onClick={async () => {
                            try {
                              await deleteManualMacroLog(firebaseUser.uid, m.dateKey);
                              showToast(t.common.savedSuccess);
                            } catch {
                              showToast(t.common.errorGeneric, 'error');
                            }
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 cursor-pointer shrink-0"
                          aria-label={t.common.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* Private Progress Photo Lightbox Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{previewPhoto.date}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[78vh]">
              <img
                src={previewPhoto.url}
                alt={`${t.progress.progressPhoto} ${previewPhoto.date}`}
                referrerPolicy="no-referrer"
                className="max-h-[78vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
