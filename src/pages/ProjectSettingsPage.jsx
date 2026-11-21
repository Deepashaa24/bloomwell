import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Share2 } from 'lucide-react';
import { projectsAPI, membersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import InviteForm from '../components/InviteForm';
import ShareModal from '../components/ShareModal';
import { toast } from 'sonner';

const ProjectSettingsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [projectRes, membersRes] = await Promise.all([projectsAPI.get(projectId), membersAPI.list(projectId)]);
        const p = projectRes.data.project || projectRes.data;
        setProject(p);
        setName(p?.name || '');
        setDescription(p?.description || '');
        setMembers(membersRes.data.members || membersRes.data || []);
      } catch { navigate('/projects'); }
      finally { setLoading(false); }
    };
    load();
  }, [projectId]);

  const isOwner = project?.owner?._id === user?._id || project?.owner === user?._id;

  const saveProject = async () => {
    try {
      setSaving(true); setMessage('');
      const response = await projectsAPI.update(projectId, { name, description });
      setProject(response.data.project || response.data);
      setMessage('Project updated.');
      toast.success('Project updated');
    } catch { setMessage('Could not update project.'); }
    finally { setSaving(false); }
  };

  const updateMemberRole = async (memberId, newRole) => {
    try {
      await membersAPI.update(projectId, memberId, { role: newRole });
      setMembers((prev) => prev.map((m) => m._id === memberId ? { ...m, role: newRole } : m));
      toast.success('Role updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not update role'); }
  };

  const removeMember = async (memberId) => {
    try {
      await membersAPI.remove(projectId, memberId);
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
      toast.success('Member removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not remove member'); }
  };

  if (loading || !project) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link to={`/projects/${projectId}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"><ArrowLeft size={16} />Back to project</Link>
        <header className="mb-8"><h1 className="font-display text-3xl font-bold text-gray-800">Project settings</h1><p className="mt-2 text-sm text-gray-600">Manage members, sharing, and project details.</p></header>
        <div className="space-y-6">
          <section className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
            <h2 className="mb-4 font-semibold text-gray-800">Project details</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500" /></div>
              <button type="button" onClick={saveProject} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-[#fff5f5] disabled:opacity-50"><Save size={16} />{saving ? 'Saving...' : 'Save changes'}</button>
              {message && <p className={`text-sm ${message.includes('updated') || message.includes('success') ? 'text-blue-600' : 'text-red-500'}`}>{message}</p>}
            </div>
          </section>
          <section className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-gray-800">Members</h2>{isOwner && <button type="button" onClick={() => setShareOpen(true)} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"><Share2 size={12} />Share link</button>}</div>
            <div className="space-y-3">{members.map((m) => { const member = m.user || m; return <div key={m._id} className="flex items-center justify-between rounded-xl border border-blue-100 p-3"><div><p className="font-semibold text-gray-800">{member.name}</p><p className="text-xs text-gray-500">{member.email}</p></div><div className="flex items-center gap-2"><select value={m.role} onChange={(e) => updateMemberRole(m._id, e.target.value)} className={`rounded-lg border px-2 py-1 text-xs font-semibold ${m.role === 'admin' ? 'border-amber-300 bg-amber-50 text-amber-700' : m.role === 'editor' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300 bg-gray-50 text-gray-700'}`}><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></select>{!isOwner && m._id !== user._id && <button type="button" onClick={() => removeMember(m._id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">x</button>}</div></div>; })}</div>
            {isOwner && <div className="mt-4 border-t border-blue-100 pt-4"><h3 className="mb-2 text-sm font-semibold text-gray-700">Invite by email</h3><InviteForm projectId={projectId} onInvited={() => { const load = async () => { try { const membersRes = await membersAPI.list(projectId); setMembers(membersRes.data.members || membersRes.data || []); } catch {} }; load(); }} /></div>}
          </section>
          <section className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
            <h2 className="mb-4 font-semibold text-gray-800">Danger zone</h2>
            <button type="button" onClick={() => { if (window.confirm('Delete this project?')) projectsAPI.delete(projectId).then(() => navigate('/projects')); }} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100">Delete project</button>
          </section>
        </div>
        {shareOpen && <ShareModal project={project} isOpen={shareOpen} onClose={() => setShareOpen(false)} onShared={() => {}} />}
      </div>
    </div>
  );
};

export default ProjectSettingsPage;
