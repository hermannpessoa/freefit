import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import BottomNav from './components/layout/BottomNav';
import { LoadingScreen } from './components/ui';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import AuthCallbackPage from './pages/Auth/AuthCallbackPage';
import OnboardingPage from './pages/Onboarding/OnboardingPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ExercisesPage from './pages/Exercises/ExercisesPage';
import WorkoutsPage from './pages/Workouts/WorkoutsPage';
import WorkoutCreatePage from './pages/Workouts/WorkoutCreatePage';
import WorkoutDetailPage from './pages/Workouts/WorkoutDetailPage';
import WorkoutActivePage from './pages/WorkoutActive/WorkoutActivePage';
import WorkoutCompletePage from './pages/WorkoutComplete/WorkoutCompletePage';
import ProgressPage from './pages/Progress/ProgressPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import DebugPanel from './pages/Debug/DebugPanel';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { state } = useApp();

  // Wait for both app state and profile data to load before making routing decisions
  if (state.isLoading) {
    return <LoadingScreen />;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // CRITICAL: Only redirect to onboarding after we have loaded profile data
  // If user has profile data, they must have completed onboarding at some point
  const hasProfileData = state.profile?.name || state.onboardingData?.name;
  const isOnOnboardingPage = window.location.pathname === '/onboarding';

  // If onboarding is completed but user is on onboarding page, redirect to dashboard
  if (state.onboardingCompleted && isOnOnboardingPage) {
    console.log('✅ Onboarding já completo, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Only redirect to onboarding if:
  // 1. Onboarding NOT completed AND
  // 2. We don't have profile data (fresh user) AND
  // 3. Not already on onboarding page
  if (!state.onboardingCompleted && !hasProfileData && !isOnOnboardingPage) {
    console.log('🔀 Redirecting to onboarding - no profile data found');
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

// Public Route (redirect if authenticated)
function PublicRoute({ children }) {
  const { state } = useApp();

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  if (state.isAuthenticated && state.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Handles root URL - detects OAuth hash fragments before redirecting
function RootRedirect() {
  const hash = window.location.hash;
  const hasAuthTokens = hash && (hash.includes('access_token') || hash.includes('refresh_token'));

  if (hasAuthTokens) {
    return <AuthCallbackPage />;
  }

  return <Navigate to="/dashboard" replace />;
}

// App Layout with Bottom Nav
function AppLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

// Main App Component
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <SignupPage />
        </PublicRoute>
      } />
      {/* Onboarding */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* Protected Routes with Bottom Nav */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/exercises" element={
        <ProtectedRoute>
          <AppLayout>
            <ExercisesPage />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Workout routes - specific routes must come before general */}
      <Route path="/workouts/create" element={
        <ProtectedRoute>
          <WorkoutCreatePage />
        </ProtectedRoute>
      } />

      <Route path="/workouts/:id" element={
        <ProtectedRoute>
          <WorkoutDetailPage />
        </ProtectedRoute>
      } />

      <Route path="/workouts" element={
        <ProtectedRoute>
          <AppLayout>
            <WorkoutsPage />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/progress" element={
        <ProtectedRoute>
          <AppLayout>
            <ProgressPage />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Full Screen Routes (no bottom nav) */}
      <Route path="/workout-active" element={
        <ProtectedRoute>
          <WorkoutActivePage />
        </ProtectedRoute>
      } />

      <Route path="/subscription" element={
        <ProtectedRoute>
          <SubscriptionPage />
        </ProtectedRoute>
      } />

      <Route path="/workout-complete" element={
        <ProtectedRoute>
          <WorkoutCompletePage />
        </ProtectedRoute>
      } />

      {/* Debug Panel - Acesse /debug para corrigir problemas */}
      <Route path="/debug" element={
        <ProtectedRoute>
          <DebugPanel />
        </ProtectedRoute>
      } />

      {/* OAuth callback route */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Default redirect - detect OAuth hash fragments */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SupabaseProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </SupabaseProvider>
    </BrowserRouter>
  );
}

export default App;
