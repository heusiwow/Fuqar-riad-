import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import {
  Dumbbell,
  Globe,
  Moon,
  Sun,
  MailCheck,
  RefreshCw,
  LogOut,
  CalendarRange,
  Activity,
  BarChart3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { auth, googleProvider } from '../../lib/firebase';
import { formatAppError } from '../../utils/errorMessages';
import { PWAInstallButton } from '../common/PWAStatusControls';

export const AuthScreen: React.FC = () => {
  const { firebaseUser, language, theme, setLanguage, setTheme, t, refreshAuthUser, signOutUser } = useApp();
  const isOnline = useOnlineStatus();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setBusy(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code !== 'auth/popup-closed-by-user') {
        setErrorMsg(formatAppError(err, language, t.common.errorGeneric));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        }
        await sendEmailVerification(cred.user);
        setInfoMsg(t.auth.verifySent);
      } else {
        await sendPasswordResetEmail(auth, email.trim());
        setInfoMsg(t.auth.resetSent);
      }
    } catch (err: unknown) {
      setErrorMsg(formatAppError(err, language, t.common.errorGeneric));
    } finally {
      setBusy(false);
    }
  };

  const handleResendVerification = async () => {
    if (!firebaseUser) return;
    setBusy(true);
    setErrorMsg('');
    try {
      await sendEmailVerification(firebaseUser);
      setInfoMsg(t.auth.verifySent);
    } catch (err: unknown) {
      setErrorMsg(formatAppError(err, language, t.common.errorGeneric));
    } finally {
      setBusy(false);
    }
  };

  // Verification gate if user signed up via email/password and hasn't verified yet
  if (firebaseUser && !firebaseUser.emailVerified) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#090A0B] text-neutral-900 dark:text-neutral-100">
        <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight">
            <Dumbbell className="w-5 h-5 text-emerald-500" />
            <span>{t.brand}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              {language === 'en' ? 'العربية' : 'EN'}
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              aria-label={language === 'ar' ? 'تبديل المظهر' : 'Toggle theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <MailCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold">{t.auth.verifyTitle}</h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t.auth.verifyDesc}
              </p>
              <p className="text-xs font-mono text-neutral-500">{firebaseUser.email}</p>
            </div>
            {infoMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400">
                {infoMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={refreshAuthUser}
                disabled={busy}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t.auth.verifyRefresh}
              </button>
              <button
                onClick={handleResendVerification}
                disabled={busy}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-sm font-medium transition-colors"
              >
                {t.auth.verifyResend}
              </button>
              <button
                onClick={signOutUser}
                className="w-full min-h-[44px] px-4 py-2 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.auth.signOut}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const systemSpecs =
    language === 'ar'
      ? [
          {
            icon: CalendarRange,
            title: 'بناء البرامج والتقسيمات التدريبية',
            desc: 'صمّم جداول Push / Pull / Legs أو Upper / Lower أو تقسيمتك الخاصة مع توزيع الأيام الأسبوعي.',
          },
          {
            icon: Activity,
            title: 'تسجيل الجلسة الحية داخل النادي',
            desc: 'قارن أوزانك وتكراراتك مع الجلسة السابقة لحظياً مع مؤقت راحة قابل للتعديل وحفظ تلقائي.',
          },
          {
            icon: BarChart3,
            title: 'الأطلس العضلي وتحليل الحجم التدريبي',
            desc: 'مخططات تشريحية دقيقة للعضلات الأساسية والمساعدة مع تتبع التطور الأسبوعي والأرقام القياسية.',
          },
        ]
      : [
          {
            icon: CalendarRange,
            title: 'Program & Split Architecture',
            desc: 'Structure Push / Pull / Legs, Upper / Lower, or custom training splits across your weekly schedule.',
          },
          {
            icon: Activity,
            title: 'Live Gym Session Execution',
            desc: 'Compare weights and reps side-by-side against your previous session with an adjustable rest timer.',
          },
          {
            icon: BarChart3,
            title: 'Muscular Atlas & Volume Analytics',
            desc: 'Anatomical primary/secondary muscle breakdown paired with longitudinal strength and set-volume tracking.',
          },
        ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#090A0B] text-neutral-900 dark:text-neutral-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight">
          <Dumbbell className="w-5 h-5 text-emerald-500" />
          <span>{t.brand}</span>
        </div>
        <div className="flex items-center gap-2">
          <PWAInstallButton compact />
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            {language === 'en' ? 'العربية' : 'English'}
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label={language === 'ar' ? 'تبديل المظهر' : 'Toggle theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Desktop Workspace Architecture Overview */}
          <div className="hidden lg:block lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {t.brand}
              </p>
              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
                {t.auth.headline}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">
                {t.auth.subhead}
              </p>
            </div>

            <div className="divide-y divide-neutral-200 dark:divide-neutral-800/90 border-y border-neutral-200 dark:border-neutral-800/90">
              {systemSpecs.map((spec) => {
                const Icon = spec.icon;
                return (
                  <div key={spec.title} className="py-4 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h2 className="text-sm font-semibold">{spec.title}</h2>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {spec.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auth Form Panel */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2 lg:hidden">
                <h1 className="text-2xl font-bold tracking-tight">{t.auth.headline}</h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {t.auth.subhead}
                </p>
              </div>
              <div className="hidden lg:block space-y-1">
                <h2 className="text-xl font-bold tracking-tight">
                  {mode === 'login'
                    ? t.auth.tabLogin
                    : mode === 'register'
                      ? t.auth.tabRegister
                      : t.auth.tabReset}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {language === 'ar'
                    ? 'بياناتك التدريبية محفوظة ومزامنة بشكل خاص لحسابك.'
                    : 'Your training logs and programs sync privately to your account.'}
                </p>
              </div>

              {!isOnline && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/35 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {language === 'ar'
                    ? 'الاتصال بالإنترنت غير متاح حالياً. تسجيل الدخول لأول مرة يتطلب شبكة، وبعدها يعمل التطبيق بكامله أوفلاين.'
                    : 'Currently offline. Signing in for the first time requires internet; once signed in, the app works fully offline.'}
                </div>
              )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy}
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
            {t.auth.signInGoogle}
          </button>

          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            <span className="px-3 text-xs text-neutral-500 bg-white dark:bg-[#121417] whitespace-nowrap">
              {t.auth.orEmail}
            </span>
            <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-[#090A0B]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#1A1D22] text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.auth.tabLogin}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#1A1D22] text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.auth.tabRegister}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('reset');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'reset'
                  ? 'bg-white dark:bg-[#1A1D22] text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.auth.tabReset}
            </button>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                  {t.auth.displayName}
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                {t.auth.email}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                  {t.auth.password}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 leading-relaxed">
                {errorMsg}
              </div>
            )}
            {infoMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                {infoMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 font-medium text-sm transition-opacity disabled:opacity-60 cursor-pointer"
            >
              {mode === 'login'
                ? t.auth.submitLogin
                : mode === 'register'
                  ? t.auth.submitRegister
                  : t.auth.submitReset}
            </button>
          </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
