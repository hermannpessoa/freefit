import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { LoadingScreen } from './components/ui';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { state } = useApp();

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route (redirect if authenticated)
function PublicRoute({ children }) {
  const { state } = useApp();

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
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
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
            <h1>🎉 Dashboard</h1>
            <p>Bem-vindo ao MyFit AI!</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
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
