import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Film,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getExerciseQuickGuide } from '../../data/exerciseGuides';
import {
  getExerciseVideoAsset,
  getSchoolExecutionSummary,
  TrainingSchoolId,
} from '../../data/exerciseVideos';
import { Exercise, Language, MovementPattern, MuscleGroup } from '../../types/ironlog';
import {
  deleteLocalExerciseVideo,
  ensureVideoCachedOffline,
  getLocalExerciseVideo,
  isVideoCachedOffline,
  resolveOfflineVideoSrc,
  saveLocalExerciseVideo,
  triggerVideoDownload,
} from '../../utils/offlineVideoStore';
import { MuscleDiagram } from '../common/MuscleDiagram';

interface ExerciseVideoViewerProps {
  exercise: Exercise;
  movementPattern: MovementPattern;
  stabilizerMuscles: MuscleGroup[];
  language: Language;
  activeMuscle?: MuscleGroup | null;
  onSelectMuscle?: (muscle: MuscleGroup | null) => void;
  compact?: boolean;
  showChecklist?: boolean;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25] as const;

export const ExerciseVideoViewer: React.FC<ExerciseVideoViewerProps> = ({
  exercise,
  movementPattern,
  stabilizerMuscles,
  language,
  compact = false,
  showChecklist,
}) => {
  const { showToast, t } = useApp();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [school, setSchool] = useState<TrainingSchoolId>('general');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [hasCustomLocal, setHasCustomLocal] = useState(false);

  const [builtinCachedSrc, setBuiltinCachedSrc] = useState<string | null>(null);
  const [isCachedOffline, setIsCachedOffline] = useState(false);
  const [cachingOffline, setCachingOffline] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [imgFailed, setImgFailed] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const builtinAsset = getExerciseVideoAsset(exercise.id, school);
  const schoolSummary = getSchoolExecutionSummary(exercise, movementPattern, school);
  const quickGuide = getExerciseQuickGuide(exercise);

  useEffect(() => {
    setImgFailed(false);
    setZoomOpen(false);
  }, [exercise.id]);

  // Load any user-attached offline video from IndexedDB, or cache built-in asset for offline use
  useEffect(() => {
    let active = true;
    let revokeLocal: string | null = null;
    let revokeBuiltin: string | null = null;

    async function loadVideoSources() {
      setLocalBlobUrl(null);
      setLocalFileName(null);
      setHasCustomLocal(false);
      setBuiltinCachedSrc(null);
      setIsCachedOffline(false);

      const stored = await getLocalExerciseVideo(exercise.id, school);
      if (!active) return;

      if (stored) {
        const url = URL.createObjectURL(stored.blob);
        revokeLocal = url;
        setLocalBlobUrl(url);
        setLocalFileName(stored.fileName);
        setHasCustomLocal(true);
        setIsCachedOffline(true);
        return;
      }

      if (builtinAsset?.src) {
        const cached = await isVideoCachedOffline(builtinAsset.src);
        if (!active) return;
        if (cached) {
          setIsCachedOffline(true);
          const resolved = await resolveOfflineVideoSrc(builtinAsset.src);
          if (!active) {
            if (resolved.startsWith('blob:')) URL.revokeObjectURL(resolved);
            return;
          }
          if (resolved.startsWith('blob:')) revokeBuiltin = resolved;
          setBuiltinCachedSrc(resolved);
        } else {
          setBuiltinCachedSrc(builtinAsset.src);
          // Warm Cache API automatically so future offline visits play immediately without internet
          setCachingOffline(true);
          const ok = await ensureVideoCachedOffline(builtinAsset.src);
          if (active) {
            setIsCachedOffline(ok);
            setCachingOffline(false);
          }
        }
      }
    }

    void loadVideoSources();

    return () => {
      active = false;
      if (revokeLocal) URL.revokeObjectURL(revokeLocal);
      if (revokeBuiltin) URL.revokeObjectURL(revokeBuiltin);
    };
  }, [exercise.id, school, builtinAsset?.src]);

  // Sync playback speed & mute state when video element mounts or changes
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
    el.muted = isMuted;
  }, [playbackRate, isMuted, localBlobUrl, builtinCachedSrc]);

  const activeSrc = localBlobUrl || builtinCachedSrc || builtinAsset?.src || null;
  const activeDownloadName =
    localFileName || builtinAsset?.fileName || `${exercise.id}-${school}.mp4`;

  const stepImageSrc = !activeSrc && quickGuide.stepImage && !imgFailed ? quickGuide.stepImage : null;
  const stepCaptions =
    language === 'ar' ? quickGuide.stepCaptionsAr : quickGuide.stepCaptionsEn;
  const shouldShowChecklist = showChecklist ?? compact;

  const handleTogglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play();
    setIsPlaying(true);
  };

  const handleDownload = async () => {
    if (!activeSrc) return;
    setDownloading(true);
    try {
      await triggerVideoDownload(activeSrc, activeDownloadName);
    } finally {
      setDownloading(false);
    }
  };

  const handleManualCacheOffline = async () => {
    if (!builtinAsset?.src) return;
    setCachingOffline(true);
    const ok = await ensureVideoCachedOffline(builtinAsset.src);
    setIsCachedOffline(ok);
    setCachingOffline(false);
    if (ok) {
      showToast(language === 'ar' ? 'تم حفظ الفيديو للعمل بدون إنترنت' : 'Video saved for offline playback');
    } else {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleUploadLocalVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const saved = await saveLocalExerciseVideo(exercise.id, school, file);
      const url = URL.createObjectURL(saved.blob);
      setLocalBlobUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return url;
      });
      setLocalFileName(saved.fileName);
      setHasCustomLocal(true);
      setIsCachedOffline(true);
      showToast(
        language === 'ar'
          ? 'تم حفظ الفيديو محلياً وسيعمل دائماً بدون نت'
          : 'Video saved locally for 100% offline playback'
      );
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleRemoveLocalVideo = async () => {
    await deleteLocalExerciseVideo(exercise.id, school);
    setLocalBlobUrl((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setLocalFileName(null);
    setHasCustomLocal(false);
    if (!builtinAsset?.src) setIsCachedOffline(false);
    showToast(language === 'ar' ? 'تم حذف الفيديو المحلي' : 'Local video removed');
  };

  const schoolTabs: { id: TrainingSchoolId; labelEn: string; labelAr: string }[] = [
    { id: 'general', labelEn: 'Core Form', labelAr: 'الأساسي المختصر' },
    { id: 'modern', labelEn: 'Modern Science', labelAr: 'المدرسة العلمية' },
    { id: 'old_school', labelEn: 'Old School', labelAr: 'المدرسة القديمة' },
  ];

  const exerciseTitle = language === 'ar' ? exercise.nameAr : exercise.nameEn;

  return (
    <div className="space-y-3.5">
      {/* Training School Selector */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
        {schoolTabs.map((tab) => {
          const active = school === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSchool(tab.id)}
              className={`min-h-[34px] px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer truncate ${
                active
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {language === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          );
        })}
      </div>

      {/* Hidden File Input for Offline Custom Video Attachment */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleUploadLocalVideo}
      />

      {activeSrc ? (
        <div className="space-y-2.5">
          {/* Direct Autoplay Video Player */}
          <div className="relative rounded-xl overflow-hidden bg-black border border-neutral-800">
            <video
              ref={videoRef}
              key={activeSrc}
              src={activeSrc}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className={`w-full object-contain bg-black ${
                compact ? 'max-h-[250px]' : 'max-h-[380px]'
              }`}
            />

            {/* Clean Top-Start Offline Label */}
            <div className="absolute top-2.5 start-2.5 flex items-center gap-1.5">
              {isCachedOffline ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/75 backdrop-blur-xs border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  {language === 'ar' ? 'يعمل بدون نت' : 'Offline Ready'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleManualCacheOffline}
                  disabled={cachingOffline}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/75 backdrop-blur-xs border border-neutral-600 text-neutral-200 hover:border-emerald-500/60 text-[10px] font-semibold cursor-pointer"
                >
                  <Download className="w-3 h-3 shrink-0" />
                  {cachingOffline
                    ? language === 'ar'
                      ? 'جارٍ الحفظ...'
                      : 'Caching...'
                    : language === 'ar'
                      ? 'حفظ للأوفلاين'
                      : 'Save Offline'}
                </button>
              )}
            </div>
          </div>

          {/* Player Controls + Download MP4 */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="min-h-[34px] px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                aria-label={isPlaying ? t.apex.pause : t.apex.play}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? t.apex.pause : t.apex.play}</span>
              </button>

              <button
                type="button"
                onClick={handleReplay}
                className="min-h-[34px] px-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-xs inline-flex items-center justify-center cursor-pointer"
                title={t.apex.replay}
                aria-label={t.apex.replay}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className="min-h-[34px] px-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-xs inline-flex items-center justify-center cursor-pointer"
                title={isMuted ? (language === 'ar' ? 'تشغيل الصوت' : 'Unmute') : (language === 'ar' ? 'كتم الصوت' : 'Mute')}
                aria-label={isMuted ? (language === 'ar' ? 'تشغيل الصوت' : 'Unmute') : (language === 'ar' ? 'كتم الصوت' : 'Mute')}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Speed Selector */}
              <div className="inline-flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 bg-neutral-50 dark:bg-[#090A0B]">
                {SPEED_OPTIONS.map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackRate(spd)}
                    className={`px-1.5 py-1 rounded-md text-[10px] font-mono font-semibold cursor-pointer ${
                      playbackRate === spd
                        ? 'bg-emerald-600 text-white'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="min-h-[34px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'ar' ? 'تنزيل الفيديو' : 'Download MP4'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[34px] px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-xs inline-flex items-center gap-1 cursor-pointer"
                title={language === 'ar' ? 'إرفاق فيديو من جهازك' : 'Attach local video'}
              >
                <Upload className="w-3.5 h-3.5" />
              </button>

              {hasCustomLocal && (
                <button
                  type="button"
                  onClick={handleRemoveLocalVideo}
                  className="min-h-[34px] px-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs inline-flex items-center cursor-pointer"
                  title={t.common.delete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : stepImageSrc ? (
        /* 3-Step Visual Illustration Guide (Offline-First) */
        <div className="space-y-2.5">
          <div className="relative rounded-xl overflow-hidden bg-[#111317] border border-neutral-200 dark:border-neutral-800 group">
            <img
              src={stepImageSrc}
              alt={`${exerciseTitle} — ${language === 'ar' ? 'خطوات الأداء المصورة' : '3-Step Execution Guide'}`}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              onClick={() => setZoomOpen(true)}
              className={`w-full aspect-video object-cover bg-[#111317] cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01] ${
                compact ? 'max-h-[240px]' : ''
              }`}
            />

            <div className="absolute top-2.5 start-2.5 flex items-center gap-1.5 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/75 backdrop-blur-xs border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                {language === 'ar' ? 'دليل 3 خطوات · أوفلاين' : '3-Step Guide · Offline'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="absolute bottom-2.5 end-2.5 min-h-[32px] px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black/90 backdrop-blur-xs border border-neutral-700 text-neutral-100 text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
              aria-label={language === 'ar' ? 'تكبير الصورة' : 'Enlarge steps diagram'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تكبير' : 'Zoom'}</span>
            </button>
          </div>

          {/* 3 Numbered Step Captions Matching Panels 1, 2, 3 */}
          {stepCaptions && (
            <div className="grid grid-cols-1 gap-1.5">
              {stepCaptions.map((caption, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80 text-xs"
                >
                  <span className="font-mono tabular-nums text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {caption}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Optional Local Video Attachment Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {language === 'ar'
                ? 'يمكنك أيضاً إرفاق فيديو خاص من جهازك'
                : 'Optionally attach a local clip anytime'}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[30px] px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Upload className="w-3 h-3" />
              <span>{language === 'ar' ? 'إضافة فيديو' : 'Attach MP4'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Anatomical Muscle Map Fallback for Custom User Exercises */
        <div className="space-y-2.5">
          <div className="rounded-xl overflow-hidden bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 p-3">
            <MuscleDiagram
              primaryMuscles={exercise.primaryMuscles}
              secondaryMuscles={exercise.secondaryMuscles}
              stabilizerMuscles={stabilizerMuscles}
              movementPattern={movementPattern}
              language={language}
              compact={compact}
              showInspector={false}
            />
          </div>

          {stepCaptions && (
            <div className="grid grid-cols-1 gap-1.5">
              {stepCaptions.map((caption, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800/80 text-xs"
                >
                  <span className="font-mono tabular-nums text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {caption}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {language === 'ar'
                ? 'يمكنك إرفاق فيديو خاص من جهازك للعمل بدون نت'
                : 'Optionally attach a local MP4 clip anytime'}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[30px] px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Upload className="w-3 h-3" />
              <span>{language === 'ar' ? 'إضافة فيديو' : 'Attach MP4'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Detailed Exercise Explanation + Training School Breakdown */}
      <div className="rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 p-3.5 space-y-2.5">
        {compact && (
          <div className="space-y-1 pb-2.5 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              {language === 'ar' ? 'شرح التمرين وطريقة الأداء' : 'How to Perform Properly'}
            </span>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {language === 'ar' ? quickGuide.simpleExplanationAr : quickGuide.simpleExplanationEn}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {language === 'ar' ? schoolSummary.badgeAr : schoolSummary.badgeEn}
          </span>
          {builtinAsset?.durationSec && activeSrc && (
            <span className="text-[10px] font-mono tabular-nums text-neutral-500">
              {language === 'ar'
                ? `${builtinAsset.durationSec} ث · MP4`
                : `${builtinAsset.durationSec}s · MP4`}
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed">
          {language === 'ar' ? schoolSummary.focusAr : schoolSummary.focusEn}
        </p>
        <ul className="space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400">
          {(language === 'ar' ? schoolSummary.cuesAr : schoolSummary.cuesEn).map((cue, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                0{idx + 1}
              </span>
              <span>{cue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Compact Mode Checklist (e.g., inside Live Workout Modal): 3 Tips + 3 Things to Avoid */}
      {shouldShowChecklist && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'ar' ? '3 نصائح مهمة' : '3 Key Tips'}</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-neutral-700 dark:text-neutral-300">
              {(language === 'ar' ? quickGuide.tipsAr : quickGuide.tipsEn).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                    0{idx + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'ar' ? '3 أشياء تبتعد عنها' : '3 Things to Avoid'}</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-neutral-700 dark:text-neutral-300">
              {(language === 'ar' ? quickGuide.avoidAr : quickGuide.avoidEn).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                    0{idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Fullscreen Zoom Modal for 3-Step Diagram */}
      {zoomOpen && !activeSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-[#111317] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-800">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{exerciseTitle}</h3>
                <p className="text-[11px] text-neutral-400">
                  {language === 'ar'
                    ? 'دليل الأداء المصور من 3 خطوات'
                    : '3-Step Execution Visual Guide'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="min-h-[36px] min-w-[36px] rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-200 inline-flex items-center justify-center cursor-pointer shrink-0"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {stepImageSrc && (
              <img
                src={stepImageSrc}
                alt={`${exerciseTitle} — ${language === 'ar' ? 'خطوات الأداء المصورة' : '3-Step Execution Guide'}`}
                referrerPolicy="no-referrer"
                className="w-full max-h-[65vh] object-contain bg-[#111317]"
              />
            )}
            {stepCaptions && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-4 border-t border-neutral-800 bg-[#090A0B]">
                {stepCaptions.map((caption, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-neutral-300 leading-relaxed"
                  >
                    <span className="font-mono tabular-nums font-bold text-emerald-400 shrink-0">
                      0{idx + 1}
                    </span>
                    <span>{caption}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
