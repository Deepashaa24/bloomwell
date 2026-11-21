import { useEffect, useState } from 'react';
import { Plus, FolderOpen, Search, Trash2, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shareProject, setShareProject] = useState(null);
  const [error, setError] = useState('');
  const [deleteProject, setDeleteProject] = useState(null);

  const load = async () => {
    try {
      const response = await projectsAPI.list();
      setProjects(response.data.projects || response.data || []);
      setError('');
    } catch (err) { setProjects([]); setError(err.response?.data?.message || 'Could not load projects.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = projects.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));
  const isOwner = (p) => p.owner?._id === user?._id || p.owner === user?._id;

  const handleDeleteProject = async () => {
    if (!deleteProject) return;
    try {
      await projectsAPI.delete(deleteProject._id);
      toast.success('Project deleted');
      setProjects((prev) => prev.filter((p) => p._id !== deleteProject._id));
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete project'); }
    finally { setDeleteProject(null); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-500">Collaboration</p>
            <h1 className="font-display text-3xl font-bold text-gray-800">Projects</h1>
            <p className="mt-2 text-sm text-gray-600">Organize and share cycle health data with your team.</p>
          </div>
          <button type="button" onClick={() => navigate('/projects/new')} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-[#fff5f5] shadow-soft hover:bg-blue-600"><Plus size={16} />New project</button>
        </header>
        <div className="mb-6 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="w-full rounded-xl border border-gray-300 bg-[#fff5f5] py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        {loading ? <div className="animate-pulse space-y-4"><div className="h-32 rounded-2xl bg-blue-100" /><div className="h-32 rounded-2xl bg-blue-100" /></div> : error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><p className="font-semibold text-red-700">Failed to load projects</p><p className="mt-1 text-sm text-red-600">{error}</p></div> : filtered.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-12 text-center"><FolderOpen className="mx-auto mb-4 text-gray-400" size={48} /><h3 className="font-semibold text-gray-800">No projects yet</h3><p className="mt-1 text-sm text-gray-500">Create a project to start collaborating.</p></div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((project) => (
              <div key={project._id}>
                <Link to={`/projects/${project._id}`} className="group block rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><h3 className="font-semibold text-gray-800 group-hover:text-blue-600">{project.name}</h3>{isOwner(project) && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">Owner</span>}</div>
                      <p className="mt-1 text-sm text-gray-500">{project.description || 'No description'}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                        <span>{project.members?.length || 0} members</span>
                        {project.updatedAt && <span>Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="flex justify-end px-2 pt-1 gap-2">
                  <button type="button" onClick={() => setShareProject(project)} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50">Share</button>
                  {isOwner(project) && (
                    <button type="button" onClick={() => setDeleteProject(project)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
                      <Trash2 className="inline-block mr-1" size={10} />Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {shareProject && <ShareModal project={shareProject} isOpen={!!shareProject} onClose={() => setShareProject(null)} onShared={() => {}} />}
        {deleteProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
              <h3 className="mb-2 text-center text-xl font-bold text-gray-800">Delete project?</h3>
              <p className="mb-6 text-center text-sm text-gray-600">This will permanently delete "{deleteProject.name}" and all its notes, files, and members. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteProject(null)} className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleDeleteProject} className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
