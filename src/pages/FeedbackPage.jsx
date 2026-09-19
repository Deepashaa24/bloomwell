import { useState } from 'react';
import { Bug, Lightbulb, MessageSquare, Send, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { feedbackAPI } from '../services/api';

const FeedbackPage = () => {
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [acknowledgment, setAcknowledgment] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); setAcknowledgment(''); setUrgent(false);
    try {
      const response = await feedbackAPI.submit({ category, message, context: { source: 'feedback-page' } });
      setAcknowledgment(response.data.acknowledgment); setUrgent(response.data.urgent); setMessage('');
      toast.success(response.data.urgent ? 'Please seek real-world care now' : 'Feedback received');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not submit feedback'); } finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-[var(--color-canvas)] px-4 py-8 text-[var(--color-ink)] sm:px-8 md:px-12"><div className="mx-auto max-w-3xl"><div className="mb-8"><p className="mb-2 text-xs font-bold   text-blue-500">Help shape Bloomwell</p><h1 className="font-display text-4xl font-semibold">Send feedback</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)]">Tell us what felt confusing, what broke, or what would make your health tracking more useful.</p></div><div className="app-surface p-6 sm:p-8"><form onSubmit={handleSubmit} className="space-y-6"><label className="block"><span className="mb-2 block text-sm font-bold">What kind of feedback is this?</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="focus-ring w-full rounded-xl border border-blue-100 bg-transparent px-4 py-3 text-sm dark:border-navy-700"><option value="general">General feedback</option><option value="bug">Bug report</option><option value="feature-request">Feature request</option><option value="urgent-health-concern">Urgent health concern</option></select></label><label className="block"><span className="mb-2 block text-sm font-bold">What happened?</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} required minLength={5} maxLength={4000} rows={7} placeholder="Share the details..." className="focus-ring w-full resize-y rounded-xl border border-blue-100 bg-transparent px-4 py-3 text-sm dark:border-navy-700" /></label><button disabled={loading} type="submit" className="focus-ring flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-[#fff5f5] transition hover:bg-blue-600 disabled:opacity-60"><Send size={16} />{loading ? 'Reviewing your message...' : 'Send feedback'}</button></form>{acknowledgment && <div role="status" className={`mt-6 rounded-xl border p-4 text-sm leading-6 ${urgent ? 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100' : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-navy-700 dark:bg-navy-700 dark:text-blue-50'}`}><div className="mb-2 flex items-center gap-2 font-bold">{urgent ? <ShieldAlert size={18} /> : <MessageSquare size={18} />} {urgent ? 'Please seek real care' : 'Thanks for helping Bloomwell'}</div>{acknowledgment}</div>}</div><div className="mt-5 grid gap-3 text-xs text-[var(--color-muted)] sm:grid-cols-3"><div className="app-surface p-4"><Bug className="mb-2 text-blue-500" size={18} /><p className="font-semibold">Found a bug?</p><p className="mt-1">Include what you expected and what happened.</p></div><div className="app-surface p-4"><Lightbulb className="mb-2 text-blue-500" size={18} /><p className="font-semibold">Have an idea?</p><p className="mt-1">Tell us which daily workflow it would improve.</p></div><div className="app-surface p-4"><ShieldAlert className="mb-2 text-blue-500" size={18} /><p className="font-semibold">Health emergency?</p><p className="mt-1">Contact local emergency services, not the app.</p></div></div></div></div>;
};

export default FeedbackPage;
