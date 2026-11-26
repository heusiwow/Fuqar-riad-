import React, { useEffect, useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  BellPlus,
  Copy,
  Globe,
  KeyRound,
  Link2,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  Unlink,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DIFFICULTY_LABELS, GOAL_LABELS, SPLIT_LABELS, tLabel } from '../../i18n/translations';
import { auth } from '../../lib/firebase';
import {
  claimCoachInviteCode,
  createReminder,
  generateSafeId,
  unlinkCoachAccount,
  updateUserProfileSettings,
} from '../../services/firestoreService';
import {
  AgeGroup,
  DifficultyLevel,
  NotificationSettings,
  SplitType,
  TrainingGoal,
} from '../../types/ironlog';
import { getLocalDateKey, toDisplayWeight, toStorageKg } from '../../utils/calculations';
import { formatAppError } from '../../utils/errorMessages';
import { OfflineAppCard } from '../common/PWAStatusControls';

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  scheduledWorkout: true,
  programSchedule: true,
  personalRecord: true,
  workoutCompletion: true,
  coachFeedback: true,
  programChange: true,
  goalMilestone: true,
  missedWorkout: true,
  teamAnnouncement: true,
  checkinReminder: true,
};

export const ProfileSettingsView: React.FC = () => {
  const {
    firebaseUser,
    isLocalDeviceMode,
    profile,
    userRole,
    isAdmin,
    switchRole,
    athleteCoachLink,
    pendingJoinCode,
    clearPendingJoinCode,
    language,
    theme,
    unit,
    t,
    workouts,
    setLanguage,
    setTheme,
    setUnit,
    signOutUser,
    showToast,
  } = useApp();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [heightCm, setHeightCm] = useState(profile?.heightCm ? String(profile.heightCm) : '');
  const [weightInput, setWeightInput] = useState(
    profile?.weightKg ? String(toDisplayWeight(profile.weightKg, unit)) : ''
  );
  const [experienceLevel, setExperienceLevel] = useState<DifficultyLevel>(
    profile?.experienceLevel || 'intermediate'
  );
  const [trainingAgeMonths, setTrainingAgeMonths] = useState(
    profile?.trainingAgeMonths !== undefined ? String(profile.trainingAgeMonths) : ''
  );
  const [weeklyFrequency, setWeeklyFrequency] = useState(
    profile?.weeklyFrequency ? String(profile.weeklyFrequency) : '4'
  );
  const [trainingGoal, setTrainingGoal] = useState<TrainingGoal>(
    profile?.trainingGoal || 'hypertrophy'
  );
  const [preferredSplit, setPreferredSplit] = useState<SplitType>(
    profile?.preferredSplit || 'push_pull_legs'
  );
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(profile?.ageGroup || 'adult');
  const [personalNotes, setPersonalNotes] = useState(profile?.personalNotes || '');
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    ...DEFAULT_NOTIFICATIONS,
    ...(profile?.notificationSettings || {}),
  });
  const [saving, setSaving] = useState(false);

  // Coach Invite Code Claiming & Disconnect
  const [inviteCode, setInviteCode] = useState(() => pendingJoinCode || '');
  const [claimingCode, setClaimingCode] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => {
    if (pendingJoinCode && !inviteCode) {
      setInviteCode(pendingJoinCode);
    }
  }, [pendingJoinCode]);

  // Scheduled workout reminder state
  const [remWorkoutTitle, setRemWorkoutTitle] = useState('');
  const [remDateTime, setRemDateTime] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const hh = String(tomorrow.getHours()).padStart(2, '0');
    return `${getLocalDateKey(tomorrow)}T${hh}:00`;
  });
  const [addingReminder, setAddingReminder] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName || '');
    setHeightCm(profile.heightCm ? String(profile.heightCm) : '');
    setWeightInput(profile.weightKg ? String(toDisplayWeight(profile.weightKg, profile.unit)) : '');
    setExperienceLevel(profile.experienceLevel || 'intermediate');
    setTrainingAgeMonths(
      profile.trainingAgeMonths !== undefined ? String(profile.trainingAgeMonths) : ''
    );
    setWeeklyFrequency(profile.weeklyFrequency ? String(profile.weeklyFrequency) : '4');
    setTrainingGoal(profile.trainingGoal || 'hypertrophy');
    setPreferredSplit(profile.preferredSplit || 'push_pull_legs');
    setAgeGroup(profile.ageGroup || 'adult');
    setPersonalNotes(profile.personalNotes || '');
    setNotifSettings({
      ...DEFAULT_NOTIFICATIONS,
      ...(profile.notificationSettings || {}),
    });
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await updateUserProfileSettings(firebaseUser.uid, {
        displayName: displayName.trim() || (language === 'ar' ? 'رياضي' : 'Athlete'),
        ageGroup,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightInput ? toStorageKg(Number(weightInput), unit) : undefined,
        experienceLevel,
        trainingAgeMonths: trainingAgeMonths ? Number(trainingAgeMonths) : undefined,
        weeklyFrequency: weeklyFrequency ? Number(weeklyFrequency) : 4,
        trainingGoal,
        preferredSplit,
        personalNotes,
        notificationSettings: notifSettings,
      });
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClaimCoachCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !inviteCode.trim()) return;
    setClaimingCode(true);
    try {
      await claimCoachInviteCode(
        firebaseUser.uid,
        profile?.displayName || firebaseUser.displayName || (language === 'ar' ? 'رياضي' : 'Athlete'),
        inviteCode
      );
      setInviteCode('');
      clearPendingJoinCode();
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setClaimingCode(false);
    }
  };

  const handleUnlinkCoach = async () => {
    if (!firebaseUser) return;
    setUnlinking(true);
    try {
      await unlinkCoachAccount(firebaseUser.uid, athleteCoachLink?.id);
      setConfirmUnlink(false);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setUnlinking(false);
    }
  };

  const handleCopyUid = () => {
    if (!firebaseUser?.uid) return;
    try {
      navigator.clipboard?.writeText(firebaseUser.uid);
      showToast(t.common.savedSuccess);
    } catch {
      // ignore
    }
  };

  const handlePasswordReset = async () => {
    if (!firebaseUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, firebaseUser.email);
      showToast(t.auth.resetSent);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleAddScheduledReminder = async () => {
    if (!firebaseUser) return;
    const focus = remWorkoutTitle.trim() || (language === 'ar' ? 'جلسة مقاومة' : 'Training Session');
    const formattedDate = remDateTime ? remDateTime.replace('T', ' ') : getLocalDateKey();
    setAddingReminder(true);
    try {
      await createReminder(firebaseUser.uid, {
        id: generateSafeId('schedrem'),
        type: 'scheduled_workout',
        titleEn: `Scheduled: ${focus}`.slice(0, 120),
        titleAr: `تذكير تمرين: ${focus}`.slice(0, 120),
        messageEn: `Planned for ${formattedDate}`.slice(0, 300),
        messageAr: `موعد التمرين المجدول: ${formattedDate}`.slice(0, 300),
        read: false,
      });
      setRemWorkoutTitle('');
      showToast(t.profile.reminderCreated);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setAddingReminder(false);
    }
  };

  const handleRequestBrowserNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        showToast(t.common.savedSuccess);
      }
    } catch {
      // Ignore unsupported browser environment
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.profile.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{t.profile.subtitle}</p>
      </div>

      {/* Quick App Preferences */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-base font-semibold">{t.profile.preferences}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {t.profile.language}
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-[#090A0B]">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 rounded-lg text-xs font-medium cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-[#1A1D22] shadow-sm'
                    : 'text-neutral-500'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`py-2 rounded-lg text-xs font-medium cursor-pointer ${
                  language === 'ar'
                    ? 'bg-white dark:bg-[#1A1D22] shadow-sm'
                    : 'text-neutral-500'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-500">{t.profile.theme}</label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-[#090A0B]">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-[#1A1D22] shadow-sm'
                    : 'text-neutral-500'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                {t.profile.darkMode}
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white dark:bg-[#1A1D22] shadow-sm'
                    : 'text-neutral-500'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                {t.profile.lightMode}
              </button>
            </div>
          </div>

          {/* Unit */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-500">{t.profile.unit}</label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-[#090A0B]">
              <button
                type="button"
                onClick={() => setUnit('kg')}
                className={`py-2 rounded-lg text-xs font-mono font-medium cursor-pointer ${
                  unit === 'kg'
                    ? 'bg-white dark:bg-[#1A1D22] shadow-sm'
                    : 'text-neutral-500'
                }`}
              >
                {language === 'ar' ? 'كجم (KG)' : 'KG'}
              </button>
              <button
                type="button"
                onClick={() => setUnit('lb')}
                className={`py-2 rounded-lg text-xs font-mono font-medium cursor-pointer ${
                  unit === 'lb'
                    ? 'bg-white dark:bg-[#1A1D22] shadow-sm'
                    : 'text-neutral-500'
                }`}
              >
                {language === 'ar' ? 'رطل (LB)' : 'LB'}
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Role Switcher */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              {t.apex.roleLabel}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {isAdmin
                ? language === 'ar'
                  ? 'حسابك يملك صلاحيات مدير النادي والمدرب والرياضي.'
                  : 'Your account includes Gym Admin, Coach, and Athlete capabilities.'
                : language === 'ar'
                  ? 'بدّل بين واجهة الرياضي ولوحة تحكم المدرب لإدارة المتدربين.'
                  : 'Switch between your personal Athlete workspace and Coach Control Center.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-[#090A0B] shrink-0 min-w-[220px]">
            <button
              type="button"
              onClick={() => switchRole('athlete')}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-medium cursor-pointer ${
                userRole === 'athlete'
                  ? 'bg-white dark:bg-[#1A1D22] shadow-sm text-emerald-600 dark:text-emerald-400'
                  : 'text-neutral-500'
              }`}
            >
              {t.apex.roleAthlete}
            </button>
            <button
              type="button"
              onClick={() => switchRole('coach')}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-medium cursor-pointer ${
                userRole === 'coach' || userRole === 'gym_admin'
                  ? 'bg-white dark:bg-[#1A1D22] shadow-sm text-emerald-600 dark:text-emerald-400'
                  : 'text-neutral-500'
              }`}
            >
              {isAdmin && userRole === 'gym_admin' ? t.apex.roleAdmin : t.apex.roleCoach}
            </button>
          </div>
        </div>
      </section>

      {/* Install & Offline Mode Card */}
      <OfflineAppCard />

      {/* Coach Connection Card */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Link2 className="w-4 h-4 text-emerald-500" />
            {t.apex.coachInviteTitle}
          </h2>
          {firebaseUser?.uid && (
            <button
              type="button"
              onClick={handleCopyUid}
              className="min-h-[34px] px-3 rounded-lg bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono inline-flex items-center gap-1.5 cursor-pointer"
              title={t.apex.athleteIdLabel}
            >
              <span className="text-neutral-500 font-sans">{t.apex.athleteIdLabel}:</span>
              <span className="truncate max-w-[110px]">{firebaseUser.uid}</span>
              <Copy className="w-3 h-3 text-emerald-500 shrink-0" />
            </button>
          )}
        </div>

        {athleteCoachLink ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t.apex.linkedCoachLabel}
                </p>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {athleteCoachLink.coachName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  {athleteCoachLink.inviteCode}
                </span>
                {!confirmUnlink && (
                  <button
                    type="button"
                    onClick={() => setConfirmUnlink(true)}
                    className="min-h-[36px] px-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    {t.apex.unlinkCoachBtn}
                  </button>
                )}
              </div>
            </div>

            {confirmUnlink && (
              <div className="p-3.5 rounded-xl bg-red-500/8 border border-red-500/30 space-y-2.5">
                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                  {t.apex.unlinkConfirmPrompt}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={unlinking}
                    onClick={handleUnlinkCoach}
                    className="min-h-[36px] px-3.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    {unlinking ? t.common.loading : t.apex.confirmDisconnect}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmUnlink(false)}
                    className="min-h-[36px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleClaimCoachCode} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={t.apex.coachInvitePlaceholder}
              className="flex-1 min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm uppercase"
            />
            <button
              type="submit"
              disabled={claimingCode || !inviteCode.trim()}
              className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shrink-0"
            >
              {claimingCode ? t.common.loading : t.apex.joinCoachBtn}
            </button>
          </form>
        )}
      </section>

      {/* Profile & Notifications Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-semibold">{t.profile.personalInfo}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t.profile.displayName}</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t.profile.height}</label>
              <input
                type="number"
                min={50}
                max={280}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">
                {t.profile.weight} ({unit === 'lb' ? t.common.lb : t.common.kg})
              </label>
              <input
                type="number"
                step="0.1"
                min={20}
                max={600}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t.profile.experience}</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as DifficultyLevel)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              >
                {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((l) => (
                  <option key={l} value={l}>
                    {tLabel(DIFFICULTY_LABELS[l], language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t.profile.trainingAge}</label>
              <input
                type="number"
                min={0}
                max={960}
                value={trainingAgeMonths}
                onChange={(e) => setTrainingAgeMonths(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t.profile.weeklyFreq}</label>
              <input
                type="number"
                min={1}
                max={14}
                value={weeklyFrequency}
                onChange={(e) => setWeeklyFrequency(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t.profile.goal}</label>
              <select
                value={trainingGoal}
                onChange={(e) => setTrainingGoal(e.target.value as TrainingGoal)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              >
                {(Object.keys(GOAL_LABELS) as TrainingGoal[]).map((g) => (
                  <option key={g} value={g}>
                    {tLabel(GOAL_LABELS[g], language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t.profile.preferredSplit}</label>
              <select
                value={preferredSplit}
                onChange={(e) => setPreferredSplit(e.target.value as SplitType)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              >
                {(Object.keys(SPLIT_LABELS) as SplitType[]).map((s) => (
                  <option key={s} value={s}>
                    {tLabel(SPLIT_LABELS[s], language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {t.apex.ageGroupLabel}
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              >
                <option value="adult">{t.apex.ageAdult}</option>
                <option value="youth">{t.apex.ageYouth}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">{t.profile.personalNotes}</label>
            <textarea
              rows={3}
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
            />
          </div>
        </section>

        {/* Notifications & Reminders */}
        <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">{t.profile.notificationsTitle}</h2>
            {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestBrowserNotifications}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {t.profile.enableBrowserNotifs}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                ['scheduledWorkout', t.profile.notifScheduled],
                ['programSchedule', t.profile.notifProgram],
                ['personalRecord', t.profile.notifPR],
                ['workoutCompletion', t.profile.notifCompletion],
                ['coachFeedback', language === 'ar' ? 'تقييم وملاحظات المدرب' : 'Coach Feedback Alerts'],
                ['programChange', language === 'ar' ? 'تعيين أو تحديث البرامج' : 'Program Assignment Updates'],
                ['goalMilestone', language === 'ar' ? 'تحقيق الأهداف والمحطات' : 'Goal Milestone Alerts'],
                ['missedWorkout', language === 'ar' ? 'تنبيه التمارين الفائتة' : 'Missed Workout Alerts'],
                ['teamAnnouncement', language === 'ar' ? 'إعلانات الفريق والمدرب' : 'Team & Coach Announcements'],
                ['checkinReminder', language === 'ar' ? 'تذكيرات المتابعة الدورية' : 'Check-in Reminders'],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 cursor-pointer"
              >
                <span className="text-xs font-medium">{label}</span>
                <input
                  type="checkbox"
                  checked={notifSettings[key] ?? true}
                  onChange={(e) =>
                    setNotifSettings((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="w-4 h-4 accent-emerald-500"
                />
              </label>
            ))}
          </div>

          {notifSettings.scheduledWorkout && (
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <BellPlus className="w-3.5 h-3.5 text-emerald-500" />
                {t.profile.createScheduledReminder}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">
                    {t.profile.reminderWorkoutLabel}
                  </label>
                  <input
                    type="text"
                    list="ironlog-workout-titles"
                    value={remWorkoutTitle}
                    onChange={(e) => setRemWorkoutTitle(e.target.value)}
                    placeholder={workouts[0]?.name || (language === 'ar' ? 'يوم الدفع' : 'Push Day')}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                  <datalist id="ironlog-workout-titles">
                    {workouts.map((w) => (
                      <option key={w.id} value={w.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">
                    {t.profile.reminderDateLabel}
                  </label>
                  <input
                    type="datetime-local"
                    value={remDateTime}
                    onChange={(e) => setRemDateTime(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                  />
                </div>
                <button
                  type="button"
                  disabled={addingReminder}
                  onClick={handleAddScheduledReminder}
                  className="min-h-[40px] px-4 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold cursor-pointer"
                >
                  {addingReminder ? t.common.loading : t.profile.addReminderBtn}
                </button>
              </div>
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
        >
          {t.profile.saveProfile}
        </button>
      </form>

      {/* Account & Security */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{t.profile.accountSecurity}</h2>
            <p className="text-xs font-mono text-neutral-500 mt-0.5">
              {isLocalDeviceMode
                ? language === 'ar'
                  ? 'حساب محلي على هذا الجهاز (دون اتصال بالإنترنت)'
                  : 'On-Device Offline Profile'
                : firebaseUser?.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {!isLocalDeviceMode && firebaseUser?.email && (
              <button
                type="button"
                onClick={handlePasswordReset}
                className="min-h-[40px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {t.profile.sendPasswordReset}
              </button>
            )}
            <button
              type="button"
              onClick={signOutUser}
              className="min-h-[40px] px-4 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {isLocalDeviceMode
                ? language === 'ar'
                  ? 'الخروج / تبديل إلى حساب سحابي'
                  : 'Exit / Switch to Cloud Account'
                : t.auth.signOut}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
