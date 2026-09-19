import { useEffect, useState } from 'react';
import { pregnancyAPI } from '../../services/api';
import { SettingsFeatureLayout } from './SettingsFeatureLayout';

const toDateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : '';

const PregnancySettingsPage = () => {
  const [dueDate, setDueDate] = useState('');
  const [conceptionDate, setConceptionDate] = useState('');
  const [currentWeek, setCurrentWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    pregnancyAPI.getProfile().then((response) => {
      const profile = response.data.profile;
      if (profile) {
        setDueDate(toDateInput(profile.dueDate));
        setCurrentWeek(profile.currentWeek || null);
      }
    }).catch(() => setMessage('Unable to load pregnancy settings.')).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const payload = dueDate ? { dueDate } : conceptionDate ? { conceptionDate } : null;
    if (!payload) {
      setMessage('Enter a due date or conception date first.');
      return;
    }
    try {
      setSaving(true);
      setMessage('');
      const response = await pregnancyAPI.saveProfile(payload);
      const profile = response.data.profile;
      setCurrentWeek(profile?.currentWeek || null);
      setMessage(profile?.currentWeek ? `Pregnancy timeline saved. You are in week ${profile.currentWeek}.` : 'Pregnancy timeline saved.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save your pregnancy timeline.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Remove pregnancy tracking? Your pregnancy profile will be deleted, but your other Bloomwell data will remain.')) return;
    try {
      setSaving(true);
      await pregnancyAPI.deleteProfile();
      setDueDate('');
      setConceptionDate('');
      setCurrentWeek(null);
      setMessage('Pregnancy tracking removed.');
    } catch (error) {
      setMessage('Could not remove pregnancy tracking.');
    } finally {
      setSaving(false);
    }
  };

  return <SettingsFeatureLayout title="Pregnancy settings" description="Add a due date or conception date to unlock your weekly pregnancy timeline." loading={loading} saving={saving} message={message} onSubmit={save}><div className="space-y-4"><label className="block"><span className="mb-2 block text-sm font-medium text-gray-700">Due date</span><input type="date" value={dueDate} onChange={(event) => { setDueDate(event.target.value); if (event.target.value) setConceptionDate(''); }} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" /><span className="mt-1 block text-sm text-gray-500">Use this if your care team gave you an estimated due date.</span></label><div className="text-center text-xs font-bold uppercase tracking-wider text-gray-400">or</div><label className="block"><span className="mb-2 block text-sm font-medium text-gray-700">Conception date</span><input type="date" value={conceptionDate} onChange={(event) => { setConceptionDate(event.target.value); if (event.target.value) setDueDate(''); }} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" /><span className="mt-1 block text-sm text-gray-500">Bloomwell will calculate an estimated due date from this date.</span></label></div>{currentWeek && <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">You are currently in week {currentWeek}.</div>}<button type="button" onClick={remove} disabled={saving} className="w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Remove pregnancy tracking</button></SettingsFeatureLayout>;
};

export default PregnancySettingsPage;
