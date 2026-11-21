import { useCallback, useEffect, useRef, useState } from 'react';
import { aiAPI, API_URL } from '../services/api';

const welcomeMessage = { id: 'welcome', role: 'assistant', content: 'Hi, I’m Bloomwell AI. I can help you understand your logged cycle patterns, symptoms, sleep, and wellbeing. I’ll keep things educational and practical, and I’ll always suggest a clinician for anything medically concerning.' };

export const useChat = (conversationId) => {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [activeConversationId, setActiveConversationId] = useState(conversationId || null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  useEffect(() => {
    setActiveConversationId(conversationId || null);
    if (!conversationId) { setMessages([welcomeMessage]); return; }
    aiAPI.getHistory(conversationId).then(({ data }) => setMessages(data.messages.length ? data.messages : [welcomeMessage])).catch(() => setError('Could not load this conversation.'));
  }, [conversationId]);

  const sendMessage = useCallback(async (content) => {
    const message = content.trim();
    if (!message || isStreaming) return;
    setError('');
    setIsStreaming(true);
    const assistantId = `assistant-${Date.now()}`;
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', content: message }, { id: assistantId, role: 'assistant', content: '' }]);
    const token = localStorage.getItem('token');
    abortRef.current = new AbortController();

    try {
      const response = await fetch(`${API_URL}/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ message, conversationId: activeConversationId }), signal: abortRef.current.signal });
      if (!response.ok || !response.body) throw new Error('Unable to start the assistant');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finished = false;
      const handleEvent = (event) => {
        const line = event.split('\n').find((item) => item.startsWith('data: '));
        if (!line) return;
        const payload = JSON.parse(line.slice(6));
        if (payload.type === 'meta') setActiveConversationId(payload.conversationId);
        if (payload.type === 'delta') setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, content: item.content + payload.content } : item));
        if (payload.type === 'done') finished = true;
      };
      while (!finished) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';
        events.forEach(handleEvent);
        if (done) break;
      }
      const finalEvent = buffer.trim();
      if (finalEvent && !finished) handleEvent(finalEvent);
    } catch (requestError) {
      if (requestError.name !== 'AbortError') { setError(requestError.message || 'The assistant is unavailable right now.'); setMessages((current) => current.filter((item) => item.id !== assistantId)); }
    } finally { setIsStreaming(false); abortRef.current = null; }
  }, [activeConversationId, isStreaming]);

  const stop = () => abortRef.current?.abort();
  const loadConversation = async (id) => {
    setError('');
    try {
      const { data } = await aiAPI.getHistory(id);
      setActiveConversationId(id);
      setMessages(data.messages.length ? data.messages : [welcomeMessage]);
    } catch { setError('Could not load this conversation.'); }
  };
  return { messages, activeConversationId, isStreaming, error, sendMessage, stop, loadConversation };
};
