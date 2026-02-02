import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import OnboardingPage from '@/pages/OnboardingPage';
import Dashboard from '@/pages/Dashboard';
import WorkoutEditor from '@/pages/WorkoutEditor';
import SettingsPage from '@/pages/SettingsPage';
import AIWorkoutPage from '@/pages/AIWorkoutPage';
import ProgressPage from '@/pages/ProgressPage';

function AppContent() {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001317] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-[#00fff3] mb-4">FreeFit</div>
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-[#00fff3]/20 border-t-[#00fff3] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in but hasn't completed onboarding (missing basic data or no profile)
  // Usuário precisa de onboarding apenas se:
  // 1. Tem sessão ativa E
  // 2. Ou não tem user carregado OU não tem age preenchido (dados básicos vazios)
  // Isso garante onboarding apenas para usuários NOVOS
  const needsOnboarding = session && (!user || !user.age);

  return (
    <Routes>
      <Route path="/" element={session ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route path="/signup" element={session ? <Navigate to="/dashboard" /> : <AuthPage />} />
      {/* Onboarding: apenas para usuários com sessão */}
      <Route path="/onboarding" element={session ? <OnboardingPage /> : <Navigate to="/login" />} />
      {/* Dashboard: redireciona para onboarding APENAS se novo, caso contrário deixa carregar */}
      <Route path="/dashboard" element={session ? (needsOnboarding ? <Navigate to="/onboarding" /> : <Dashboard />) : <Navigate to="/login" />} />
      <Route path="/create-workout" element={session ? (needsOnboarding ? <Navigate to="/onboarding" /> : <WorkoutEditor />) : <Navigate to="/login" />} />
      <Route path="/edit-workout/:id" element={session ? (needsOnboarding ? <Navigate to="/onboarding" /> : <WorkoutEditor />) : <Navigate to="/login" />} />
      <Route path="/workout/:id" element={session ? (needsOnboarding ? <Navigate to="/onboarding" /> : <WorkoutEditor />) : <Navigate to="/login" />} />
      <Route path="/ai-workout" element={session ? (needsOnboarding ? <Navigate to="/onboarding" /> : <AIWorkoutPage />) : <Navigate to="/login" />} />
      <Route path="/progress" element={session ? (needsOnboarding ? <Navigate to="/onboarding" /> : <ProgressPage />) : <Navigate to="/login" />} />
      <Route path="/settings" element={session ? (needsOnboarding ? <Navigate to="/onboarding" /> : <SettingsPage />) : <Navigate to="/login" />} />
      {/* More routes will be added later */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
