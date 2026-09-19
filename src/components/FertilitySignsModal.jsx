import { useEffect, useState } from 'react';
import { Activity, Check, FileText, Thermometer, X } from 'lucide-react';
import { format } from 'date-fns';
import { useFeature } from '../context/FeatureContext';

const mucusOptions = [
  ['none', 'None'], ['sticky', 'Sticky'], ['creamy', 'Creamy'],
  ['eggwhite', 'Egg white'], ['watery', 'Watery'], ['clumpy', 'Clumpy'],
];
const symptomOptions = ['Ovulation pain', 'Breast tenderness', 'Increased energy', 'Fatigue', 'Nausea', 'Headache', 'Bloating', 'Spotting'];
const intimacyOptions = [['none', 'No intimacy today'], ['protected', 'Protected'], ['unprotected', 'Unprotected'], ['high_drive', 'High drive']];

const FertilitySignsModal = ({ isOpen, onClose, date, onSave, initialData }) => {
  const hasDischarge = useFeature('discharge_tracking');
  const hasSex = useFeature('sex_tracking');
  const [discharge, setDischarge] = useState('none');
  const [temperature, setTemperature] = useState('');
  const [temperatureUnit, setTemperatureUnit] = useState('C');
  const [symptoms, setSymptoms] = useState([]);
  const [sexActivity, setSexActivity] = useState([]);
  const [dailyNote, setDailyNote] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setDischarge(initialData?.discharge?.type || 'none');
    setTemperature(initialData?.temperature ? String(initialData.temperature) : '');
    setTemperatureUnit(initialData?.temperatureUnit || 'C');
    setSymptoms(Array.isArray(initialData?.symptoms) ? initialData.symptoms : []);
    setSexActivity(Array.isArray(initialData?.sexActivity) ? initialData.sexActivity : []);
    setDailyNote(initialData?.dailyNote || '');
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toggle = (items, value, setter) => setter(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  const submit = (event) => {
    event.preventDefault();
    onSave({
      ...initialData,
      discharge: { ...(initialData?.discharge || {}), type: discharge },
      temperature: Number(temperature) || 0,
      temperatureUnit,
      symptoms,
      ...(hasSex ? { sexActivity } : {}),
      dailyNote,
      date: date.toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-3 backdrop-blur-sm sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="fertility-signs-title" className="flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-blue-100 bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-soft dark:border-navy-700">
        <header className="flex items-start justify-between border-b border-blue-100 px-5 py-4 dark:border-navy-700 sm:px-6">
          <div><p className="text-xs font-bold text-blue-500">Fertility check-in</p><h2 id="fertility-signs-title" className="mt-1 font-display text-2xl font-semibold">{format(date, 'EEEE, d MMMM')}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close fertility signs" className="focus-ring rounded-lg p-2 text-[var(--color-muted)] hover:bg-blue-50 dark:hover:bg-navy-700"><X size={20} /></button>
        </header>
        <form onSubmit={submit} className="min-h-0 space-y-6 overflow-y-auto p-5 sm:p-6">
          {hasDischarge && <section><FieldHeading icon={Activity} title="Cervical mucus" subtitle="Egg white and watery mucus are the two types closest to ovulation." /><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{mucusOptions.map(([value, label]) => <Chip key={value} selected={discharge === value} onClick={() => setDischarge(value)}>{label}</Chip>)}</div></section>}
          <section><FieldHeading icon={Thermometer} title="Basal body temperature" subtitle="Record your waking temperature if you are tracking it." /><div className="flex gap-3"><input aria-label="Basal body temperature" type="number" min="0" step="0.01" value={temperature} onChange={(event) => setTemperature(event.target.value)} placeholder="Optional" className="focus-ring min-w-0 flex-1 rounded-xl border border-blue-100 bg-transparent px-3 py-3 text-sm dark:border-navy-700" /><div className="flex rounded-xl bg-blue-50 p-1 dark:bg-navy-700">{['C', 'F'].map((unit) => <button type="button" key={unit} onClick={() => setTemperatureUnit(unit)} className={`rounded-lg px-4 py-2 text-sm font-bold ${temperatureUnit === unit ? 'bg-blue-500 text-[#fff5f5]' : 'text-[var(--color-muted)]'}`}>°{unit}</button>)}</div></div></section>
          <section><FieldHeading icon={Activity} title="Signs to watch for" subtitle="Choose anything you noticed today." /><div className="flex flex-wrap gap-2">{symptomOptions.map((symptom) => <Chip key={symptom} selected={symptoms.includes(symptom)} onClick={() => toggle(symptoms, symptom, setSymptoms)}>{symptom}</Chip>)}</div></section>
          {hasSex && <section><FieldHeading icon={Activity} title="Intimacy" subtitle="Optional and private." /><div className="flex flex-wrap gap-2">{intimacyOptions.map(([value, label]) => <Chip key={value} selected={sexActivity.includes(value)} onClick={() => toggle(sexActivity, value, setSexActivity)}>{label}</Chip>)}</div></section>}
          <section><FieldHeading icon={FileText} title="Note" subtitle="Anything else you want to remember?" /><textarea value={dailyNote} onChange={(event) => setDailyNote(event.target.value)} rows="3" placeholder="Optional" className="focus-ring w-full resize-none rounded-xl border border-blue-100 bg-transparent px-3 py-3 text-sm dark:border-navy-700" /></section>
          <div className="flex justify-end gap-3 border-t border-blue-100 pt-4 dark:border-navy-700"><button type="button" onClick={onClose} className="focus-ring rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-muted)] hover:bg-blue-50 dark:hover:bg-navy-700">Cancel</button><button type="submit" className="focus-ring rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-[#fff5f5]">Save signs</button></div>
        </form>
      </div>
    </div>
  );
};

const FieldHeading = ({ icon: Icon, title, subtitle }) => <div className="mb-3"><div className="flex items-center gap-2"><Icon size={18} className="text-blue-500" /><h3 className="font-display text-lg font-semibold">{title}</h3></div><p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{subtitle}</p></div>;
const Chip = ({ selected, onClick, children }) => <button type="button" aria-pressed={selected} onClick={onClick} className={`focus-ring inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${selected ? 'border-blue-400 bg-blue-400/20 text-blue-600 dark:text-blue-200' : 'border-blue-100 text-[var(--color-muted)] hover:border-blue-400 dark:border-navy-700'}`}>{selected && <Check size={14} />}{children}</button>;

export default FertilitySignsModal;
