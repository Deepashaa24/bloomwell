import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeatures } from '../context/FeatureContext';

const ProtectedRoute = ({ children, allowOnboarding = false, feature }) => {
  const { isAuthenticated, loading } = useAuth();
  const { onboardingCompleted, enabledFeatures } = useFeatures();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowOnboarding && onboardingCompleted) return <Navigate to="/dashboard" replace />;
  if (!allowOnboarding && !onboardingCompleted) return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  if (feature && !enabledFeatures.includes(feature)) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
