import { Capacitor } from '@capacitor/core';
import { useCallback, useEffect, useState } from 'react';
import { getBuiltinVideoPaths } from '../data/exerciseVideos';
import { BeforeInstallPromptEvent } from '../main';
import { getApiUrl } from '../utils/apiUrl';
import { ensureVideoCachedOffline, getLocalVideosSummary } from '../utils/offlineVideoStore';

const BANNER_DISMISSED_KEY = 'apex_install_banner_dismissed';

export function usePWAInstall() {
  const isNativeApp = Capacitor.isNativePlatform();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    typeof window !== 'undefined' ? window.__APEX_PWA__?.deferredPrompt ?? null : null
  );
  const [isInstalled, setIsInstalled] = useState(isNativeApp);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [swRegistered, setSwRegistered] = useState(() =>
    typeof window !== 'undefined' ? Boolean(window.__APEX_PWA__?.swRegistered) : false
  );
  const [offlineReady, setOfflineReady] = useState(() =>
    typeof window !== 'undefined' ? Boolean(window.__APEX_PWA__?.offlineReady) : false
  );
  const [needRefresh, setNeedRefresh] = useState(() =>
    typeof window !== 'undefined' ? Boolean(window.__APEX_PWA__?.needRefresh) : false
  );
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem(BANNER_DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const envApkUrl = (import.meta.env.VITE_ANDROID_APK_URL as string | undefined)?.trim() || '';
  const [apkUrl, setApkUrl] = useState<string | null>(envApkUrl || null);
  const [apkSizeBytes, setApkSizeBytes] = useState<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const checkStandalone = () => {
      const standalone =
        isNativeApp ||
        mediaQuery.matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
    };
    checkStandalone();

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(iosDevice);
    setIsAndroid(/android/.test(ua));

    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    const syncFromGlobal = () => {
      const state = window.__APEX_PWA__;
      if (!state) return;
      setDeferredPrompt(state.deferredPrompt);
      setSwRegistered(state.swRegistered);
      setOfflineReady(state.offlineReady);
      setNeedRefresh(state.needRefresh);
    };
    syncFromGlobal();

    if (!isNativeApp && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          if (reg.active) {
            if (window.__APEX_PWA__) {
              window.__APEX_PWA__.swRegistered = true;
              window.__APEX_PWA__.offlineReady = true;
            }
            setSwRegistered(true);
            setOfflineReady(true);
          }
        })
        .catch(() => {
          // Ignore SW readiness probe errors
        });
    }

    // Silently pre-warm built-in offline exercise videos once per browser session when online
    if (!isNativeApp && navigator.onLine) {
      try {
        const warmedKey = 'apex_offline_media_warmed_v1';
        if (!sessionStorage.getItem(warmedKey)) {
          sessionStorage.setItem(warmedKey, '1');
          const paths = getBuiltinVideoPaths();
          for (const src of paths) {
            ensureVideoCachedOffline(src).catch(() => {
              // Silent background pre-warm
            });
          }
        }
      } catch {
        // Ignore storage errors
      }

      fetch(getApiUrl('/api/apk-status'))
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { available?: boolean; url?: string | null; sizeBytes?: number | null } | null) => {
          if (data?.available && data.url) {
            setApkUrl(data.url);
            setApkSizeBytes(data.sizeBytes ?? null);
          }
        })
        .catch(() => {
          // Ignore when offline
        });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      if (window.__APEX_PWA__) {
        window.__APEX_PWA__.deferredPrompt = promptEvent;
      }
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (window.__APEX_PWA__) {
        window.__APEX_PWA__.deferredPrompt = null;
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('apex-pwa-state', syncFromGlobal);
    mediaQuery.addEventListener('change', checkStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('apex-pwa-state', syncFromGlobal);
      mediaQuery.removeEventListener('change', checkStandalone);
    };
  }, [isNativeApp]);

  const install = useCallback(async () => {
    const activePrompt = deferredPrompt ?? window.__APEX_PWA__?.deferredPrompt ?? null;
    if (!activePrompt) return false;
    await activePrompt.prompt();
    const { outcome } = await activePrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (window.__APEX_PWA__) {
        window.__APEX_PWA__.deferredPrompt = null;
      }
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, '1');
    } catch {
      // Ignore storage errors
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    const updater = window.__APEX_PWA__?.updateSW;
    if (updater) {
      await updater(true);
    } else {
      window.location.reload();
    }
  }, []);

  const prepareOfflineBundle = useCallback(async () => {
    const videoPaths = getBuiltinVideoPaths();
    let cachedVideos = 0;
    for (const src of videoPaths) {
      const ok = await ensureVideoCachedOffline(src);
      if (ok) cachedVideos += 1;
    }
    const localSummary = await getLocalVideosSummary();
    return {
      cachedVideos,
      totalBuiltinVideos: videoPaths.length,
      customLocalVideosCount: localSummary.count,
      customLocalSizeBytes: localSummary.totalBytes,
    };
  }, []);

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isNativeApp,
    isIOS,
    isAndroid,
    isInIframe,
    swRegistered,
    offlineReady,
    needRefresh,
    bannerDismissed,
    apkAvailable: Boolean(apkUrl),
    apkDownloadUrl: apkUrl,
    apkSizeBytes,
    dismissBanner,
    install,
    applyUpdate,
    prepareOfflineBundle,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
