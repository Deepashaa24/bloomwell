import { useState } from 'react';
import { Link2, QrCode, X, Copy, Check } from 'lucide-react';
import { sharingAPI } from '../services/api';
import { toast } from 'sonner';

const ShareModal = ({ project, isOpen, onClose, onShared }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const createLink = async () => {
    try {
      setLoading(true);
      const response = await sharingAPI.createLink(project._id, { expiresIn: 7 });
      setToken(response.data.token || response.data.shareToken);
      onShared?.(response.data);
      toast.success('Share link created');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not create share link'); } finally { setLoading(false); }
  };

  const revoke = async () => {
    try {
      await sharingAPI.revokeLink(project._id, token);
      setToken('');
      toast.success('Share link revoked');
      onShared?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not revoke link'); }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = token ? `${window.location.origin}/share/${token}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-[#fff5f5] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-gray-800">Share &quot;{project?.name}&quot;</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-blue-50"><X size={20} /></button>
        </div>
        {token ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-200 bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Share link</p>
              <div className="flex gap-2">
                <input readOnly value={shareUrl} className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                <button type="button" onClick={copyLink} className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-[#fff5f5]">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={revoke} className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100">Revoke link</button>
              <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-[#fff5f5]">Done</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Create a share link to allow external access to &quot;{project?.name}&quot;.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-700"><Link2 size={16} /><span>Anyone with the link can view</span></div>
              <button type="button" onClick={createLink} disabled={loading} className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-[#fff5f5] disabled:opacity-50">{loading ? 'Creating...' : 'Create share link'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
