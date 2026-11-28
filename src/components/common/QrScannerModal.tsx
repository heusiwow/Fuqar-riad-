import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, ImagePlus, QrCode, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { claimCoachInviteCode, extractJoinCodeFromInput } from '../../services/firestoreService';
import { formatAppError } from '../../utils/errorMessages';

interface QrScannerModalProps {
  onClose: () => void;
  onSuccess?: (coachName: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ onClose, onSuccess }) => {
  const { firebaseUser, profile, language, t, clearPendingJoinCode, showToast } = useApp();
  const isAr = language === 'ar';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const claimingRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stopCamera = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleDetectedRaw = async (rawValue: string) => {
    if (claimingRef.current || !firebaseUser) return;
    const extracted = extractJoinCodeFromInput(rawValue);
    if (!extracted || extracted.length < 4) return;

    claimingRef.current = true;
    setSubmitting(true);
    stopCamera();
    try {
      const link = await claimCoachInviteCode(
        firebaseUser.uid,
        profile?.displayName || (isAr ? 'رياضي' : 'Athlete'),
        extracted
      );
      clearPendingJoinCode();
      showToast(
        isAr
          ? `تم التسجيل بنجاح مع الكابتن ${link.coachName}`
          : `Registered directly with Coach ${link.coachName}`,
        'success'
      );
      onSuccess?.(link.coachName);
      onClose();
    } catch (err) {
      claimingRef.current = false;
      setSubmitting(false);
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        isAr
          ? 'الكاميرا غير مدعومة في هذا المتصفح، يمكنك رفع صورة الباركود أو إدخال الرمز يدوياً.'
          : 'Camera is unavailable here. You can upload a QR image or enter the code manually.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setCameraActive(true);

      const scanFrame = () => {
        if (!videoRef.current || !canvasRef.current || claimingRef.current) return;
        const v = videoRef.current;
        if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
          const canvas = canvasRef.current;
          canvas.width = v.videoWidth;
          canvas.height = v.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });
            if (result?.data) {
              void handleDetectedRaw(result.data);
              return;
            }
          }
        }
        rafRef.current = requestAnimationFrame(scanFrame);
      };
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setCameraError(
        isAr
          ? 'تعذّر فتح الكاميرا. امنح الإذن للكاميرا أو استخدم خيار اختيار صورة الباركود أو الإدخال اليدوي.'
          : 'Could not access the camera. Grant permission, upload a QR image, or enter the code manually.'
      );
    }
  };

  useEffect(() => {
    void startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = url;
      });
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });
      if (result?.data) {
        await handleDetectedRaw(result.data);
      } else {
        showToast(
          isAr ? 'لم يتم العثور على باركود واضح في الصورة' : 'No valid QR code found in that image',
          'error'
        );
      }
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await handleDetectedRaw(manualCode.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => {
        stopCamera();
        onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/12 text-emerald-500 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isAr ? 'مسح باركود الكابتن' : 'Scan Coach QR Code'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {isAr
                  ? 'وجّه الكاميرا نحو باركود القاعة للتسجيل المباشر'
                  : 'Point your camera at the coach’s QR poster to join instantly'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Camera Viewfinder */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-[290px] w-full flex items-center justify-center border border-neutral-800">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
            </div>
          )}

          {!cameraActive && (
            <div className="p-5 text-center space-y-3 text-neutral-300">
              <Camera className="w-10 h-10 mx-auto text-emerald-400 opacity-80" />
              <p className="text-xs leading-relaxed">
                {cameraError || (isAr ? 'جاري تشغيل الكاميرا...' : 'Starting camera...')}
              </p>
              {cameraError && (
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className="min-h-[38px] px-3.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isAr ? 'إعادة تشغيل الكاميرا' : 'Retry Camera'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Upload QR Image Alternative */}
        <label className="w-full min-h-[42px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
          <ImagePlus className="w-4 h-4 text-emerald-500" />
          <span>{isAr ? 'أو اختر صورة الباركود من الجهاز' : 'Or pick QR image from gallery'}</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>

        {/* Manual Code Input Fallback */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder={isAr ? 'أو أدخل رمز الكابتن (مثال: CAP-...)' : 'Or type code (e.g. CAP-...)'}
            className="flex-1 min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs uppercase"
          />
          <button
            type="submit"
            disabled={submitting || !manualCode.trim()}
            className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            {submitting ? t.common.loading : isAr ? 'تسجيل' : 'Join'}
          </button>
        </form>
      </div>
    </div>
  );
};
