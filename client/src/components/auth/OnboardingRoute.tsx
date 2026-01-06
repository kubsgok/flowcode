import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../common/Spinner';

interface OnboardingRouteProps {
  children: ReactNode;
  requireGuidedMode?: boolean;
}

/**
 * Route wrapper that requires authentication AND completed onboarding.
 * Redirects to /onboarding if the user hasn't completed the onboarding flow.
 * If requireGuidedMode is true, also checks that user has completed guided mode onboarding.
 */
export function OnboardingRoute({ children, requireGuidedMode = false }: OnboardingRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not logged in - redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if onboarding is complete
  // User needs to have selected a mode (preferredMode is set)
  const onboardingComplete = user?.onboardingComplete || user?.preferredMode !== null;

  if (!onboardingComplete) {
    // Onboarding not complete - redirect to onboarding
    return <Navigate to="/onboarding" replace />;
  }

  // For guided mode routes, check if user has completed guided mode setup
  if (requireGuidedMode) {
    const hasGuidedSetup = user?.preferredMode === 'guided' && user?.selfAssessment;
    if (!hasGuidedSetup) {
      // Redirect to onboarding to complete guided mode setup
      return <Navigate to="/onboarding" state={{ switchToGuided: true }} replace />;
    }
  }

  return <>{children}</>;
}
