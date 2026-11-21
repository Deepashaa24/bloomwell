import { useState } from 'react';
import { UserPlus, Mail, X } from 'lucide-react';
import { membersAPI } from '../services/api';
import { toast } from 'sonner';

const InviteForm = ({ projectId, onInvited }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setLoading(true);
      await membersAPI.invite(projectId, { email, role });
      toast.success(`Invite sent to ${email}`);
      setEmail('');
      setRole('editor');
      onInvited?.();
    } catch (err) { toast.error(err.response?.data?.message || `Could not send invite to ${email}`); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
        <option value="viewer">Viewer</option>
        <option value="editor">Editor</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-[#fff5f5] disabled:opacity-50"><UserPlus size={16} />{loading ? 'Sending...' : 'Invite'}</button>
    </form>
  );
};

export default InviteForm;
