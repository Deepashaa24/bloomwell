import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DemoDashboardPage = lazy(() => import('./pages/DemoDashboardPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const PregnancyDashboardPage = lazy(() => import('./pages/PregnancyDashboardPage'));
const BabyTrackerPage = lazy(() => import('./pages/BabyTrackerPage'));
const TryingToConceivePage = lazy(() => import('./pages/TryingToConceivePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ProjectSettingsPage = lazy(() => import('./pages/ProjectSettingsPage'));
const ProjectAnalyticsPage = lazy(() => import('./pages/ProjectAnalyticsPage'));
const NewProjectPage = lazy(() => import('./pages/NewProjectPage'));
const PublicSharePage = lazy(() => import('./pages/PublicSharePage'));
const CycleSettingsPage = lazy(() => import('./pages/settings/CycleSettingsPage'));
const PregnancySettingsPage = lazy(() => import('./pages/settings/PregnancySettingsPage'));
const WaterSettingsPage = lazy(() => import('./pages/settings/WaterSettingsPage'));
const AIAssistantSettingsPage = lazy(() => import('./pages/settings/AIAssistantSettingsPage'));
const DischargeTrackingSettingsPage = lazy(() => import('./pages/settings/DischargeTrackingSettingsPage'));
const SexTrackingSettingsPage = lazy(() => import('./pages/settings/SexTrackingSettingsPage'));
const JournalingSettingsPage = lazy(() => import('./pages/settings/JournalingSettingsPage'));
const FamilyCollaboratorsPage = lazy(() => import('./pages/settings/FamilyCollaboratorsPage'));
const InviteAcceptPage = lazy(() => import('./pages/InviteAcceptPage'));
const PartnerPregnancyPage = lazy(() => import('./pages/PartnerPregnancyPage'));
import Navbar from './components/Navbar';
import ChatWidget from './components/ai/ChatWidget';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import SmartSearchBar from './components/ai/SmartSearchBar';
import ErrorBoundary from './components/ErrorBoundary';
import { FeatureProvider, useFeature, useFeatures } from './context/FeatureContext';

const AppFrame = ({ children }) => {
  const hasChat = useFeature('ai_chat');
  const hasSearch = useFeature('ai_search');
  return <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] transition-colors">
    <Navbar />
    {hasSearch && <SmartSearchBar />}
    <main className="pb-24 md:ml-64 md:pb-8"><AnimatePresence mode="wait"><motion.div key={window.location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>{children}</motion.div></AnimatePresence></main>
    {hasChat && <ChatWidget />}
    <Toaster position="top-right" richColors />
  </div>
};

const PageSkeleton = () => <div className="min-h-screen bg-[var(--color-canvas)] p-8"><div className="mx-auto max-w-5xl animate-pulse space-y-5"><div className="h-8 w-48 rounded-xl bg-blue-100 dark:bg-navy-700" /><div className="h-40 rounded-2xl bg-blue-50 dark:bg-navy-900" /><div className="grid gap-4 md:grid-cols-3"><div className="h-28 rounded-2xl bg-blue-50 dark:bg-navy-900" /><div className="h-28 rounded-2xl bg-blue-50 dark:bg-navy-900" /><div className="h-28 rounded-2xl bg-blue-50 dark:bg-navy-900" /></div></div></div>;

const DashboardEntry = () => {
  const { trackingMode, sharedBabyOnly, sharedHealth } = useFeatures();
  if (sharedBabyOnly) return <BabyTrackerPage />;
  if (sharedHealth) return <PartnerPregnancyPage />;
  if (trackingMode === 'postpartum') return <BabyTrackerPage />;
  if (trackingMode === 'trying_to_conceive') return <TryingToConceivePage />;
  return trackingMode === 'pregnant' ? <PregnancyDashboardPage /> : <DashboardPage />;
};

const HomeEntry = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageSkeleton />;
  if (!isAuthenticated) return <DemoDashboardPage />;

  return (
    <ProtectedRoute>
      <AppFrame><DashboardEntry /></AppFrame>
    </ProtectedRoute>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FeatureProvider><Router>
          <Suspense fallback={<PageSkeleton />}><Routes>
            {/* Public Routes */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/invite/:token" element={<ProtectedRoute><InviteAcceptPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute allowOnboarding><OnboardingPage /></ProtectedRoute>} />

            {/* Public demo for signed-out visitors; signed-in users keep their dashboard. */}
            <Route path="/" element={<HomeEntry />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><AppFrame><DashboardEntry /></AppFrame></ProtectedRoute>} />
            <Route
              path="/pregnancy"
              element={
                <ProtectedRoute>
                  <AppFrame><DashboardEntry /></AppFrame>
                </ProtectedRoute>
              }
            />
            <Route path="/baby" element={<ProtectedRoute><AppFrame><DashboardEntry /></AppFrame></ProtectedRoute>} />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <AppFrame><CalendarPage /></AppFrame>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ProtectedRoute feature="ai_reports"><AppFrame><ReportsPage /></AppFrame></ProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppFrame><SettingsPage /></AppFrame>
                </ProtectedRoute>
              }
            />
            <Route path="/settings/cycle" element={<ProtectedRoute><AppFrame><CycleSettingsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/settings/pregnancy" element={<ProtectedRoute><AppFrame><PregnancySettingsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/settings/water" element={<ProtectedRoute><AppFrame><WaterSettingsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/settings/ai-assistant" element={<ProtectedRoute><AppFrame><AIAssistantSettingsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/settings/discharge" element={<ProtectedRoute><AppFrame><DischargeTrackingSettingsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/settings/sex" element={<ProtectedRoute><AppFrame><SexTrackingSettingsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/settings/journaling" element={<ProtectedRoute><AppFrame><JournalingSettingsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/settings/family" element={<ProtectedRoute><AppFrame><FamilyCollaboratorsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><AppFrame><ProjectsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute><AppFrame><NewProjectPage /></AppFrame></ProtectedRoute>} />
            <Route path="/projects/:projectId" element={<ProtectedRoute><AppFrame><ProjectDetailPage /></AppFrame></ProtectedRoute>} />
            <Route path="/projects/:projectId/settings" element={<ProtectedRoute><AppFrame><ProjectSettingsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/projects/:projectId/analytics" element={<ProtectedRoute><AppFrame><ProjectAnalyticsPage /></AppFrame></ProtectedRoute>} />
            <Route path="/share/:token" element={<PublicSharePage />} />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <AppFrame><FeedbackPage /></AppFrame>
                </ProtectedRoute>
              }
            />

            {/* Catch all - blueirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes></Suspense>
        </Router></FeatureProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
