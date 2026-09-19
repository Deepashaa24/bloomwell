import { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';

const AIAssistantLauncher = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-8 sm:right-8">
      {open && (
        <section aria-label="Bloomwell AI assistant" className="app-surface mb-3 w-[min(21rem,calc(100vw-2rem))] overflow-hidden">
          <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-blue-50 dark:bg-blue-500 dark:text-navy-950">
            <div className="flex items-center gap-2"><Bot size={18} /><span className="font-semibold">Bloomwell AI</span></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="focus-ring rounded-full p-1 hover:bg-[#fff5f5]/15"><X size={17} /></button>
          </div>
          <div className="space-y-3 p-4">
            <p className="text-sm leading-6 text-[var(--color-muted)]">Ask about your cycle, symptoms, or today’s wellbeing.</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input value={message} onChange={(event) => setMessage(event.target.value)} aria-label="Ask Bloomwell AI" placeholder="What would you like to know?" className="focus-ring min-w-0 flex-1 rounded-xl border border-blue-100 bg-transparent px-3 py-2 text-sm dark:border-navy-700" />
              <button type="submit" aria-label="Send question" className="focus-ring rounded-xl bg-blue-500 px-3 text-[#fff5f5] transition hover:bg-blue-600 active:scale-95"><Send size={16} /></button>
            </form>
          </div>
        </section>
      )}
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Close Bloomwell AI' : 'Open Bloomwell AI'} className="focus-ring ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-[#fff5f5] shadow-soft transition hover:-translate-y-1 hover:bg-blue-600 active:scale-95">
        {open ? <X size={23} /> : <Bot size={23} />}
      </button>
    </div>
  );
};

export default AIAssistantLauncher;
