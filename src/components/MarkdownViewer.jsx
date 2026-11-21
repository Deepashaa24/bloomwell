import ReactMarkdown from 'react-markdown';
import { Copy } from 'lucide-react';
import { useState } from 'react';

const MarkdownViewer = ({ content, className = '' }) => {
  const [copied, setCopied] = useState(false);
  if (!content) return null;
  return <div className={`markdown ${className}`}><ReactMarkdown>{content}</ReactMarkdown></div>;
};

export const MarkdownEditor = ({ value, onChange, placeholder = '' }) => {
  const [mode, setMode] = useState('edit');
  const [copied, setCopied] = useState(false);
  return <div className="rounded-xl border border-blue-200 bg-[#fff5f5] overflow-hidden"><div className="flex items-center gap-2 border-b border-blue-100 px-3 py-2"><button type="button" onClick={() => setMode('edit')} className={`rounded-lg px-3 py-1 text-xs font-semibold ${mode === 'edit' ? 'bg-blue-500 text-[#fff5f5]' : 'text-blue-600 hover:bg-blue-50'}`}>Edit</button><button type="button" onClick={() => setMode('preview')} className={`rounded-lg px-3 py-1 text-xs font-semibold ${mode === 'preview' ? 'bg-blue-500 text-[#fff5f5]' : 'text-blue-600 hover:bg-blue-50'}`}>Preview</button><button type="button" onClick={() => { navigator.clipboard.writeText(value || ''); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"><Copy size={12} />{copied ? 'Copied' : 'Copy'}</button></div>{mode === 'edit' ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full min-h-[200px] resize-y p-4 text-sm leading-6 bg-transparent focus:outline-none" /> : <div className="min-h-[200px] p-4 text-sm leading-6"><MarkdownViewer content={value} /></div>}</div>;
};

export default MarkdownViewer;
