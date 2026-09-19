import { SettingsFeatureLayout, FeatureToggle, useFeatureSettings } from './SettingsFeatureLayout';

const options = [['ai_chat', 'AI health assistant', 'Ask questions about your patterns and wellbeing.'], ['ai_recommendations', 'Personalized recommendations', 'Receive gentle suggestions shaped by your logs.'], ['ai_search', 'Smart search', 'Search Bloomwell health content with guided results.'], ['ai_reports', 'AI-generated reports', 'Generate summaries and reports from your tracking history.']];
const AIAssistantSettingsPage = () => {
  const { enabledFeatures, toggleFeature, loading, saving, message, save } = useFeatureSettings();
  return <SettingsFeatureLayout title="AI assistant" description="Choose the AI tools you want available across Bloomwell." loading={loading} saving={saving} message={message} onSubmit={save}>{options.map(([value, label, description]) => <FeatureToggle key={value} enabled={enabledFeatures.includes(value)} onChange={() => toggleFeature(value)} label={label} description={description} />)}</SettingsFeatureLayout>;
};

export default AIAssistantSettingsPage;
