import { SettingsFeatureLayout, FeatureToggle, useFeatureSettings } from './SettingsFeatureLayout';

const SexTrackingSettingsPage = () => {
  const { enabledFeatures, toggleFeature, loading, saving, message, save } = useFeatureSettings();
  return <SettingsFeatureLayout title="Sex and intimacy" description="Control whether private intimacy tracking appears in your daily check-ins." loading={loading} saving={saving} message={message} onSubmit={save}><FeatureToggle enabled={enabledFeatures.includes('sex_tracking')} onChange={() => toggleFeature('sex_tracking')} label="Intimacy tracking" description="Show protected, unprotected, and other intimacy options." /></SettingsFeatureLayout>;
};

export default SexTrackingSettingsPage;
