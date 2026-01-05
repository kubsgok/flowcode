import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { OnboardingRoute } from './components/auth/OnboardingRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProblemListPage } from './pages/ProblemListPage';
import { PracticePage } from './pages/PracticePage';
import { ModeSelectPage } from './pages/ModeSelectPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { GuidedDashboard } from './pages/GuidedDashboard';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Onboarding routes - protected but don't require completed onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <ModeSelectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/assessment"
          element={
            <ProtectedRoute>
              <AssessmentPage />
            </ProtectedRoute>
          }
        />

        {/* Guided mode dashboard - requires completed onboarding */}
        <Route
          path="/guided"
          element={
            <OnboardingRoute>
              <GuidedDashboard />
            </OnboardingRoute>
          }
        />

        {/* Practice mode routes - requires completed onboarding */}
        <Route
          path="/problems"
          element={
            <OnboardingRoute>
              <ProblemListPage />
            </OnboardingRoute>
          }
        />
        <Route
          path="/practice/:slug"
          element={
            <OnboardingRoute>
              <PracticePage />
            </OnboardingRoute>
          }
        />

        {/* Redirect /dashboard based on preferred mode */}
        <Route
          path="/dashboard"
          element={
            <OnboardingRoute>
              <DashboardRedirect />
            </OnboardingRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

// Component to redirect to appropriate dashboard based on user's mode
import { useAuth } from './contexts/AuthContext';

function DashboardRedirect() {
  const { user } = useAuth();

  if (user?.preferredMode === 'guided') {
    return <Navigate to="/guided" replace />;
  }
  return <Navigate to="/problems" replace />;
}

export default App;
