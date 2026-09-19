import { Bot, History, Send, Square, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const phaseReplies = {
  Menstrual: ['Why am I cramping?', 'How can I care for myself today?', 'Tips for better sleep this week'],
  Follicular: ['How can I support my energy?', 'What should I know about this phase?', 'Tips for better sleep this week'],
  Ovulation: ["When's my next period?", 'What does my fertile window mean?', 'Tips for better sleep this week'],
  Luteal: ['Why am I feeling more tired?', 'How can I ease PMS symptoms?', 'Tips for better sleep this week'],
};

const ChatPanel = ({ messages, isStreaming, error, phase, onSend, onStop, onClose, onOpenHistory, onRate, pageContext }) => {
  const suggestions = phaseReplies[phase] || ["When's my next period?", 'Why am I cramping?', 'Tips for better sleep this week'];
  return (
    <section aria-label="Bloomwell AI chat" className="app-surface flex h-[min(38rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden">
      <header className="flex items-center justify-between bg-navy-900 px-4 py-3 text-black dark:bg-blue-500 dark:text-black">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-black dark:bg-navy-900"><Bot size={19} /></div><div><p className="text-sm font-bold text-black">Bloomwell AI</p><p className="text-[11px] opacity-75 text-black">Context-aware wellness companion</p></div></div>
        <div className="flex items-center gap-1"><button type="button" onClick={onOpenHistory} aria-label="View chat history" className="focus-ring rounded-lg p-2 hover:bg-[#fff5f5]/15"><History size={17} /></button><button type="button" onClick={onClose} aria-label="Close assistant" className="focus-ring rounded-lg p-2 hover:bg-[#fff5f5]/15"><X size={17} /></button></div>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {pageContext && <p className="rounded-xl bg-blue-100 px-3 py-2 text-xs font-semibold text-black dark:bg-navy-700 dark:text-black">{pageContext}</p>}
        {messages.map((message) => <div key={message.id || `${message.createdAt}-${message.content}`} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>{message.role === 'assistant' && <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-navy-700 dark:text-blue-200"><Bot size={14} /></div>}<div><div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-sm bg-blue-600 text-black' : 'rounded-bl-sm bg-surface text-black dark:bg-navy-700'}`}>{message.role === 'assistant' ? <ReactMarkdown>{message.content || (isStreaming ? ' ' : '')}</ReactMarkdown> : message.content}</div>{message.role === 'assistant' && message.content && !isStreaming && <div className="mt-1 flex gap-1"><button type="button" onClick={() => onRate?.(message, 'positive')} aria-label="Helpful response" className="focus-ring rounded-md p-1 text-[var(--color-muted)] hover:bg-blue-100 hover:text-blue-600"><ThumbsUp size={13} /></button><button type="button" onClick={() => onRate?.(message, 'negative')} aria-label="Unhelpful response" className="focus-ring rounded-md p-1 text-[var(--color-muted)] hover:bg-blue-100 hover:text-blue-600"><ThumbsDown size={13} /></button></div>}</div></div>)}
        {isStreaming && messages[messages.length - 1]?.content === '' && <div className="flex items-center gap-1 pl-9" aria-label="Assistant is typing"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-.3s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-.15s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" /></div>}
        {error && <p role="alert" className="text-xs text-blue-600">{error}</p>}
      </div>
      <div className="border-t border-blue-100 p-3 dark:border-navy-700"><div className="mb-2 flex gap-2 overflow-x-auto pb-1">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => onSend(suggestion)} className="focus-ring shrink-0 rounded-full border border-blue-200 px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-blue-100 dark:border-navy-700 dark:text-black dark:hover:bg-navy-700">{suggestion}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); const input = event.currentTarget.elements.message; onSend(input.value); input.value = ''; }} className="flex gap-2"><input name="message" aria-label="Message Bloomwell AI" placeholder="Ask about your wellbeing..." className="focus-ring min-w-0 flex-1 rounded-xl border border-blue-100 bg-transparent px-3 py-2 text-sm dark:border-navy-700 text-black" /><button type={isStreaming ? 'button' : 'submit'} onClick={isStreaming ? onStop : undefined} aria-label={isStreaming ? 'Stop response' : 'Send message'} className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-blue-100 transition hover:bg-navy-700 active:scale-95">{isStreaming ? <Square size={15} /> : <Send size={16} />}</button></form></div>
    </section>
  );
};

export default ChatPanel;
