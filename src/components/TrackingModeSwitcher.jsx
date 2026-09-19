import { Check } from 'lucide-react';

export const trackingOptions = [
  ['cycle', 'Track my cycle', 'Understand your rhythm, symptoms, and daily patterns.'],
  ['trying_to_conceive', 'Trying to conceive', 'Follow fertile windows and prepare with confidence.'],
  ['pregnant', "I'm pregnant", 'Track your pregnancy journey and weekly changes.'],
  ['postpartum', 'I just had a baby', 'Keep newborn care, recovery, and daily logs together.'],
];

const TrackingModeSwitcher = ({ mode, onChange, compact = false }) => <div className={compact ? 'space-y-2' : 'space-y-3'}>{trackingOptions.map(([value, title, description]) => <button type="button" key={value} onClick={() => onChange(value)} className={`flex w-full items-start justify-between rounded-2xl border p-4 text-left transition ${mode === value ? 'border-[#800020] bg-[#e2b4bd] text-[#3a2029]' : 'border-blue-200 bg-blue-50/60 text-blue-900 hover:bg-blue-100'}`}><span><span className="block font-semibold">{title}</span>{!compact && <span className={`mt-1 block text-sm ${mode === value ? 'text-blue-100' : 'text-blue-900/70'}`}>{description}</span>}</span>{mode === value && <Check size={20} className="mt-0.5 shrink-0" />}</button>)}</div>;

export default TrackingModeSwitcher;
