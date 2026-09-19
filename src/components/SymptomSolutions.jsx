import { useEffect, useState } from 'react';
import { ChevronDown, HeartPulse, LoaderCircle } from 'lucide-react';
import { aiAPI } from '../services/api';

const CACHE_KEY = 'bloomwell-symptom-relief';
const readCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; } };

const SymptomSolutions = ({ symptoms }) => {
  const [suggestions, setSuggestions] = useState(readCache);
  const [loading, setLoading] = useState({});
  const [expandedSymptom, setExpandedSymptom] = useState(null);
  const relevantSymptoms = [...new Set(symptoms || [])];

  useEffect(() => {
    relevantSymptoms.forEach((symptom) => {
      if (suggestions[symptom] || loading[symptom]) return;
      setLoading((current) => ({ ...current, [symptom]: true }));
      aiAPI.generateSymptomRelief(symptom).then(({ data }) => {
        setSuggestions((current) => { const next = { ...current, [symptom]: data.suggestions }; localStorage.setItem(CACHE_KEY, JSON.stringify(next)); return next; });
      }).catch(() => {}).finally(() => setLoading((current) => ({ ...current, [symptom]: false })));
    });
  }, [symptoms]);

  if (!relevantSymptoms.length) return null;
  return <section className="mt-6 rounded-3xl bg-[#fff5f5] p-6 shadow-lg dark:bg-navy-900" aria-labelledby="relief-heading"><div className="mb-4 flex items-center gap-2"><HeartPulse className="text-blue-500" size={22} /><div><h3 id="relief-heading" className="text-xl font-bold text-gray-800 dark:text-blue-50">Personalized relief ideas</h3><p className="text-xs text-gray-500 dark:text-gray-300">Generated from your current cycle context</p></div></div><div className="space-y-3">{relevantSymptoms.map((symptom) => { const isExpanded = expandedSymptom === symptom; return <div key={symptom} className="overflow-hidden rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-700 dark:border-navy-700 dark:bg-navy-700 dark:text-blue-100"><button type="button" onClick={() => setExpandedSymptom(isExpanded ? null : symptom)} aria-expanded={isExpanded} className="flex w-full items-center justify-between p-4 text-left font-semibold hover:opacity-80"><span>{symptom}</span>{loading[symptom] ? <LoaderCircle className="animate-spin" size={18} /> : <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={18} />}</button>{isExpanded && <div className="space-y-2 px-4 pb-4">{loading[symptom] ? <p className="text-sm">Personalizing suggestions...</p> : (suggestions[symptom] || []).map((tip, index) => <p key={index} className="flex gap-2 text-sm leading-5"><span aria-hidden="true">•</span>{tip}</p>)}</div>}</div>; })}</div><p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 dark:border-navy-700 dark:bg-navy-700 dark:text-blue-100"><strong>Note:</strong> These are general wellness suggestions, not medical advice. Contact a healthcare professional for severe, worsening, or persistent symptoms.</p></section>;
};

export default SymptomSolutions;
