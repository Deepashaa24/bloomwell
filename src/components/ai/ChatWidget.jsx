import { useEffect, useState } from 'react';
import { Bot, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import ChatPanel from './ChatPanel';
import { aiAPI } from '../../services/api';
import { feedbackAPI } from '../../services/api';
import { toast } from 'sonner';

const contextByPath = { '/reports': 'Ask about this report and I’ll help you read the patterns.', '/calendar': 'Ask about this month’s cycle timing or a day on your calendar.', '/settings': 'Ask how your preferences shape your Bloomwell experience.' };

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const { pathname } = useLocation();
  const { messages, isStreaming, error, sendMessage, stop, loadConversation } = useChat();
  const pageContext = contextByPath[pathname] || 'Ask about your cycle, symptoms, sleep, or today’s wellbeing.';
  const rateMessage = async (message, sentiment) => { try { await feedbackAPI.submit({ category: 'general', message: `Chatbot response rating: ${sentiment}`, context: { type: 'chat-response', response: message.content.slice(0, 1000), sentiment } }); toast.success('Thanks for helping improve Bloomwell'); } catch (error) { toast.error('Could not save your feedback'); } };
  useEffect(() => {
    if (!open) return;
    aiAPI.getConversations().then(async ({ data }) => {
      const summarized = await Promise.all(data.conversations.slice(0, 10).map(async (conversation) => {
        if (conversation.summary?.blurb) return conversation;
        try {
          const response = await aiAPI.getConversationSummary(conversation._id);
          return { ...conversation, summary: response.data.summary };
        } catch { return conversation; }
      }));
      setConversations([...summarized, ...data.conversations.slice(10)]);
    }).catch(() => {});
  }, [open]);

  return <div className="fixed bottom-5 right-5 z-40 sm:bottom-8 sm:right-8">{open && <div className="mb-3 flex items-end gap-2">{historyOpen && <aside aria-label="Conversation history" className="app-surface flex max-h-[min(38rem,calc(100vh-7rem))] w-48 flex-col gap-2 overflow-y-auto p-3"><p className="px-1 text-xs font-bold  tracking-wider text-[var(--color-muted)]">Your conversations</p>{conversations.length === 0 && <p className="px-1 text-xs leading-5 text-[var(--color-muted)]">Your saved conversations will appear here.</p>}{conversations.map((conversation) => <button type="button" key={conversation._id} onClick={() => { loadConversation(conversation._id); setHistoryOpen(false); }} className="focus-ring rounded-xl px-2 py-2 text-left hover:bg-blue-50 dark:hover:bg-navy-700"><span className="block text-xs font-semibold text-[var(--color-ink)]">{conversation.summary?.title || conversation.title}</span><span className="mt-1 block text-[10px] font-normal leading-4 text-[var(--color-muted)]">{conversation.summary?.blurb || 'Open conversation'}</span></button>)}</aside>}<ChatPanel messages={messages} isStreaming={isStreaming} error={error} onSend={sendMessage} onStop={stop} onClose={() => setOpen(false)} onOpenHistory={() => setHistoryOpen((current) => !current)} onRate={rateMessage} pageContext={pageContext} /></div>}<button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Close Bloomwell AI' : 'Open Bloomwell AI'} className="focus-ring ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-[#fff5f5] shadow-soft transition hover:-translate-y-1 hover:bg-blue-600 active:scale-95">{open ? <X size={23} /> : <Bot size={23} />}</button></div>;
};

export default ChatWidget;
