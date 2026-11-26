import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  HardDriveDownload,
  Monitor,
  QrCode,
  RefreshCw,
  Share2,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useOnlineStatus, usePWAInstall } from '../../hooks/usePWAInstall';

const AppQRCode: React.FC<{ url: string; alt: string }> = ({ url, alt }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    if (!url) return;
    QRCode.toDataURL(url, {
      width: 180,
      margin: 2,
      color: {
        dark: '#090A0B',
        light: '#FFFFFF',
      },
    })
      .then((res) => {
        if (active) setDataUrl(res);
      })
      .catch(() => {
        // Ignore QR generation errors
      });
    return () => {
      active = false;
    };
  }, [url]);

  if (!dataUrl) {
    return (
      <div className="w-[148px] h-[148px] rounded-xl bg-white border border-neutral-200 flex items-center justify-center">
        <QrCode className="w-8 h-8 text-neutral-400" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      width={148}
      height={148}
      className="w-[148px] h-[148px] rounded-xl bg-white p-1.5 border border-neutral-200 shadow-xs shrink-0"
    />
  );
};

interface InstallGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ open, onClose }) => {
  const { language, showToast } = useApp();
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    offlineReady,
    apkAvailable,
    apkDownloadUrl,
    apkSizeBytes,
    install,
  } = usePWAInstall();

  if (!open) return null;

  const isAr = language === 'ar';
  const shareUrl = typeof window !== 'undefined' ? window.location.origin + '/' : '/';
  const apkSizeLabel = apkSizeBytes
    ? `${(apkSizeBytes / (1024 * 1024)).toFixed(1)} MB`
    : null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast(
        isAr
          ? 'تم نسخ رابط التطبيق — أرسله أو افتحه في المتصفح للتثبيت'
          : 'App link copied — open in Chrome or Safari to install'
      );
    } catch {
      showToast(isAr ? 'انسخ الرابط من شريط العنوان' : 'Copy the URL from your address bar', 'info');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'APEX Fitness & Coaching',
          text: isAr
            ? 'حمّل تطبيق APEX للتمارين والعمل دون إنترنت:'
            : 'Download & install APEX Fitness for offline training:',
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share unsupported; fallback to copy
      }
    }
    await handleCopyUrl();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              {isIOS || isAndroid ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                {isInstalled
                  ? isAr
                    ? 'مشاركة رابط تحميل APEX'
                    : 'Share APEX App Link'
                  : isAr
                    ? 'تثبيت تطبيق APEX على هاتفك بسهولة'
                    : 'Install APEX on Your Device'}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {isAr
                  ? 'يعمل كتطبيق مستقل على الشاشة الرئيسية ودون إنترنت'
                  : 'Runs standalone from your Home Screen and works offline'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Direct Android APK Download (Sideload without Play Store) */}
        {!isInstalled && apkAvailable && apkDownloadUrl && !isIOS && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 space-y-2.5">
            <a
              href={apkDownloadUrl}
              download="APEX.apk"
              className="w-full min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isAr
                  ? `تنزيل ملف APK مباشرة (أندرويد)${apkSizeLabel ? ` · ${apkSizeLabel}` : ''}`
                  : `Download Android APK Directly${apkSizeLabel ? ` · ${apkSizeLabel}` : ''}`}
              </span>
            </a>
            <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {isAr
                ? 'بعد اكتمال التنزيل، افتح ملف APEX.apk واضغط «تثبيت» (إذا ظهر تنبيه الأمان أول مرة، فعّل خيار «السماح من هذا المصدر»).'
                : 'Once downloaded, open APEX.apk and tap Install (enable "Allow from this source" if prompted the first time).'}
            </p>
          </div>
        )}

        {/* Honest notice when APK binary has not been attached yet */}
        {!isInstalled && !apkAvailable && !isIOS && (
          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-1.5">
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              {isAr
                ? 'حالة ملف APK المستقل (APEX.apk): غير مرفوع بعد'
                : 'Standalone APEX.apk file: not attached yet'}
            </p>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'لا يمكن لهذه الصفحة تنزيل ملف APK تلقائياً إلا بعد بنائه عبر GitHub Actions (أو Android Studio) وإرفاقه. يمكنك تثبيت التطبيق كاملاً دون اتصال بالإنترنت الآن عبر المتصفح بالخطوات أدناه، أو بناء APEX.apk وتفعيله للتحميل المباشر.'
                : 'Direct APK download activates once APEX.apk is built (via GitHub Actions or Android Studio) and hosted. Meanwhile, you can install the full offline standalone app right now using the browser steps below.'}
            </p>
          </div>
        )}

        {/* Direct 1-tap install if browser allows */}
        {!isInstalled && isInstallable && (
          <button
            type="button"
            onClick={async () => {
              const ok = await install();
              if (ok) {
                showToast(isAr ? 'تم تثبيت التطبيق بنجاح!' : 'App installed successfully!');
                onClose();
              }
            }}
            className={`w-full min-h-[44px] rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer ${
              apkAvailable && !isIOS
                ? 'border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تثبيت فوري من المتصفح (دون ملفات)' : 'Install Instantly via Browser (1-Tap)'}</span>
          </button>
        )}

        {/* Quick Share + QR Code Card for Instant Mobile Opening */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-4">
          <AppQRCode
            url={shareUrl}
            alt={isAr ? 'رمز QR لفتح وتثبيت تطبيق APEX' : 'QR code to open and install APEX'}
          />
          <div className="flex-1 space-y-2.5 text-center sm:text-start">
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              {isAr ? 'امسح الرمز بكاميرا الهاتف أو أرسل الرابط' : 'Scan with Phone Camera or Share Link'}
            </p>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isAr
                ? 'وجّه كاميرا الهاتف إلى الرمز لفتح التطبيق في المتصفح وتثبيته مباشرة على الشاشة الرئيسية.'
                : 'Point any phone camera at the QR code to open in your browser and install directly to the Home Screen.'}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleNativeShare}
                className="min-h-[38px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'مشاركة الرابط' : 'Share Link'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="min-h-[38px] px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isAr ? 'نسخ الرابط' : 'Copy URL'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Iframe warning if opened inside AI Studio preview */}
        {!isInstalled && isInIframe && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/35 space-y-2">
            <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
              {isAr
                ? 'لظهور زر التثبيت التلقائي على جهازك، افتح التطبيق في تبويب متصفح مستقل (خارج نافذة المعاينة):'
                : 'To unlock the browser’s native 1-tap install button, open this page in a standalone browser tab:'}
            </p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isAr ? 'فتح في متصفح مستقل الآن' : 'Open in Standalone Tab'}</span>
            </a>
          </div>
        )}

        {/* Ultra-simple device steps */}
        {!isInstalled && (
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
            <p className="font-bold text-neutral-900 dark:text-neutral-100">
              {isIOS
                ? isAr
                  ? 'خطوتان فقط على iPhone / iPad (Safari):'
                  : '2 quick steps on iPhone / iPad (Safari):'
                : isAndroid
                  ? isAr
                    ? 'خطوات التثبيت كتطبيق مستقل على Android (Chrome):'
                    : 'Steps to install standalone on Android (Chrome):'
                  : isAr
                    ? 'خطوتان للتثبيت على الكمبيوتر (Chrome / Edge):'
                    : '2 quick steps on Desktop (Chrome / Edge):'}
            </p>
            {isIOS ? (
              <ol className="space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>
                  {isAr
                    ? 'اضغط زر المشاركة أسفل متصفح Safari (المربع بسهم لأعلى).'
                    : 'Tap the Share icon in the Safari toolbar.'}
                </li>
                <li>
                  {isAr
                    ? 'اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen) ثم «إضافة».'
                    : 'Tap "Add to Home Screen" and confirm "Add".'}
                </li>
              </ol>
            ) : isAndroid ? (
              <ol className="space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>
                  {isAr
                    ? 'إذا فتحت الرابط من واتساب أو تيليجرام، اضغط (⋮) واختر «فتح في Chrome» أولاً.'
                    : 'If opened inside WhatsApp or Telegram, tap (⋮) and choose "Open in Chrome" first.'}
                </li>
                <li>
                  {isAr
                    ? 'اضغط زر «تثبيت فوري من المتصفح» بالأعلى أو افتح قائمة Chrome (⋮).'
                    : 'Tap "Install Instantly via Browser" above, or open the Chrome menu (⋮).'}
                </li>
                <li>
                  {isAr
                    ? 'اختر «تثبيت التطبيق» (Install app) ليصبح تطبيقاً كاملاً دون إنترنت على شاشتك.'
                    : 'Select "Install app" or "Add to Home screen" to run standalone offline.'}
                </li>
              </ol>
            ) : (
              <ol className="space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>
                  {isAr
                    ? 'اضغط أيقونة التثبيت في شريط العنوان، أو افتح قائمة المتصفح (⋮).'
                    : 'Click the install icon in the address bar, or open the browser menu (⋮).'}
                </li>
                <li>
                  {isAr
                    ? 'اختر «تثبيت APEX» ليفتح كتطبيق مستقل دون اتصال بالإنترنت.'
                    : 'Click "Install APEX" to run as a standalone offline app.'}
                </li>
              </ol>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/25">
          <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            {offlineReady
              ? isAr
                ? 'جاهز للعمل دون اتصال بالإنترنت — التمارين والصور والفيديوهات محفوظة محلياً'
                : 'Ready offline — guides, diagrams & videos cached locally'
              : isAr
                ? 'جارٍ حفظ ملفات التطبيق للعمل دون اتصال بالإنترنت...'
                : 'Preparing offline local storage...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, showToast } = useApp();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [guideOpen, setGuideOpen] = useState(false);

  if (isInstalled) return null;

  const isAr = language === 'ar';

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        showToast(isAr ? 'تم تثبيت التطبيق بنجاح!' : 'App installed successfully!');
        return;
      }
    }
    setGuideOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          compact ? 'min-h-[36px] px-2.5 text-xs' : 'w-full min-h-[40px] px-3 text-xs'
        }`}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>
          {compact
            ? isAr
              ? 'تثبيت التطبيق'
              : 'Install App'
            : isAr
              ? 'تنزيل وتثبيت التطبيق'
              : 'Install Offline App'}
        </span>
      </button>

      <InstallGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
};

export const SmartInstallBanner: React.FC = () => {
  const { language, showToast } = useApp();
  const {
    isInstalled,
    isInstallable,
    isIOS,
    bannerDismissed,
    apkAvailable,
    apkDownloadUrl,
    dismissBanner,
    install,
  } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  if (isInstalled || bannerDismissed) return null;

  const isAr = language === 'ar';

  const handlePrimaryInstall = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        showToast(isAr ? 'تم تثبيت تطبيق APEX بنجاح!' : 'APEX app installed successfully!');
        return;
      }
    }
    setModalOpen(true);
  };

  return (
    <>
      <div className="mb-5 rounded-2xl bg-white dark:bg-[#121417] border border-emerald-500/35 p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {isAr ? 'حمّل تطبيق APEX على جهازك للعمل دون إنترنت' : 'Get the APEX App on Your Device'}
            </p>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate sm:whitespace-normal">
              {isAr
                ? 'افتحه مباشرة من الشاشة الرئيسية مع التمارين والصور والفيديوهات دون إنترنت.'
                : 'Launch straight from your Home Screen with exercises, guides, and logs offline.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {apkAvailable && apkDownloadUrl && !isIOS && (
            <a
              href={apkDownloadUrl}
              download="APEX.apk"
              className="min-h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحميل APK مباشر' : 'Download APK'}</span>
            </a>
          )}
          <button
            type="button"
            onClick={handlePrimaryInstall}
            className={`min-h-[38px] px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              apkAvailable && !isIOS
                ? 'border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تثبيت الآن' : 'Install Now'}</span>
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            title={isAr ? 'رمز QR ومشاركة' : 'QR & Share'}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'مشاركة / QR' : 'Share / QR'}</span>
          </button>
          <button
            type="button"
            onClick={dismissBanner}
            className="min-h-[38px] min-w-[38px] rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 flex items-center justify-center cursor-pointer"
            aria-label={isAr ? 'إخفاء' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <InstallGuideModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export const OfflineAppCard: React.FC = () => {
  const { language, showToast } = useApp();
  const isOnline = useOnlineStatus();
  const {
    isInstalled,
    isNativeApp,
    swRegistered,
    offlineReady,
    needRefresh,
    apkAvailable,
    apkDownloadUrl,
    applyUpdate,
    prepareOfflineBundle,
  } = usePWAInstall();

  const [preparing, setPreparing] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [cacheResult, setCacheResult] = useState<{
    cachedVideos: number;
    totalBuiltinVideos: number;
    customLocalVideosCount: number;
  } | null>(null);

  const isAr = language === 'ar';

  const handlePrepareOffline = async () => {
    setPreparing(true);
    try {
      const stats = await prepareOfflineBundle();
      setCacheResult(stats);
      showToast(
        isAr
          ? 'تم تجهيز وتخزين التمارين والصور والفيديوهات للعمل دون إنترنت'
          : 'Offline cache verified: guides, images, and videos ready offline'
      );
    } catch {
      showToast(
        isAr ? 'تعذر تحديث بعض الملفات حالياً' : 'Could not refresh some offline assets',
        'error'
      );
    } finally {
      setPreparing(false);
    }
  };

  return (
    <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <HardDriveDownload className="w-4 h-4 text-emerald-500" />
            {isAr ? 'تثبيت التطبيق والعمل دون إنترنت' : 'App Installation & Offline Mode'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr
              ? 'ثبّت APEX على الهاتف أو شارك رابط التحميل ورمز QR مع المتدربين للعمل دون اتصال بالإنترنت بالكامل.'
              : 'Install APEX on any device or share the QR code & link with athletes for full offline training.'}
          </p>
        </div>
        {!isInstalled && (
          <div className="shrink-0">
            <PWAInstallButton />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span className="text-[11px] text-neutral-500 block">
            {isAr ? 'وضع التشغيل' : 'App Mode'}
          </span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {isNativeApp
              ? isAr
                ? 'تطبيق هاتف مستقل (Native App)'
                : 'Native Standalone Mobile App'
              : isInstalled
                ? isAr
                  ? 'مثبّت كتطبيق مستقل (PWA)'
                  : 'Installed Standalone App (PWA)'
                : isAr
                  ? 'يعمل عبر المتصفح (جاهز للتثبيت)'
                  : 'Browser Mode (Ready to Install)'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span className="text-[11px] text-neutral-500 block">
            {isAr ? 'محرك العمل دون اتصال' : 'Offline Cache Engine'}
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {offlineReady || swRegistered
              ? isAr
                ? 'نشط — التمارين والصور محفوظة محلياً'
                : 'Active — Guides & Assets Cached'
              : isAr
                ? 'نشط عند البناء والإنتاج'
                : 'Ready on Installed Build'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span className="text-[11px] text-neutral-500 block">
            {isAr ? 'الاتصال وقاعدة البيانات' : 'Network & Sync DB'}
          </span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {isOnline
              ? isAr
                ? 'متصل (حفظ محلي + سحابي فوري)'
                : 'Online (Local + Cloud Sync)'
              : isAr
                ? 'غير متصل (يُحفظ محلياً للمزامنة)'
                : 'Offline (Queued Locally for Sync)'}
          </span>
        </div>
      </div>

      {cacheResult && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          {isAr
            ? `الفيديوهات المدمجة المخزنة: ${cacheResult.cachedVideos}/${cacheResult.totalBuiltinVideos} · فيديوهاتك المحلية المضافة: ${cacheResult.customLocalVideosCount}`
            : `Built-in videos cached: ${cacheResult.cachedVideos}/${cacheResult.totalBuiltinVideos} · Custom local videos: ${cacheResult.customLocalVideosCount}`}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        {apkAvailable && apkDownloadUrl && !isNativeApp && (
          <a
            href={apkDownloadUrl}
            download="APEX.apk"
            className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحميل ملف APK مباشر (أندرويد)' : 'Download Android APK'}</span>
          </a>
        )}
        <button
          type="button"
          onClick={handlePrepareOffline}
          disabled={preparing}
          className="min-h-[40px] px-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <HardDriveDownload className="w-3.5 h-3.5" />
          <span>
            {preparing
              ? isAr
                ? 'جارٍ التحقق والتخزين...'
                : 'Caching offline assets...'
              : isAr
                ? 'تجهيز وتأكيد الحفظ للعمل دون اتصال'
                : 'Verify & Cache Offline Bundle'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setQrModalOpen(true)}
          className="min-h-[40px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-2 cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{isAr ? 'مشاركة التطبيق ورمز QR' : 'Share App & QR Code'}</span>
        </button>

        {needRefresh && (
          <button
            type="button"
            onClick={applyUpdate}
            className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحديث إلى أحدث إصدار' : 'Update App Now'}</span>
          </button>
        )}
      </div>

      <InstallGuideModal open={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </section>
  );
};

export const OfflineIndicator: React.FC = () => {
  const { language } = useApp();
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-16 lg:bottom-4 start-4 z-50 max-w-xs sm:max-w-sm inline-flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg border border-amber-400/40"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        {language === 'ar'
          ? 'وضع عدم الاتصال — التمارين والجلسات تعمل وتُحفظ محلياً للمزامنة'
          : 'Offline Mode — Workouts, guides & logs active locally'}
      </span>
    </div>
  );
};
