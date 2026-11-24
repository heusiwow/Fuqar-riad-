import { Capacitor } from '@capacitor/core';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface ApexPwaGlobalState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  offlineReady: boolean;
  needRefresh: boolean;
  swRegistered: boolean;
  isNativeApp: boolean;
  updateSW: ((reloadPage?: boolean) => Promise<void>) | null;
}

declare global {
  interface Window {
    __APEX_PWA__?: ApexPwaGlobalState;
  }
}

const isNativeApp = Capacitor.isNativePlatform();

const pwaState: ApexPwaGlobalState = {
  deferredPrompt: null,
  offlineReady: isNativeApp,
  needRefresh: false,
  swRegistered: isNativeApp,
  isNativeApp,
  updateSW: null,
};
window.__APEX_PWA__ = pwaState;

if (!isNativeApp) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    pwaState.deferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('apex-pwa-state'));
  });

  window.addEventListener('appinstalled', () => {
    pwaState.deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('apex-pwa-state'));
  });

  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      pwaState.swRegistered = Boolean(
        registration || ('serviceWorker' in navigator && navigator.serviceWorker.controller)
      );
      if (registration?.active) {
        pwaState.offlineReady = true;
      }
      window.dispatchEvent(new CustomEvent('apex-pwa-state'));
    },
    onOfflineReady() {
      pwaState.offlineReady = true;
      pwaState.swRegistered = true;
      window.dispatchEvent(new CustomEvent('apex-pwa-state'));
    },
    onNeedRefresh() {
      pwaState.needRefresh = true;
      window.dispatchEvent(new CustomEvent('apex-pwa-state'));
    },
  });

  pwaState.updateSW = updateSW;
}

createRoot(document.getElementById('root')!).render(<App />);
