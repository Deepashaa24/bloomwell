import { useEffect, useState } from 'react';
import { CalendarDays, Command, FileText, Search, X } from 'lucide-react';
import { aiAPI } from '../../services/api';

const SmartSearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleShortcut = (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(true); } if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const search = async (event) => {
    event?.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true); setError(''); setResult(null);
    try { const response = await aiAPI.search(query.trim()); setResult(response.data); } catch (requestError) { setError(requestError.response?.data?.message || 'Search is unavailable right now.'); } finally { setLoading(false); }
  };

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="Search your health data" className="focus-ring fixed right-5 top-5 z-20 hidden items-center gap-3 rounded-xl border border-blue-100 bg-[#fff5f5]/80 px-3 py-2 text-xs font-semibold text-[var(--color-muted)] shadow-sm backdrop-blur md:flex dark:border-navy-700 dark:bg-navy-900/80"><Search size={15} /><span>Search your health data</span><kbd className="flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-1 text-[10px] text-blue-600 dark:bg-navy-700 dark:text-blue-200"><Command size={10} />K</kbd></button>
    {open && <div role="dialog" aria-modal="true" aria-label="Search your health data" className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/35 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}><div className="app-surface w-full max-w-3xl overflow-hidden"><form onSubmit={search} className="flex items-center gap-3 border-b border-blue-100 px-5 py-4 dark:border-navy-700"><Search className="shrink-0 text-blue-500" size={21} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “when did I last have headaches?”" aria-label="Natural language health search" className="focus-ring min-w-0 flex-1 bg-transparent text-base outline-none" /><button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="focus-ring rounded-lg p-2 text-[var(--color-muted)] hover:bg-blue-50 dark:hover:bg-navy-700"><X size={18} /></button></form><div className="max-h-[68vh] overflow-y-auto p-5">{!result && !loading && !error && <div className="py-10 text-center"><Search className="mx-auto mb-3 text-blue-300" size={30} /><p className="font-display text-2xl">Ask your data a question</p><p className="mt-2 text-sm text-[var(--color-muted)]">Search symptoms, moods, periods, phases, or general health education.</p><div className="mt-5 flex flex-wrap justify-center gap-2">{['When did I last have headaches?', 'How was my mood during ovulation?', 'Why am I cramping?'].map((suggestion) => <button type="button" key={suggestion} onClick={() => { setQuery(suggestion); }} className="focus-ring rounded-full border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-navy-700 dark:text-blue-200">{suggestion}</button>)}</div></div>}{loading && <div className="space-y-4 py-6"><div className="h-5 w-1/4 animate-pulse rounded bg-blue-100 dark:bg-navy-700" /><div className="h-16 animate-pulse rounded-xl bg-blue-50 dark:bg-navy-700" /><div className="h-24 animate-pulse rounded-xl bg-blue-50 dark:bg-navy-700" /></div>}{error && <p role="alert" className="py-8 text-center text-sm text-blue-600">{error}</p>}{result && !loading && <div className="space-y-6"><section><p className="mb-2 text-xs font-bold   text-blue-500">Answer</p><p className="font-display text-2xl leading-tight">{result.summary}</p></section><section><p className="mb-3 text-xs font-bold   text-blue-500">Your health data</p>{result.results.logs.length === 0 && result.results.periods.length === 0 ? <p className="text-sm text-[var(--color-muted)]">No matching personal entries found.</p> : <div className="grid gap-2 sm:grid-cols-2">{result.results.logs.map((log) => <article key={log._id} className="rounded-xl border border-blue-100 p-3 dark:border-navy-700"><div className="flex items-center gap-2 text-xs font-bold text-blue-600"><CalendarDays size={14} />{new Date(log.date).toLocaleDateString()}</div><p className="mt-2 text-sm">{[...(log.symptoms || []), ...(log.pain || []), log.mood].filter(Boolean).join(' · ') || 'Daily wellbeing log'}</p></article>)}{result.results.periods.map((period) => <article key={period._id} className="rounded-xl border border-blue-100 p-3 dark:border-navy-700"><div className="flex items-center gap-2 text-xs font-bold text-blue-600"><CalendarDays size={14} />Period entry</div><p className="mt-2 text-sm">{new Date(period.startDate).toLocaleDateString()} to {new Date(period.endDate).toLocaleDateString()}</p></article>)}</div>}</section>{result.educational.length > 0 && <section><p className="mb-3 text-xs font-bold   text-blue-500">Related education</p><div className="grid gap-3 sm:grid-cols-2">{result.educational.map((article) => <article key={article.id} className="rounded-xl bg-blue-50 p-4 dark:bg-navy-700"><div className="flex items-center gap-2 text-sm font-bold"><FileText size={16} className="text-blue-500" />{article.title}</div><p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">{article.summary}</p></article>)}</div></section>}</div>}</div></div></div>}
  </>;
};

export default SmartSearchBar;
