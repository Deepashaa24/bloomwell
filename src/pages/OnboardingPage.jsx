import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pregnancyAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TrackingModeSwitcher, { trackingOptions } from '../components/TrackingModeSwitcher';

const featureOptions = [
  ['ai_chat', 'AI health assistant', 'Chat about your symptoms, cycle, and questions anytime.'],
  ['ai_recommendations', 'Personalized recommendations', 'Get daily tips based on your data.'],
  ['ai_search', 'Smart search', 'Ask questions about your own logged history.'],
  ['ai_reports', 'AI-generated reports', 'Create shareable summaries for your doctor.'],
  ['discharge_tracking', 'Discharge tracking', 'Add optional, more detailed daily logging.'],
  ['sex_tracking', 'Sex and intimacy tracking', 'Keep optional intimacy details with your private log.'],
  ['journaling', 'Guided journaling', 'Use reflective prompts with your daily log.'],
];

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [trackingMode, setTrackingMode] = useState('cycle');
  const [enabledFeatures, setEnabledFeatures] = useState(['ai_chat', 'ai_recommendations']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [conceptionDate, setConceptionDate] = useState('');
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const toggleFeature = (feature) => setEnabledFeatures((current) => current.includes(feature) ? current.filter((item) => item !== feature) : [...current, feature]);
  const totalSteps = trackingMode === 'pregnant' ? 4 : 3;
  const continueStep = () => { setError(''); setStep((current) => Math.min(totalSteps, current + 1)); };
  const goBack = () => setStep((current) => Math.max(1, current - 1));
  const finish = async () => {
    try {
      setSaving(true);
      const response = await usersAPI.saveOnboarding({ trackingMode, enabledFeatures });
      updateUser(response.data.user);
      if (trackingMode === 'pregnant' && (dueDate || conceptionDate)) await pregnancyAPI.saveProfile(dueDate ? { dueDate } : { conceptionDate });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your choices. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7d6d0] px-4 py-8 text-[#800020] sm:px-6 sm:py-12">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[2rem] bg-[#f7d6d0] p-6 shadow-soft sm:p-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div><p className="text-sm font-bold text-blue-700">Bloomwell</p><p className="mt-1 text-sm text-blue-900/70">A few choices to make your space yours.</p></div>
            <div className="flex gap-2" aria-label={`Step ${step} of ${totalSteps}`}>{Array.from({ length: totalSteps }, (_, index) => index + 1).map((item) => <span key={item} className={`h-2 w-8 rounded-full ${item <= step ? 'bg-blue-600' : 'bg-blue-200'}`} />)}</div>
          </div>

          {step === 1 && <div><h1 className="font-display text-4xl font-semibold">What are you tracking?</h1><p className="mt-3 text-sm leading-6 text-blue-900/75">Choose the view that best fits your life right now.</p><div className="mt-8"><TrackingModeSwitcher mode={trackingMode} onChange={setTrackingMode} /></div></div>}

          {step === 2 && <div><h1 className="font-display text-4xl font-semibold">What would you like help with?</h1><p className="mt-3 text-sm leading-6 text-blue-900/75">You can change these choices later in Settings.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{featureOptions.map(([value, title, description]) => { const selected = enabledFeatures.includes(value); return <button type="button" key={value} onClick={() => toggleFeature(value)} className={`flex min-h-32 items-start gap-3 rounded-2xl border p-4 text-left transition ${selected ? 'border-[#800020] bg-[#e2b4bd] text-[#3a2029]' : 'border-blue-300 bg-blue-100/50 text-blue-900 hover:bg-blue-200'}`}><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? 'border-[#fff5f5] bg-[#fff5f5] text-blue-600' : 'border-blue-500'}`}>{selected && <Check size={14} />}</span><span><span className="block font-semibold">{title}</span><span className={`mt-1 block text-sm leading-5 ${selected ? 'text-blue-100' : 'text-blue-900/70'}`}>{description}</span></span></button>; })}</div></div>}

          {step === 3 && <div><h1 className="font-display text-4xl font-semibold">Your Bloomwell space is ready</h1><p className="mt-3 text-sm leading-6 text-blue-900/75">Here is what we will shape around you.</p><div className="mt-8 space-y-5 rounded-2xl bg-blue-100/60 p-5"><div><p className="text-xs font-bold   text-blue-700">Focus</p><p className="mt-1 text-lg font-semibold">{trackingOptions.find(([value]) => value === trackingMode)?.[1]}</p></div><div><p className="text-xs font-bold   text-blue-700">Selected help</p><div className="mt-2 flex flex-wrap gap-2">{featureOptions.filter(([value]) => enabledFeatures.includes(value)).map(([, title]) => <span key={title} className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-[#fff5f5]">{title}</span>)}</div></div></div></div>}

          {step === 4 && <div><h1 className="font-display text-4xl font-semibold">Add your pregnancy dates</h1><p className="mt-3 text-sm leading-6 text-blue-900/75">Optional for now. Add whichever date you know and Bloomwell will calculate the other one.</p><div className="mt-8 space-y-5 rounded-2xl bg-blue-100/60 p-5"><label className="block"><span className="mb-2 block text-sm font-semibold">Due date</span><input type="date" value={dueDate} onChange={(event) => { setDueDate(event.target.value); if (event.target.value) setConceptionDate(''); }} className="w-full rounded-xl border border-blue-300 bg-[#fff5f5] px-4 py-3 text-sm" /></label><div className="text-center text-xs font-bold uppercase tracking-wider text-blue-700/60">or</div><label className="block"><span className="mb-2 block text-sm font-semibold">Conception date</span><input type="date" value={conceptionDate} onChange={(event) => { setConceptionDate(event.target.value); if (event.target.value) setDueDate(''); }} className="w-full rounded-xl border border-blue-300 bg-[#fff5f5] px-4 py-3 text-sm" /></label><p className="text-xs text-blue-900/70">You can add or change these dates later in Pregnancy settings.</p></div></div>}

          {error && <p role="alert" className="mt-5 rounded-xl border border-blue-400 bg-blue-100 px-4 py-3 text-sm text-blue-900">{error}</p>}
          <div className="mt-8 flex items-center justify-between gap-3"><button type="button" onClick={goBack} disabled={step === 1 || saving} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-blue-900/70 disabled:invisible"><ChevronLeft size={17} />Back</button>{step < totalSteps ? <button type="button" onClick={continueStep} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-[#fff5f5]">Continue<ChevronRight size={17} /></button> : <button type="button" onClick={finish} disabled={saving} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-[#fff5f5] disabled:opacity-60">{saving ? 'Saving...' : 'Start using Bloomwell'}</button>}</div>
        </div>
      </section>
    </main>
  );
};

export default OnboardingPage;
