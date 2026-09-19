import { SettingsFeatureLayout, FeatureToggle, useFeatureSettings } from './SettingsFeatureLayout';

const JournalingSettingsPage = () => {
  const { enabledFeatures, toggleFeature, loading, saving, message, save } = useFeatureSettings();
  return <SettingsFeatureLayout title="Guided journaling" description="Choose whether guided prompts and journal fields appear in your check-ins." loading={loading} saving={saving} message={message} onSubmit={save}><FeatureToggle enabled={enabledFeatures.includes('journaling')} onChange={() => toggleFeature('journaling')} label="Guided journaling" description="Add private notes and optional prompts to your daily log." /></SettingsFeatureLayout>;
};

export default JournalingSettingsPage;
