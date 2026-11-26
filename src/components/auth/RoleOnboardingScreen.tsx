import React, { useState } from 'react';
import { Check, Dumbbell, Globe, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RoleOnboardingScreen: React.FC = () => {
  const { profile, language, setLanguage, t, completeRoleOnboarding } = useApp();

  const [selectedRole, setSelectedRole] = useState<'athlete' | 'coach'>(
    profile?.role === 'coach' ? 'coach' : 'athlete'
  );
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await completeRoleOnboarding(selectedRole, displayName.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#090A0B] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <Dumbbell className="w-5 h-5 text-emerald-500" />
          <span className="font-display font-bold text-lg tracking-tight">{t.brand}</span>
        </div>
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121417] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      <main className="w-full max-w-2xl mx-auto my-6">
        <form
          onSubmit={handleConfirm}
          className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t.apex.roleOnboardingTitle}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t.apex.roleOnboardingSubtitle}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {t.apex.roleOnboardingNameLabel}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={
                language === 'ar' ? 'اكتب اسمك كما سيظهر في الحساب' : 'Enter your full name'
              }
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedRole('athlete')}
              className={`text-start p-5 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between gap-4 ${
                selectedRole === 'athlete'
                  ? 'border-emerald-500 bg-emerald-500/8'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#090A0B] hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedRole === 'athlete'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-emerald-500'
                  }`}
                >
                  <Dumbbell className="w-5 h-5" />
                </div>
                {selectedRole === 'athlete' && (
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold">{t.apex.roleOnboardingAthleteTitle}</h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {t.apex.roleOnboardingAthleteDesc}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('coach')}
              className={`text-start p-5 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between gap-4 ${
                selectedRole === 'coach'
                  ? 'border-emerald-500 bg-emerald-500/8'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#090A0B] hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedRole === 'coach'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-emerald-500'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </div>
                {selectedRole === 'coach' && (
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold">{t.apex.roleOnboardingCoachTitle}</h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {t.apex.roleOnboardingCoachDesc}
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{t.apex.roleOnboardingNote}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer transition-colors"
          >
            {submitting ? t.common.loading : t.apex.roleOnboardingConfirm}
          </button>
        </form>
      </main>

      <div className="h-4" />
    </div>
  );
};
