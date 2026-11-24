import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarRange,
  ClipboardList,
  Compass,
  Dumbbell,
  Globe,
  History,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Play,
  Ruler,
  Search,
  Sparkles,
  User,
  Users,
  X,
  Check,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EQUIPMENT_LABELS, MUSCLE_LABELS, tLabel } from '../../i18n/translations';
import { deleteReminder, markReminderRead } from '../../services/firestoreService';
import { AppSection } from '../../types/ironlog';
import { OfflineIndicator, PWAInstallButton, SmartInstallBanner } from '../common/PWAStatusControls';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    firebaseUser,
    profile,
    language,
    setLanguage,
    unit,
    t,
    activeSection,
    setActiveSection,
    allExercises,
    workouts,
    activeSession,
    openExerciseDetail,
    startWorkoutFromTemplate,
    reminders,
    coachMessages,
    isCoach,
    isAdmin,
    toasts,
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const unreadCount = useMemo(() => reminders.filter((r) => !r.read).length, [reminders]);
  const unreadMessagesCount = useMemo(
    () => coachMessages.filter((m) => !m.read && m.senderId !== firebaseUser?.uid).length,
    [coachMessages, firebaseUser?.uid]
  );

  const navItems: {
    id: AppSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'exercises', label: t.nav.exercises, icon: BookOpen },
    { id: 'philosophies', label: t.nav.philosophies, icon: Compass },
    { id: 'workouts', label: t.nav.workouts, icon: ClipboardList },
    { id: 'programs', label: t.nav.programs, icon: CalendarRange },
    { id: 'live', label: t.nav.live, icon: Play },
    { id: 'history', label: t.nav.history, icon: History },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { id: 'progress', label: t.nav.progress, icon: Ruler },
    { id: 'ai', label: t.nav.ai, icon: Sparkles },
    { id: 'messaging', label: t.nav.messaging, icon: MessageSquare, badge: unreadMessagesCount },
    ...(isCoach ? [{ id: 'coach' as AppSection, label: t.nav.coach, icon: Users }] : []),
    ...(isAdmin ? [{ id: 'admin' as AppSection, label: t.nav.admin, icon: Building2 }] : []),
    { id: 'profile', label: t.nav.profile, icon: User },
  ];

  const mobilePrimaryTabs: AppSection[] = ['dashboard', 'exercises', 'live', 'programs'];
  const mobileSecondaryTabs: AppSection[] = [
    'philosophies',
    'workouts',
    'history',
    'analytics',
    'progress',
    'ai',
    'messaging',
    ...(isCoach ? (['coach'] as AppSection[]) : []),
    ...(isAdmin ? (['admin'] as AppSection[]) : []),
    'profile',
  ];

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { exercises: allExercises.slice(0, 6), workouts: workouts.slice(0, 4) };
    const matchedExercises = allExercises
      .filter(
        (ex) =>
          ex.nameEn.toLowerCase().includes(q) ||
          ex.nameAr.toLowerCase().includes(q) ||
          ex.primaryMuscles.some(
            (m) => MUSCLE_LABELS[m].en.toLowerCase().includes(q) || MUSCLE_LABELS[m].ar.includes(q)
          ) ||
          EQUIPMENT_LABELS[ex.equipment].en.toLowerCase().includes(q) ||
          EQUIPMENT_LABELS[ex.equipment].ar.includes(q)
      )
      .slice(0, 8);
    const matchedWorkouts = workouts
      .filter((w) => w.name.toLowerCase().includes(q) || (w.description || '').toLowerCase().includes(q))
      .slice(0, 6);
    return { exercises: matchedExercises, workouts: matchedWorkouts };
  }, [searchQuery, allExercises, workouts]);

  const handleMarkAllRead = async () => {
    if (!firebaseUser) return;
    const unread = reminders.filter((r) => !r.read);
    await Promise.all(unread.map((r) => markReminderRead(firebaseUser.uid, r.id)));
  };

  const currentNavLabel = navItems.find((n) => n.id === activeSection)?.label || t.brand;

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-[#090A0B] text-neutral-900 dark:text-neutral-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-e border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#101215] sticky top-0 h-screen">
        <div className="h-16 px-5 flex items-center gap-2.5 border-b border-neutral-200 dark:border-neutral-800/80">
          <Dumbbell className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-display font-bold text-lg tracking-tight whitespace-nowrap">
            {t.brand}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const isLiveRunning = item.id === 'live' && Boolean(activeSession);
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full min-h-[42px] px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <span className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-500' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </span>
                {isLiveRunning ? (
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                    {language === 'ar' ? 'نشط' : 'LIVE'}
                  </span>
                ) : item.badge && item.badge > 0 ? (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800/80 space-y-2">
          <PWAInstallButton />
          <button
            onClick={() => setActiveSection('profile')}
            className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center gap-3 text-start transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-semibold text-sm shrink-0">
              {(profile?.displayName || (language === 'ar' ? 'ر' : 'A')).slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {profile?.displayName || (language === 'ar' ? 'رياضي' : 'Athlete')}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {unit === 'lb' ? t.common.lb : t.common.kg} · {language === 'ar' ? 'العربية' : 'EN'}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Top Bar (Compact 52px on mobile, 64px on desktop) */}
        <header className="sticky top-0 z-30 h-13 lg:h-16 px-4 lg:px-8 border-b border-neutral-200 dark:border-neutral-800/80 bg-white/95 dark:bg-[#090A0B]/95 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Dumbbell className="w-4 h-4 text-emerald-500 lg:hidden shrink-0" />
            <h2 className="text-sm lg:text-base font-semibold truncate">{currentNavLabel}</h2>
          </div>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2.5 min-h-[38px] w-64 md:w-80 px-3.5 rounded-xl bg-neutral-100 dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.common.search}</span>
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="lg:hidden">
              <PWAInstallButton compact />
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="sm:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              aria-label={t.common.search}
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="min-h-[38px] px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              aria-label={t.profile.language}
              title={t.profile.language}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            <button
              type="button"
              onClick={() => setRemindersOpen(true)}
              className="relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
              aria-label={t.common.reminders}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 end-1.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('live')}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{activeSession ? t.dashboard.resumeSession : t.nav.live}</span>
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
          <SmartInstallBanner />
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Max 56px height to keep sticky footprint compact) */}
      <nav
        aria-label={language === 'ar' ? 'التنقل على الجوال' : 'Mobile navigation'}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-[#101215]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-5 items-center"
      >
        {mobilePrimaryTabs.map((tabId) => {
          const item = navItems.find((n) => n.id === tabId)!;
          const Icon = item.icon;
          const isActive = activeSection === tabId;
          return (
            <button
              key={tabId}
              onClick={() => setActiveSection(tabId)}
              className={`h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[68px]">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMoreMenuOpen(true)}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            mobileSecondaryTabs.includes(activeSection)
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>{t.nav.more}</span>
        </button>
      </nav>

      {/* Mobile More Drawer */}
      {moreMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end">
          <div className="w-full bg-white dark:bg-[#121417] border-t border-neutral-200 dark:border-neutral-800 rounded-t-3xl p-5 space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <span className="font-semibold text-sm">{t.nav.more}</span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {mobileSecondaryTabs.map((tabId) => {
                const item = navItems.find((n) => n.id === tabId);
                if (!item) return null;
                const Icon = item.icon;
                const isActive = activeSection === tabId;
                return (
                  <button
                    key={tabId}
                    onClick={() => {
                      setActiveSection(tabId);
                      setMoreMenuOpen(false);
                    }}
                    className={`w-full min-h-[48px] px-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium ${
                      isActive
                        ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && item.badge > 0 ? (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.common.searchPlaceholder}
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
              {/* Exercises Results */}
              <div>
                <p className="px-2 pb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {t.nav.exercises}
                </p>
                {searchResults.exercises.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-neutral-400">{t.common.noResults}</p>
                ) : (
                  <div className="space-y-1">
                    {searchResults.exercises.map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => {
                          openExerciseDetail(ex.id);
                          setSearchOpen(false);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center justify-between text-start gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {language === 'ar' ? ex.nameAr : ex.nameEn}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {ex.primaryMuscles.map((m) => tLabel(MUSCLE_LABELS[m], language)).join(', ')} ·{' '}
                            {tLabel(EQUIPMENT_LABELS[ex.equipment], language)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Workouts Results */}
              {searchResults.workouts.length > 0 && (
                <div>
                  <p className="px-2 pb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {t.nav.workouts}
                  </p>
                  <div className="space-y-1">
                    {searchResults.workouts.map((w) => (
                      <div
                        key={w.id}
                        className="px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center justify-between gap-3"
                      >
                        <button
                          onClick={() => {
                            setActiveSection('workouts');
                            setSearchOpen(false);
                          }}
                          className="min-w-0 flex-1 text-start"
                        >
                          <p className="text-sm font-medium truncate">{w.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {w.exercises.length} {t.workouts.exercisesInWorkout}
                          </p>
                        </button>
                        <button
                          onClick={() => {
                            startWorkoutFromTemplate(w);
                            setSearchOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shrink-0"
                        >
                          {t.common.start}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reminders Drawer */}
      {remindersOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
          onClick={() => setRemindersOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#121417] border-s border-neutral-200 dark:border-neutral-800 h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-base">{t.common.reminders}</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1"
                  >
                    {t.common.markAllRead}
                  </button>
                )}
                <button
                  onClick={() => setRemindersOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {reminders.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-12">
                  {t.common.noReminders}
                </p>
              ) : (
                reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      rem.read
                        ? 'bg-neutral-50 dark:bg-[#090A0B] border-neutral-200 dark:border-neutral-800/80 opacity-80'
                        : 'bg-emerald-500/5 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium">
                          {language === 'ar' ? rem.titleAr : rem.titleEn}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {language === 'ar' ? rem.messageAr : rem.messageEn}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!rem.read && firebaseUser && (
                          <button
                            onClick={() => markReminderRead(firebaseUser.uid, rem.id)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-emerald-500"
                            title={language === 'ar' ? 'تحديد كمقروء' : 'Mark read'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {firebaseUser && (
                          <button
                            onClick={() => deleteReminder(firebaseUser.uid, rem.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/15 text-neutral-400 hover:text-red-500"
                            title={t.common.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-16 lg:bottom-6 end-4 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-xl text-xs font-medium shadow-lg border ${
                toast.type === 'error'
                  ? 'bg-red-950 text-red-100 border-red-800'
                  : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-800 dark:border-neutral-200'
              }`}
            >
              {toast.text}
            </div>
          ))}
        </div>
      )}

      <OfflineIndicator />
    </div>
  );
};
