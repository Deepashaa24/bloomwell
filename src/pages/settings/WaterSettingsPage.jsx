import { SettingsFeatureLayout, NumberSetting, useFeatureSettings } from './SettingsFeatureLayout';

const WaterSettingsPage = () => {
  const { settings, setSettings, loading, saving, message, save } = useFeatureSettings();
  return <SettingsFeatureLayout title="Water settings" description="Set the daily water goal used in your check-ins." loading={loading} saving={saving} message={message} onSubmit={save}><NumberSetting label="Daily water goal (glasses)" hint="Choose between 1 and 20 glasses." value={settings.waterGoal || 8} min="1" max="20" onChange={(waterGoal) => setSettings({ ...settings, waterGoal })} /></SettingsFeatureLayout>;
};

export default WaterSettingsPage;
