import { SettingsFeatureLayout, NumberSetting, useFeatureSettings } from './SettingsFeatureLayout';

const CycleSettingsPage = () => {
  const { settings, setSettings, loading, saving, message, save } = useFeatureSettings();
  return <SettingsFeatureLayout title="Cycle settings" description="Adjust the cycle estimates Bloomwell uses for predictions." loading={loading} saving={saving} message={message} onSubmit={save}><NumberSetting label="Average cycle length (days)" hint="Typical range: 21-35 days (default: 28)." value={settings.cycleLength} min="20" max="40" onChange={(cycleLength) => setSettings({ ...settings, cycleLength })} /><NumberSetting label="Average period length (days)" hint="Typical range: 3-7 days (default: 5)." value={settings.periodLength} min="2" max="10" onChange={(periodLength) => setSettings({ ...settings, periodLength })} /></SettingsFeatureLayout>;
};

export default CycleSettingsPage;
