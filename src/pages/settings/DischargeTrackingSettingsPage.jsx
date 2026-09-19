import { SettingsFeatureLayout, FeatureToggle, useFeatureSettings } from './SettingsFeatureLayout';

const DischargeTrackingSettingsPage = () => {
  const { enabledFeatures, toggleFeature, loading, saving, message, save } = useFeatureSettings();
  return <SettingsFeatureLayout title="Discharge tracking" description="Track cervical mucus observations as part of your cycle and fertility check-ins." loading={loading} saving={saving} message={message} onSubmit={save}><FeatureToggle enabled={enabledFeatures.includes('discharge_tracking')} onChange={() => toggleFeature('discharge_tracking')} label="Cervical mucus tracking" description="Show discharge options in your daily logs." /></SettingsFeatureLayout>;
};

export default DischargeTrackingSettingsPage;
