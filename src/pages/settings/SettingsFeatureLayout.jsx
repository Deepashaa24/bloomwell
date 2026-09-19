import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { settingsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const DEFAULT_SETTINGS = { cycleLength: 28, periodLength: 5, waterGoal: 8 };
export const DEFAULT_FEATURES = ['ai_chat', 'ai_recommendations'];

export const useFeatureSettings = () => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [enabledFeatures, setEnabledFeatures] = useState(Array.isArray(user?.enabledFeatures) ? user.enabledFeatures : DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    settingsAPI.getSettings().then((response) => {
      if (!active) return;
      setSettings({ ...DEFAULT_SETTINGS, ...(response.data.settings || {}) });
      if (Array.isArray(response.data.enabledFeatures)) setEnabledFeatures(response.data.enabledFeatures);
    }).catch(() => {
      if (active) setMessage('Unable to load settings.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const toggleFeature = (feature) => setEnabledFeatures((current) => current.includes(feature) ? current.filter((item) => item !== feature) : [...current, feature]);
  const save = async () => {
    try {
      setSaving(true);
      setMessage('');
      const settingsResponse = await settingsAPI.updateSettings(settings);
      const onboardingResponse = await usersAPI.saveOnboarding({ trackingMode: user?.trackingMode || user?.mode || 'cycle', enabledFeatures });
      updateUser(onboardingResponse.data.user || { ...user, enabledFeatures });
      setSettings(settingsResponse.data.settings || settings);
      setMessage('Settings saved successfully!');
      window.setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return { settings, setSettings, enabledFeatures, toggleFeature, loading, saving, message, save };
};

const modeLabels = { cycle: 'Track my cycle', trying_to_conceive: 'Trying to conceive', pregnant: "I'm pregnant", postpartum: 'I just had a baby' };

export const SettingsFeatureLayout = ({ title, description, children, onSubmit, loading, saving, message, formPage = true }) => {
  const { user } = useAuth();
  const trackingMode = user?.trackingMode || user?.mode || 'cycle';
  if (loading) return <SettingsLoading />;
  const content = <div className="space-y-6">{children}{onSubmit && <button type="submit" disabled={saving} className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-[#fff5f5] transition-colors hover:from-blue-600 hover:to-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Settings'}</button>}</div>;
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 px-4 py-8"><div className="mx-auto max-w-2xl"><Link to="/settings" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"><ArrowLeft size={17} /> Settings</Link><div className="rounded-lg bg-[#fff5f5] p-6 shadow sm:p-8"><div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/60 p-4"><p className="text-xs font-bold text-blue-600">Current tracking mode</p><p className="mt-1 text-sm font-semibold text-gray-800">{modeLabels[trackingMode] || 'Track my cycle'} <Link to="/settings" className="ml-2 font-bold text-blue-600 underline">Change</Link></p></div><header className="mb-6"><h1 className="text-3xl font-bold text-gray-800">{title}</h1><p className="mt-2 text-sm leading-6 text-gray-600">{description}</p></header>{message && <div className={`mb-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.includes('success') ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}><CheckCircle2 size={17} />{message}</div>}{formPage ? <form onSubmit={(event) => { event.preventDefault(); onSubmit?.(); }}>{content}</form> : content}</div></div></div>;
};

export const SettingsLoading = () => <div className="min-h-screen bg-gray-50"><div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" /></div></div>;
export const NumberSetting = ({ label, hint, value, onChange, min, max }) => <label className="block"><span className="mb-2 block text-sm font-medium text-gray-700">{label}</span><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" min={min} max={max} required /><span className="mt-1 block text-sm text-gray-500">{hint}</span></label>;
export const FeatureToggle = ({ enabled, onChange, label, description }) => <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-4"><div><p className="text-sm font-semibold text-gray-800">{label}</p><p className="mt-1 text-xs text-gray-600">{description}</p></div><button type="button" role="switch" aria-checked={enabled} onClick={onChange} className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? 'bg-blue-500' : 'bg-gray-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-[#fff5f5] shadow transition ${enabled ? 'left-6' : 'left-1'}`} /></button></div>;
