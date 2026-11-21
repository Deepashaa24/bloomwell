import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectsAPI, sharingAPI } from '../services/api';
import MarkdownViewer from '../components/MarkdownViewer';
import FilePreview from '../components/FilePreview';

const PublicSharePage = () => {
  const { token } = useParams();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await sharingAPI.getByToken(token);
        const shared = response.data || {};
        setError('');
        if (shared.project) {
          setProject(shared.project);
          if (shared.notes) setNotes(shared.notes);
          if (shared.files) setFiles(shared.files);
        } else if (shared.projectId) {
          const projectRes = await projectsAPI.get(shared.projectId);
          const p = projectRes.data.project || projectRes.data;
          setProject(p);
        } else {
          setError('Project not found with this token.');
        }
      } catch (err) { setError(err.response?.data?.message || 'This share link is invalid or has expired.'); }
      finally { setLoading(false); }
    };
    if (token) load();
  }, [token]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;
  if (error || !project) return <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] p-6"><div className="app-surface max-w-md p-8 text-center"><h1 className="font-display text-2xl font-semibold text-red-600">{error ? 'Link unavailable' : 'Project not found'}</h1><p className="mt-3 text-sm text-[var(--color-muted)]">{error || 'This share link is invalid or expired.'}</p><p className="mt-2 text-xs text-gray-400">Please check the link or contact the project owner for access.</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">Shared project</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-gray-800">{project.name}</h1>
          <p className="mt-2 text-sm text-gray-600">{project.description}</p>
        </header>
        {notes.length > 0 && <section className="mb-6 rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft"><h2 className="mb-4 font-semibold text-gray-800">Notes</h2><div className="space-y-4">{notes.map((note) => <div key={note._id} className="border-b border-blue-100 pb-4 last:border-0"><p className="font-semibold text-gray-800">{note.title}</p><MarkdownViewer content={note.content} /></div>)}</div></section>}
        {files.length > 0 && <section className="mb-6 rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft"><h2 className="mb-4 font-semibold text-gray-800">Files</h2><div className="space-y-2">{files.map((file) => <FilePreview key={file._id} file={file} canDownload={true} />)}</div></section>}
        {notes.length === 0 && files.length === 0 && <div className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-12 text-center"><p className="text-gray-500">No shared content.</p></div>}
      </div>
    </div>
  );
};

export default PublicSharePage;
