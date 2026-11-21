import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Plus, Trash2, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { projectsAPI, notesAPI, filesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarkdownViewer, { MarkdownEditor } from '../components/MarkdownViewer';
import FilePreview from '../components/FilePreview';
import ShareModal from '../components/ShareModal';
import { useRole } from '../hooks/useRole';
import { toast } from 'sonner';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { role } = useRole(project);

  const load = async () => {
    try {
      const [projectRes, notesRes, filesRes] = await Promise.all([projectsAPI.get(projectId), notesAPI.list(projectId), filesAPI.list(projectId)]);
      setProject(projectRes.data.project || projectRes.data);
      setNotes(notesRes.data.notes || notesRes.data || []);
      setFiles(filesRes.data.files || filesRes.data || []);
      if ((notesRes.data.notes || notesRes.data || []).length > 0) {
        setActiveNote((notesRes.data.notes || notesRes.data)[0]);
        setNoteContent((notesRes.data.notes || notesRes.data)[0].content || '');
      }
      setPageError('');
    } catch (err) { setPageError(err.response?.data?.message || 'Could not load project details.'); toast.error('Could not load project'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [projectId]);

  const isOwner = role === 'owner';

  const createNote = async () => {
    try {
      const response = await notesAPI.create(projectId, { title: 'New note', content: '' });
      const newNote = response.data.note || response.data;
      setNotes((prev) => [newNote, ...prev]);
      setActiveNote(newNote);
      setNoteContent(newNote.content || '');
      setEditMode(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not create note'); }
  };

  const saveNote = async () => {
    try {
      if (activeNote) {
        await notesAPI.update(projectId, activeNote._id, { content: noteContent });
        setNotes((prev) => prev.map((n) => n._id === activeNote._id ? { ...n, content: noteContent } : n));
        setEditMode(false);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Could not save note'); }
  };

  const deleteNote = async () => {
    try {
      if (activeNote) {
        await notesAPI.delete(projectId, activeNote._id);
        setNotes((prev) => prev.filter((n) => n._id !== activeNote._id));
        const remaining = notes.filter((n) => n._id !== activeNote._id);
        setActiveNote(remaining[0] || null);
        setNoteContent(remaining[0]?.content || '');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete note'); }
  };

  const handleDeleteProject = async () => {
    try {
      await projectsAPI.delete(projectId);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete project'); }
    finally { setDeleteConfirm(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    try {
      setUploading(true);
      const response = await filesAPI.upload(projectId, file);
      const newFile = response.data.file || response.data;
      setFiles((prev) => [...prev, newFile]);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not upload file'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  if (pageError) return <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] p-6"><div className="app-surface max-w-md p-8 text-center"><p className="text-red-500 font-semibold text-lg">Error</p><p className="mt-3 text-sm text-[var(--color-muted)]">{pageError}</p></div></div>;
  if (loading || !project) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;

  if (deleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="mb-2 text-center text-xl font-bold text-gray-800">Delete project?</h3>
          <p className="mb-6 text-center text-sm text-gray-600">This will permanently delete "{project.name}" and all its notes, files, and members. This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(false)} className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleDeleteProject} className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/projects" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"><ArrowLeft size={16} />Projects</Link>
        <header className="mb-8 rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-500">{project.members?.length || 0} collaborators</p><h1 className="mt-1 font-display text-3xl font-bold text-gray-800">{project.name}</h1><p className="mt-2 text-sm text-gray-600">{project.description}</p></div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShareOpen(true)} className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">Share</button>
              {canManage && <button type="button" onClick={() => navigate(`/projects/${projectId}/settings`)} className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-[#fff5f5]">Settings</button>}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="inline-block mr-1" size={14} />Delete
                </button>
              )}
            </div>
          </div>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <section className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Notes</h2>
                {canEdit && <button type="button" onClick={createNote} className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-[#fff5f5]"><Plus size={14} />Note</button>}
              </div>
              {notes.length === 0 && !canEdit && <p className="text-sm text-gray-500">No notes yet.</p>}
              {activeNote && (
                <div className="space-y-3">
                  {canEdit && <input value={activeNote.title || ''} onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })} placeholder="Note title" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold" />}
                  {!canEdit ? (
                    <MarkdownViewer content={activeNote.content} />
                  ) : (
                    <MarkdownEditor value={noteContent} onChange={setNoteContent} placeholder="Write in Markdown..." />
                  )}
                  {canEdit && <div className="flex items-center gap-2"><button type="button" onClick={saveNote} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-[#fff5f5]">Save</button>{activeNote._id && <button type="button" onClick={deleteNote} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><Trash2 size={16} /></button>}</div>}
                </div>
              )}
              {notes.length > 1 && (
                <div className="mt-4 space-y-1 border-t border-blue-100 pt-4">
                  {notes.filter((n) => n._id !== activeNote?._id).map((note) => (
                    <button key={note._id} type="button" onClick={() => { setActiveNote(note); setNoteContent(note.content || ''); setEditMode(false); }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-blue-50">{note.title || 'Untitled'}</button>
                  ))}
                </div>
              )}
            </section>
            <section className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
              <h2 className="mb-4 font-semibold text-gray-800">Files</h2>
              {canEdit && (
                <div className="mb-4">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50"><Upload size={16} />Upload{uploading && <span className="text-xs">...</span>}<input type="file" className="hidden" onChange={handleUpload} /></label>
                </div>
              )}
              {files.length === 0 ? <p className="text-sm text-gray-500">No files uploaded yet.</p> : <div className="space-y-2">{files.map((file) => <FilePreview key={file._id} file={file} canDownload={true} fetchUrl={(f) => filesAPI.download(projectId, f._id).then((r) => { const url = URL.createObjectURL(new Blob([r.data])); return url; }) } onRemove={canEdit && file.owner?._id === user?._id ? () => filesAPI.delete(projectId, file._id).then(() => setFiles((p) => p.filter((f) => f._id !== file._id))) : null} />)}</div>}
            </section>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-5 shadow-soft">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">Members</h3>
              <div className="space-y-2">{(project.members || []).map((m) => <div key={m.user?._id || m._id} className="flex items-center gap-2 text-sm"><span className="font-medium text-gray-800">{m.user?.name || m.name}</span><span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-600">{m.role}</span></div>)}</div>
            </div>
            <Link to={`/projects/${projectId}/analytics`} className="block rounded-2xl border border-blue-100 bg-[#fff5f5] p-5 shadow-soft text-sm font-semibold text-blue-600 hover:bg-blue-50">View analytics →</Link>
          </aside>
        </div>
      </div>
      {shareOpen && <ShareModal project={project} isOpen={shareOpen} onClose={() => setShareOpen(false)} onShared={() => {}} />}
    </div>
  );
};

export default ProjectDetailPage;
