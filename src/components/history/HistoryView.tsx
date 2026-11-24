import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Clock, MessageSquareQuote, Trash2, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { deleteSessionHistory } from '../../services/firestoreService';
import { formatDuration, formatVolume, formatWeight } from '../../utils/calculations';

export const HistoryView: React.FC = () => {
  const {
    firebaseUser,
    language,
    unit,
    t,
    allExercises,
    programs,
    sessions,
    selectedHistorySessionId,
    clearSelectedHistorySession,
    openExerciseDetail,
    showToast,
  } = useApp();

  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(selectedHistorySessionId);

  useEffect(() => {
    if (selectedHistorySessionId) {
      setExerciseFilter('all');
      setProgramFilter('all');
      setFromDate('');
      setToDate('');
      setExpandedId(selectedHistorySessionId);
      clearSelectedHistorySession();
    }
  }, [selectedHistorySessionId, clearSelectedHistorySession]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (programFilter !== 'all' && s.programId !== programFilter) return false;
      if (exerciseFilter !== 'all' && !s.exercises.some((ex) => ex.exerciseId === exerciseFilter)) {
        return false;
      }
      const dateStr = s.completedAt.slice(0, 10);
      if (fromDate && dateStr < fromDate) return false;
      if (toDate && dateStr > toDate) return false;
      return true;
    });
  }, [sessions, programFilter, exerciseFilter, fromDate, toDate]);

  const handleDelete = async (sessionId: string) => {
    if (!firebaseUser) return;
    try {
      await deleteSessionHistory(firebaseUser.uid, sessionId);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const unitText = unit === 'lb' ? t.common.lb : t.common.kg;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.history.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{t.history.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          value={exerciseFilter}
          onChange={(e) => setExerciseFilter(e.target.value)}
          className="min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
        >
          <option value="all">{t.history.filterExercise}: {t.common.all}</option>
          {allExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {language === 'ar' ? ex.nameAr : ex.nameEn}
            </option>
          ))}
        </select>

        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
        >
          <option value="all">{t.history.filterProgram}: {t.common.all}</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 shrink-0">{t.history.filterFrom}</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="flex-1 min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 shrink-0">{t.history.filterTo}</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="flex-1 min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
          />
        </div>
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="py-14 text-center bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl text-sm text-neutral-500">
          {t.history.noHistory}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const isExpanded = expandedId === s.id;
            return (
              <div
                key={s.id}
                className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base font-semibold truncate">{s.workoutName}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(s.completedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(s.durationSeconds)}
                      </span>
                      {s.programName && <span>· {s.programName}</span>}
                      {s.sessionRpe ? (
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          · RPE {s.sessionRpe}/10
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-end font-mono tabular-nums text-xs">
                      <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                        {formatVolume(s.totalVolumeKg, unit, language)} {unitText}
                      </p>
                      <p className="text-neutral-500">
                        {s.totalSets} {t.history.totalSets}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
                    {s.coachFeedback && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/35 space-y-1 text-xs">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <MessageSquareQuote className="w-3.5 h-3.5" />
                          {t.apex.coachFeedbackLabel}
                        </p>
                        <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">
                          {s.coachFeedback}
                        </p>
                      </div>
                    )}
                    {s.notes && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-[#090A0B] p-3 rounded-xl">
                        <strong>{t.common.notes}:</strong> {s.notes}
                      </p>
                    )}

                    <div className="space-y-3">
                      {s.exercises.map((ex) => (
                        <div
                          key={ex.itemId}
                          className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => openExerciseDetail(ex.exerciseId)}
                              className="text-sm font-semibold hover:text-emerald-500 transition-colors text-start cursor-pointer"
                            >
                              {language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn}
                            </button>
                            {ex.skipped && (
                              <span className="text-xs text-amber-500">{t.history.skippedLabel}</span>
                            )}
                          </div>
                          {ex.notes && (
                            <p className="text-xs text-neutral-500">{ex.notes}</p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs font-mono tabular-nums">
                            {ex.sets
                              .filter((st) => st.completed)
                              .map((st) => (
                                <div
                                  key={st.setNumber}
                                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                                >
                                  <span className="text-neutral-500">#{st.setNumber}</span>
                                  <span className="font-semibold flex items-center gap-1.5">
                                    {formatWeight(st.weightKg, unit)} {unitText} × {st.reps}
                                    {st.rpe !== null && st.rpe !== undefined ? (
                                      <span className="text-neutral-400">RPE {st.rpe}</span>
                                    ) : null}
                                    {st.rir !== null && st.rir !== undefined ? (
                                      <span className="text-neutral-400">RIR {st.rir}</span>
                                    ) : null}
                                    {st.isPR && <Trophy className="w-3 h-3 text-emerald-500" />}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="min-h-[36px] px-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t.history.deleteSession}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
