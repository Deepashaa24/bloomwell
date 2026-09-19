import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Droplets, HeartPulse, LogOut, MessageCircle, ShieldCheck, Sparkles, UserRound, Waves } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { settingsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TrackingModeSwitcher from '../components/TrackingModeSwitcher';

const settingLinks = [
  { path: 'cycle', title: 'Cycle settings', description: 'Cycle and period lengths used for predictions.', icon: HeartPulse },
  { path: 'pregnancy', title: 'Pregnancy timeline', description: 'Save a due date or conception date for weekly pregnancy care.', icon: CalendarDays },
  { path: 'water', title: 'Water settings', description: 'Set your daily hydration goal.', icon: Droplets },
  { path: 'ai-assistant', title: 'AI assistant', description: 'Manage Bloomwell AI tools and recommendations.', icon: Sparkles },
  { path: 'discharge', title: 'Discharge tracking', description: 'Track cervical mucus and fertility signs.', icon: Waves, feature: 'discharge_tracking' },
  { path: 'sex', title: 'Sex and intimacy', description: 'Manage private intimacy tracking options.', icon: ShieldCheck, feature: 'sex_tracking' },
  { path: 'journaling', title: 'Guided journaling', description: 'Turn journal prompts and notes on or off.', icon: MessageCircle, feature: 'journaling' },
  { path: 'family', title: 'Family & collaborators', description: 'Invite a partner and choose what you share.', icon: UserRound },
];

const SettingsPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [enabledFeatures, setEnabledFeatures] = useState([]);
  const [trackingMode, setTrackingMode] = useState(user?.trackingMode || user?.mode || 'cycle');
  const [loading, setLoading] = useState(true);
  const [modeSaving, setModeSaving] = useState(false);
  const [modeMessage, setModeMessage] = useState('');

  useEffect(() => {
    setTrackingMode(user?.trackingMode || user?.mode || 'cycle');
    settingsAPI.getSettings().then((response) => {
      setEnabledFeatures(Array.isArray(response.data.enabledFeatures) ? response.data.enabledFeatures : (user?.enabledFeatures || []));
    }).catch(() => setEnabledFeatures(user?.enabledFeatures || [])).finally(() => setLoading(false));
  }, [user?.enabledFeatures, user?.trackingMode, user?.mode]);

  const saveTrackingMode = async (nextMode) => {
    setTrackingMode(nextMode);
    try {
      setModeSaving(true);
      setModeMessage('');
      const response = await usersAPI.saveOnboarding({ trackingMode: nextMode, enabledFeatures });
      updateUser(response.data.user || { ...user, trackingMode: nextMode, enabledFeatures });
      setModeMessage('Tracking mode updated.');
      window.setTimeout(() => setModeMessage(''), 3000);
    } catch (error) {
      setTrackingMode(user?.trackingMode || user?.mode || 'cycle');
      setModeMessage('Could not update tracking mode.');
    } finally {
      setModeSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 px-4 py-8"><div className="relative z-10 mx-auto max-w-3xl"><header className="mb-8"><p className="mb-2 text-xs font-bold text-blue-500">Bloomwell preferences</p><h1 className="text-3xl font-bold text-gray-800">Settings</h1><p className="mt-2 text-sm text-gray-600">Shape the parts of Bloomwell that support your routine.</p></header><section className="mb-8 rounded-lg bg-[#fff5f5] p-6 shadow"><h2 className="mb-2 text-xl font-semibold text-gray-800">Switch what you’re tracking</h2><p className="mb-4 text-sm text-gray-600">Choose the dashboard that fits your life right now.</p>{modeMessage && <p className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{modeMessage}</p>}{modeSaving ? <p className="text-sm text-gray-600">Saving...</p> : <TrackingModeSwitcher mode={trackingMode} onChange={saveTrackingMode} compact />}</section><section className="mb-8 space-y-3" aria-labelledby="tracking-settings-heading"><h2 id="tracking-settings-heading" className="mb-3 text-xl font-semibold text-gray-800">Tracking settings</h2>{loading ? <div className="h-56 animate-pulse rounded-lg bg-blue-100" /> : settingLinks.map(({ path, title, description, icon: Icon, feature }) => <Link key={path} to={`/settings/${path}`} className="flex items-center gap-4 rounded-lg bg-[#fff5f5] p-4 shadow transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={21} /></div><div className="min-w-0 flex-1"><h3 className="font-semibold text-gray-800">{title}</h3><p className="mt-1 text-sm text-gray-600">{description}</p>{feature && <p className="mt-2 text-xs font-semibold text-blue-600">{enabledFeatures.includes(feature) ? 'Enabled' : 'Disabled'}</p>}</div><ArrowRight className="shrink-0 text-blue-500" size={19} /></Link>)}</section><section className="mb-6 rounded-lg bg-[#fff5f5] p-6 shadow"><h2 className="mb-4 text-xl font-semibold text-gray-800">About This App</h2><p className="mb-4 text-gray-600">Health & Wellness Tracker helps you monitor your menstrual cycle, track daily activities, and gain insights into your health patterns.</p><div className="space-y-2 text-sm text-gray-600"><p>• Track your period cycles and predict future dates</p><p>• Log daily steps, calories, and activities</p><p>• Monitor symptoms and mood patterns</p><p>• View comprehensive reports and analytics</p></div></section><section className="rounded-lg bg-[#fff5f5] p-6 shadow"><div className="mb-4 flex items-center gap-2"><UserRound className="text-blue-500" size={20} /><h2 className="text-xl font-semibold text-gray-800">Account Actions</h2></div><button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-[#fff5f5] transition-colors hover:from-blue-600 hover:to-blue-700"><LogOut size={18} /> Log Out</button></section></div></div>;
};

export default SettingsPage;
