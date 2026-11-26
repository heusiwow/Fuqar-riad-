import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AuthScreen } from './components/auth/AuthScreen';
import { DashboardView } from './components/dashboard/DashboardView';
import { ExerciseLibraryView } from './components/exercises/ExerciseLibraryView';
import { WorkoutsView } from './components/workouts/WorkoutsView';
import { ProgramsView } from './components/programs/ProgramsView';
import { LiveWorkoutView } from './components/live/LiveWorkoutView';
import { HistoryView } from './components/history/HistoryView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ProgressView } from './components/progress/ProgressView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { CoachDashboardView } from './components/coach/CoachDashboardView';
import { MessagingView } from './components/messaging/MessagingView';
import { GymAdminView } from './components/admin/GymAdminView';
import { PhilosophiesView } from './components/philosophies/PhilosophiesView';
import { RoleOnboardingScreen } from './components/auth/RoleOnboardingScreen';
import { AppShell } from './components/layout/AppShell';
import { AppProvider, useApp } from './context/AppContext';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('IRONLOG ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let isAr = false;
      try {
        isAr =
          document.documentElement.lang === 'ar' ||
          localStorage.getItem('ironlog_lang') === 'ar';
      } catch {
        // ignore storage restrictions
      }
      return (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="min-h-screen flex items-center justify-center p-6 bg-neutral-50 dark:bg-[#090A0B] text-neutral-900 dark:text-neutral-100"
        >
          <div className="max-w-md w-full bg-white dark:bg-[#121417] border border-red-500/30 rounded-2xl p-6 space-y-4">
            <h1 className="text-lg font-bold">
              {isAr ? 'حدث خطأ غير متوقع في التطبيق' : 'Application Error'}
            </h1>
            <p className="text-xs font-mono text-red-500 break-words">{this.state.errorMsg}</p>
            <button
              onClick={() => window.location.reload()}
              className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
            >
              {isAr ? 'إعادة التحميل' : 'Reload'}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const IronlogRouter: React.FC = () => {
  const { firebaseUser, authReady, dataLoading, profile, needsRoleOnboarding, activeSection } = useApp();

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#090A0B] text-neutral-500 text-sm font-display font-bold tracking-widest">
        APEX
      </div>
    );
  }

  if (!firebaseUser || !firebaseUser.emailVerified) {
    return <AuthScreen />;
  }

  if (dataLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#090A0B] text-neutral-500 text-sm font-display font-bold tracking-widest">
        APEX
      </div>
    );
  }

  if (needsRoleOnboarding) {
    return <RoleOnboardingScreen />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'exercises':
        return <ExerciseLibraryView />;
      case 'philosophies':
        return <PhilosophiesView />;
      case 'workouts':
        return <WorkoutsView />;
      case 'programs':
        return <ProgramsView />;
      case 'live':
        return <LiveWorkoutView />;
      case 'history':
        return <HistoryView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'progress':
        return <ProgressView />;
      case 'ai':
        return <AIAssistantView />;
      case 'coach':
        return <CoachDashboardView />;
      case 'messaging':
        return <MessagingView />;
      case 'admin':
        return <GymAdminView />;
      case 'profile':
        return <ProfileSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return <AppShell>{renderSection()}</AppShell>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <IronlogRouter />
      </AppProvider>
    </ErrorBoundary>
  );
}
