import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { householdAPI } from '../services/api';

const FeatureContext = createContext(null);

export const FeatureProvider = ({ children }) => {
  const { user } = useAuth();
  const [household, setHousehold] = useState(null);
  useEffect(() => { if (!user) return; householdAPI.get().then((response) => setHousehold(response.data.household)).catch(() => setHousehold(null)); }, [user?._id]);
  const value = useMemo(() => ({
    trackingMode: user?.trackingMode || user?.mode || 'cycle',
    enabledFeatures: Array.isArray(user?.enabledFeatures) && user.enabledFeatures.length ? user.enabledFeatures : ['ai_chat', 'ai_recommendations'],
    onboardingCompleted: user?.onboardingCompleted === true,
    household,
    sharedBabyOnly: Boolean(household && String(household.owner?._id || household.owner) !== String(user?._id) && household.members?.some((member) => String(member.user?._id || member.user) === String(user?._id) && member.permissions?.baby && !member.permissions?.health)),
    sharedHealth: Boolean(household && String(household.owner?._id || household.owner) !== String(user?._id) && household.members?.some((member) => String(member.user?._id || member.user) === String(user?._id) && member.permissions?.health)),
  }), [user, household]);

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
};

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (!context) throw new Error('useFeatures must be used within a FeatureProvider');
  return context;
};

export const useFeature = (feature) => useFeatures().enabledFeatures.includes(feature);
