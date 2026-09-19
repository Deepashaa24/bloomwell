import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Droplet, Heart, Info, Lightbulb, Moon, Sparkles, X } from 'lucide-react';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { aiAPI, settingsAPI } from '../services/api';
import { useFeature } from '../context/FeatureContext';
import { categoryColorClasses, logCategories } from '../config/logCategories';

const tabs = ['Overview', 'Cycle', 'Wellbeing', 'Notes'];
const symptoms = ['Headache', 'Cramps', 'Bloating', 'Fatigue', 'Nausea', 'Acne', 'Breast tenderness'];
const moods = [
  ['energetic', Sparkles], ['happy', Heart], ['sad', Moon], ['anxious', Info],
  ['irritated', Lightbulb], ['calm', Moon], ['sensitive', Heart],
];
const arrayFields = ['symptoms', 'mood', 'spotting', 'collectionMethod', 'feelings', 'pain', 'digestion', 'stool', 'skin', 'hair', 'cravings', 'sexLife', 'energy', 'mind', 'socialLife', 'exercise', 'sleepQuality'];
const defaultData = {
  steps: '', calories: '', symptoms: [], mood: [], flow: 'none',
  discharge: { type: 'none', noted: false }, weightKg: '', waterIntake: 0,
  sexActivity: [], crampsIntensity: null, sleepHours: 0, sleepMinutes: 0,
  sleepQuality: [], dailyNote: '', journalEntry: '', feelings: [], pain: [],
  spotting: [], collectionMethod: [], mind: [], socialLife: [], sexLife: [],
  energy: [], pms: false, temperature: '', temperatureUnit: 'C', exercise: [], meditation: false,
  digestion: [], stool: [], skin: [], hair: [], cravings: [], otherSymptoms: [],
};
const normalizeArray = (value) => Array.isArray(value) ? value : value ? [value] : [];
const normalizeFlow = (value) => ({ Light: 'light', Medium: 'medium', Heavy: 'heavy', 'Super heavy': 'heavy' }[value] || value || 'none');

const LogModal = ({ isOpen, onClose, date, onSave, initialData, isPeriodDay = false, onDateChange, defaultTab = 'Overview' }) => {
  const hasDischarge = useFeature('discharge_tracking');
  const hasSex = useFeature('sex_tracking');
  const hasJournal = useFeature('journaling');
  const [tab, setTab] = useState('Overview');
  const [unit, setUnit] = useState('kg');
  const [journalPrompt, setJournalPrompt] = useState('');
  const [journalLoading, setJournalLoading] = useState(false);
  const [data, setData] = useState(defaultData);
  const [trackedCategories, setTrackedCategories] = useState(logCategories.map((category) => category.id));
  const [customizing, setCustomizing] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTab(defaultTab);
    setData((current) => {
      const next = { ...current, ...defaultData, ...initialData };
      arrayFields.forEach((field) => { next[field] = normalizeArray(initialData?.[field]); });
      next.flow = normalizeFlow(initialData?.flow);
      next.discharge = initialData?.discharge || { type: 'none', noted: false };
      next.sexActivity = normalizeArray(initialData?.sexActivity);
      next.waterIntake = initialData?.waterIntake || 0;
      next.sleepHours = initialData?.sleepHours || 0;
      next.weightKg = initialData?.weightKg || '';
      next.temperatureUnit = initialData?.temperatureUnit || 'C';
      return next;
    });
    let active = true;
    settingsAPI.getSettings().then((response) => {
      if (!active) return;
      const configured = response.data.settings?.trackedCategories;
      setTrackedCategories(Array.isArray(configured) && configured.length ? configured : logCategories.map((category) => category.id));
    }).catch(() => {
      if (active) setTrackedCategories(logCategories.map((category) => category.id));
    });
    return () => { active = false; };
  }, [isOpen, initialData, defaultTab]);

  const visibleCategories = useMemo(() => new Set(trackedCategories), [trackedCategories]);
  if (!isOpen) return null;

  const update = (field, value) => setData((current) => ({ ...current, [field]: value }));
  const toggle = (field, value) => update(field, normalizeArray(data[field]).includes(value) ? normalizeArray(data[field]).filter((item) => item !== value) : [...normalizeArray(data[field]), value]);
  const toggleCategory = (category, value) => {
    if (category.id === 'discharge') {
      update('discharge', { ...data.discharge, type: value });
      return;
    }
    if (category.id === 'pms' || category.id === 'meditation') {
      update(category.field, !data[category.field]);
      return;
    }
    const next = category.multi
      ? (normalizeArray(data[category.field]).includes(value) ? normalizeArray(data[category.field]).filter((item) => item !== value) : [...normalizeArray(data[category.field]), value])
      : value;
    update(category.field, next);
    if (category.id === 'sexLife') update('sexActivity', next);
  };
  const selectedCategoryValue = (category) => category.id === 'discharge' ? data.discharge?.type : data[category.field];
  const displayedWeight = unit === 'lb' && data.weightKg ? Math.round(Number(data.weightKg) * 2.20462 * 10) / 10 : data.weightKg;
  const setWeight = (value) => update('weightKg', unit === 'lb' ? Math.round(Number(value || 0) / 2.20462 * 10) / 10 : value);
  const submit = (event) => {
    event.preventDefault();
    onSave({ ...data, date: date.toISOString(), steps: Number(data.steps) || 0, calories: Number(data.calories) || 0, weightKg: Number(data.weightKg) || null, sleepHours: Number(data.sleepHours) || 0, temperature: Number(data.temperature) || 0, temperatureUnit: data.temperatureUnit || 'C' });
  };
  const getPrompt = async () => {
    try { setJournalLoading(true); const response = await aiAPI.generateJournalPrompt(date.toISOString()); setJournalPrompt(response.data.prompt); }
    catch { setJournalPrompt('Notice one feeling in your body today and write what it might be asking for.'); }
    finally { setJournalLoading(false); }
  };
  const saveCustomization = async () => {
    try { setSettingsSaving(true); await settingsAPI.updateSettings({ trackedCategories }); setCustomizing(false); }
    finally { setSettingsSaving(false); }
  };
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const dateDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-2 backdrop-blur-sm sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="log-title" className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-navy-700 bg-navy-900 text-gray-900 shadow-soft">
        <header className="border-b border-navy-700 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold text-blue-400">Daily check-in</p><h2 id="log-title" className="mt-1 font-display text-xl font-semibold">{format(date, 'EEEE, d MMMM')}</h2></div><div className="flex items-center gap-2"><button type="button" onClick={() => setCustomizing((current) => !current)} className="rounded-full border border-blue-400/50 px-3 py-1.5 text-xs font-bold text-blue-400">Customize</button><button type="button" onClick={onClose} aria-label="Close daily log" className="focus-ring rounded-lg p-2 text-gray-700 hover:bg-navy-700/30"><X size={20} /></button></div></div>
          <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">{dateDays.map((day) => <button type="button" key={day.toISOString()} disabled={!onDateChange} onClick={() => onDateChange?.(day)} className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-xs font-bold ${isSameDay(day, date) ? 'border border-blue-300 bg-blue-400/15 text-blue-400' : 'border border-transparent text-gray-500 hover:border-navy-700'} ${onDateChange ? 'cursor-pointer' : 'cursor-default'}`}><span>{format(day, 'EEEEE')}</span><span className="text-sm">{format(day, 'd')}</span></button>)}</div>
        </header>
        {customizing && <div className="border-b border-navy-700 bg-gray-900/40 px-4 py-4 sm:px-6"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-bold">Customize check-in</p><button type="button" onClick={saveCustomization} disabled={settingsSaving} className="rounded-lg bg-blue-400 px-3 py-2 text-xs font-bold text-navy-950">{settingsSaving ? 'Saving...' : 'Save'}</button></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{logCategories.map((category) => <label key={category.id} className="flex items-center gap-2 rounded-lg border border-navy-700 px-2 py-2 text-xs"><input type="checkbox" checked={visibleCategories.has(category.id)} onChange={() => setTrackedCategories((current) => current.includes(category.id) ? current.filter((id) => id !== category.id) : [...current, category.id])} />{category.label}</label>)}</div></div>}
        <nav aria-label="Log sections" className="grid grid-cols-4 border-b border-navy-700 px-3 pt-2 sm:px-6">{tabs.map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={`focus-ring border-b-2 px-2 py-3 text-xs font-bold transition sm:text-sm ${tab === item ? 'border-blue-400 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>{item}</button>)}</nav>
        <form onSubmit={submit} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === 'Overview' && <Overview data={data} update={update} toggle={toggle} renderCategory={renderCategory} />}
          {tab === 'Cycle' && <Cycle data={data} update={update} isPeriodDay={isPeriodDay} hasDischarge={hasDischarge} hasSex={hasSex} renderCategory={renderCategory} />}
          {tab === 'Wellbeing' && <Wellbeing data={data} update={update} toggle={toggle} unit={unit} setUnit={setUnit} displayedWeight={displayedWeight} setWeight={setWeight} renderCategory={renderCategory} />}
          {tab === 'Notes' && <Notes data={data} update={update} toggle={toggle} hasJournal={hasJournal} journalPrompt={journalPrompt} journalLoading={journalLoading} getPrompt={getPrompt} />}
          <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between border-t border-navy-700 bg-navy-900/95 px-4 pt-4 backdrop-blur sm:-mx-6 sm:px-6"><button type="button" onClick={() => tab === 'Overview' ? onClose() : setTab(tabs[Math.max(0, tabs.indexOf(tab) - 1)])} className="focus-ring rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-navy-700">{tab === 'Overview' ? 'Cancel' : <><ChevronLeft size={16} className="mr-1 inline" />Back</>}</button>{tab === 'Notes' ? <button type="submit" className="focus-ring rounded-xl bg-blue-400 px-5 py-3 text-sm font-bold text-navy-950 hover:bg-blue-300">Save check-in</button> : <button type="button" onClick={() => setTab(tabs[tabs.indexOf(tab) + 1])} className="focus-ring rounded-xl bg-blue-400 px-5 py-3 text-sm font-bold text-navy-950 hover:bg-blue-300">Continue <ChevronRight size={16} className="ml-1 inline" /></button>}</div>
        </form>
      </div>
    </div>
  );

  function renderCategory(category) {
    if (!category || !trackedCategories.includes(category.id) || (category.id === 'discharge' && !hasDischarge) || (category.id === 'sexLife' && !hasSex)) return null;
    const selected = selectedCategoryValue(category);
    const palette = categoryColorClasses[category.color];
    return <section key={category.id} className="space-y-3"><h3 className="font-display text-lg font-semibold">{category.label}</h3><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{category.options.map(({ value, label, Icon }) => { const active = category.id === 'pms' || category.id === 'meditation' ? Boolean(selected) : category.multi ? normalizeArray(selected).includes(value) : selected === value; return <button type="button" key={value} onClick={() => toggleCategory(category, value)} aria-pressed={active} className={`focus-ring flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border p-2 text-center text-[11px] font-semibold transition ${active ? `${palette.border} ${palette.background} ${palette.text}` : 'border-navy-700 text-gray-700 hover:border-blue-400/60'}`}><Icon size={21} className={active ? palette.icon : 'text-gray-500'} /><span>{label}</span></button>; })}</div>{category.id === 'discharge' && <div className="flex gap-2"><span className="self-center text-xs text-gray-500">Confidence</span>{[['Yes', true], ['No', false], ['Unsure', null]].map(([label, noted]) => <button type="button" key={label} onClick={() => update('discharge', { ...data.discharge, noted })} className={`focus-ring rounded-md px-2 py-1 text-[10px] ${data.discharge?.noted === noted ? 'bg-blue-400 text-navy-950' : 'bg-navy-700 text-gray-700'}`}>{label}</button>)}</div>}</section>;
  }
};

const Overview = ({ data, update, toggle, renderCategory }) => <div className="space-y-7"><SectionTitle title="Activity" subtitle="A few signals from your day" /><div className="grid grid-cols-2 gap-3"><NumberInput label="Steps" value={data.steps} onChange={(value) => update('steps', value)} /><NumberInput label="Calories" value={data.calories} onChange={(value) => update('calories', value)} /></div>{renderCategory(logCategories.find((category) => category.id === 'feelings'))}{renderCategory(logCategories.find((category) => category.id === 'pain'))}<SectionTitle title="Mood" subtitle="Choose everything that fits today" /><div className="flex gap-2 overflow-x-auto pb-1">{moods.map(([label, Icon]) => <Choice key={label} selected={data.mood.includes(label)} onClick={() => toggle('mood', label)}><Icon size={18} /><span>{label}</span></Choice>)}</div><SectionTitle title="Symptoms" subtitle="Select what you noticed" /><div className="flex flex-wrap gap-2">{symptoms.map((symptom) => <button type="button" key={symptom} onClick={() => toggle('symptoms', symptom)} className={`focus-ring rounded-full border px-3 py-2 text-xs font-semibold transition ${data.symptoms.includes(symptom) ? 'border-blue-400 bg-blue-400/20 text-blue-400' : 'border-navy-700 text-gray-700 hover:border-blue-400'}`}>{symptom}</button>)}</div>{data.symptoms.includes('Cramps') && <div className="rounded-xl border border-blue-400/30 bg-blue-400/5 p-4"><p className="mb-2 text-xs font-bold tracking-wider text-blue-400">Cramps intensity</p><div className="flex gap-2">{['light', 'medium', 'severe'].map((level) => <Choice key={level} selected={data.crampsIntensity === level} onClick={() => update('crampsIntensity', level)}>{level}</Choice>)}</div></div>}</div>;

const Cycle = ({ data, update, isPeriodDay, hasDischarge, hasSex, renderCategory }) => <div className="space-y-7"><div className="flex items-center justify-between"><SectionTitle title="Flow" subtitle={isPeriodDay ? 'Tap the intensity that matches today' : 'Flow is shown for period days'} />{!isPeriodDay && <span className="text-xs text-gray-500">No period logged</span>}</div>{isPeriodDay && renderCategory(logCategories.find((category) => category.id === 'flow'))}{renderCategory(logCategories.find((category) => category.id === 'spotting'))}{renderCategory(logCategories.find((category) => category.id === 'collectionMethod'))}{hasDischarge && renderCategory(logCategories.find((category) => category.id === 'discharge'))}{hasSex && <><SectionTitle title="Sex and intimacy" subtitle="Optional and private" /><div className="flex flex-wrap gap-2">{['none', 'protected', 'unprotected', 'high_drive', 'masturbation'].map((label) => <Choice key={label} selected={data.sexActivity.includes(label)} onClick={() => update('sexActivity', data.sexActivity.includes(label) ? data.sexActivity.filter((item) => item !== label) : [...data.sexActivity, label])}>{label.replace('_', ' ')}</Choice>)}</div>{renderCategory(logCategories.find((category) => category.id === 'sexLife'))}</>}</div>;

const Wellbeing = ({ data, update, toggle, unit, setUnit, displayedWeight, setWeight, renderCategory }) => <div className="space-y-7"><SectionTitle title="Vitals" subtitle="Track gently, without judgment" /><div className="rounded-xl border border-navy-700 p-4"><div className="mb-2 flex items-center justify-between"><label htmlFor="weight" className="text-sm font-semibold">Weight</label><div className="flex rounded-lg bg-navy-700 p-1 text-xs"><button type="button" onClick={() => setUnit('kg')} className={`rounded px-2 py-1 ${unit === 'kg' ? 'bg-blue-400 text-navy-950' : 'text-gray-700'}`}>kg</button><button type="button" onClick={() => setUnit('lb')} className={`rounded px-2 py-1 ${unit === 'lb' ? 'bg-blue-400 text-navy-950' : 'text-gray-700'}`}>lb</button></div></div><input id="weight" type="number" min="0" step="0.1" value={displayedWeight} onChange={(event) => setWeight(event.target.value)} placeholder="Optional" className="focus-ring w-full rounded-xl border border-navy-700 bg-white px-3 py-2 text-sm" /></div><div className="rounded-xl border border-navy-700 p-4"><div className="mb-2 flex items-center justify-between"><label htmlFor="temperature" className="text-sm font-semibold">Basal body temperature</label><div className="flex rounded-lg bg-navy-700 p-1 text-xs"><button type="button" onClick={() => update('temperatureUnit', 'C')} className={`rounded px-2 py-1 ${data.temperatureUnit === 'C' ? 'bg-blue-400 text-navy-950' : 'text-gray-700'}`}>°C</button><button type="button" onClick={() => update('temperatureUnit', 'F')} className={`rounded px-2 py-1 ${data.temperatureUnit === 'F' ? 'bg-blue-400 text-navy-950' : 'text-gray-700'}`}>°F</button></div></div><input id="temperature" type="number" min="0" step="0.01" value={data.temperature} onChange={(event) => update('temperature', event.target.value)} placeholder="Optional" className="focus-ring w-full rounded-xl border border-navy-700 bg-white px-3 py-2 text-sm" /></div><div><div className="mb-2 flex justify-between"><label htmlFor="sleep" className="text-sm font-semibold">Sleep</label><span className="text-sm text-blue-400">{Number(data.sleepHours).toFixed(1)}h</span></div><input id="sleep" type="range" min="0" max="12" step="0.5" value={data.sleepHours} onChange={(event) => update('sleepHours', event.target.value)} className="w-full accent-blue-400" /></div><div><div className="mb-3 flex justify-between"><p className="text-sm font-semibold">Water</p><span className="text-xs text-gray-500">{data.waterIntake} glasses</span></div><div className="flex flex-wrap gap-2">{Array.from({ length: 8 }, (_, index) => <button type="button" key={index} onClick={() => update('waterIntake', data.waterIntake === index + 1 ? index : index + 1)} aria-label={`${index + 1} glasses of water`} className="focus-ring rounded-lg p-1"><Droplet size={25} className={index < data.waterIntake ? 'fill-blue-300 text-blue-400' : 'text-gray-500'} /></button>)}</div></div>{['digestion', 'stool', 'skin', 'hair', 'cravings', 'energy', 'mind', 'socialLife', 'exercise', 'pms', 'meditation'].map((id) => renderCategory(logCategories.find((category) => category.id === id)))}</div>;

const Notes = ({ data, update, toggle, hasJournal, journalPrompt, journalLoading, getPrompt }) => <div className="space-y-6"><TextArea label="Daily note" value={data.dailyNote} onChange={(value) => update('dailyNote', value)} placeholder="What would you like to remember?" />{hasJournal && <div className="rounded-xl border border-blue-400/30 bg-blue-400/5 p-4"><div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-semibold">Guided journal</h3><p className="mt-1 text-xs text-gray-500">A prompt shaped by your cycle and mood.</p></div><button type="button" onClick={getPrompt} disabled={journalLoading} className="focus-ring rounded-lg border border-blue-400/40 px-3 py-2 text-xs font-semibold text-blue-400">{journalLoading ? 'Thinking...' : 'Get a prompt'}</button></div>{journalPrompt && <p className="mb-3 text-sm italic leading-5 text-gray-700">{journalPrompt}</p>}<textarea value={data.journalEntry} onChange={(event) => update('journalEntry', event.target.value)} placeholder="Write freely..." rows="6" maxLength="5000" className="focus-ring w-full resize-none rounded-xl border border-navy-700 bg-white px-3 py-3 text-sm" /></div>}<SectionTitle title="Sleep quality" subtitle="Optional context" /><div className="flex flex-wrap gap-2">{['Trouble falling asleep', 'Woke up refreshed', 'Woke up tired', 'Restless sleep'].map((item) => <Choice key={item} selected={data.sleepQuality.includes(item)} onClick={() => toggle('sleepQuality', item)}>{item}</Choice>)}</div></div>;

const SectionTitle = ({ title, subtitle }) => <div><h3 className="font-display text-lg font-semibold">{title}</h3>{subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}</div>;
const NumberInput = ({ label, value, onChange }) => <label className="rounded-xl border border-navy-700 p-3"><span className="mb-2 block text-xs text-gray-500">{label}</span><input type="number" min="0" value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring w-full bg-transparent text-lg font-bold outline-none" /></label>;
const TextArea = ({ label, value, onChange, placeholder }) => <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows="4" className="focus-ring w-full resize-none rounded-xl border border-navy-700 bg-white px-3 py-3 text-sm" /></label>;
const Choice = ({ selected, onClick, children }) => <button type="button" onClick={onClick} className={`focus-ring flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] font-semibold capitalize transition ${selected ? 'border-blue-400 bg-blue-400/20 text-blue-400' : 'border-navy-700 text-gray-700 hover:border-blue-400/60'}`}>{children}</button>;

export default LogModal;
