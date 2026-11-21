import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, FileUp, FileText, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { projectsAPI, notesAPI, filesAPI, membersAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarkdownViewer from '../components/MarkdownViewer';

const COLORS = ['#800020', '#E2B4BD', '#D89FAA', '#8E626C', '#70464F', '#3A2029'];

const ProjectAnalyticsPage = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [noteData, setNoteData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [projectRes, statsRes, activityRes, notesRes, membersRes] = await Promise.all([
          projectsAPI.get(projectId),
          analyticsAPI.getProjectStats(projectId),
          analyticsAPI.getActivity(projectId, '30'),
          notesAPI.list(projectId),
          membersAPI.list(projectId),
        ]);
        setProject(projectRes.data.project || projectRes.data);
        setStats(statsRes.data.stats || statsRes.data || null);
        const activities = activityRes.data.activities || activityRes.data || [];
        setActivityData(activities.map((a) => ({ name: new Date(a.date || a.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }), notes: a.notes || 0, files: a.files || 0 })));
        const notes = notesRes.data.notes || notesRes.data || [];
        setNoteData([
          { name: 'Total', value: notes.length },
          { name: 'With content', value: notes.filter((n) => n.content).length },
          { name: 'Empty', value: notes.filter((n) => !n.content).length },
        ]);
        setMemberData((membersRes.data.members || membersRes.data || []).map((m) => ({ name: m.user?.name || m.name, role: m.role })));
        setPageError('');
      } catch (err) { setPageError(err.response?.data?.message || 'Could not load analytics.'); }
      finally { setLoading(false); }
    };
    load();
  }, [projectId]);

  const totalContributors = stats?.totalContributors || memberData.length;
  const totalNotes = stats?.totalNotes || noteData.find((d) => d.name === 'Total')?.value || 0;
  const totalFiles = stats?.totalFiles || stats?.fileCount || 0;

  if (pageError) return <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] p-6"><div className="app-surface max-w-md p-8 text-center"><p className="text-red-500 font-semibold text-lg">Error</p><p className="mt-3 text-sm text-[var(--color-muted)]">{pageError}</p></div></div>;
  if (loading || !project) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link to={`/projects/${projectId}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"><ArrowLeft size={16} />Back to project</Link>
        <header className="mb-8"><p className="text-xs font-semibold uppercase tracking-wider text-blue-500">Analytics</p><h1 className="font-display text-3xl font-bold text-gray-800">{project.name}</h1></header>
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[
            { label: 'Contributors', value: totalContributors, icon: Users },
            { label: 'Notes', value: totalNotes, icon: FileText },
            { label: 'Files', value: totalFiles, icon: FileUp },
            { label: 'Activity', value: activityData.length, icon: Activity },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-5 shadow-soft">
              <div className="flex items-center gap-2"><div className="rounded-lg bg-blue-50 p-1.5 text-blue-600"><Icon size={16} /></div><p className="text-xs font-medium text-gray-500">{label}</p></div>
              <p className="mt-2 font-display text-3xl font-bold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
            <h2 className="mb-4 font-semibold text-gray-800">Activity trend (30 days)</h2>
            {activityData.length > 0 ? <ResponsiveContainer width="100%" height={260}><LineChart data={activityData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Legend /></LineChart></ResponsiveContainer> : <p className="py-8 text-center text-sm text-gray-500">No activity data yet.</p>}</section>
          <section className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
            <h2 className="mb-4 font-semibold text-gray-800">Notes breakdown</h2>
            {noteData.some((d) => d.value > 0) ? <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={noteData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}><Cell name="Total" fill={COLORS[0]} /><Cell name="With content" fill={COLORS[1]} /><Cell name="Empty" fill={COLORS[2]} /></Pie></PieChart></ResponsiveContainer> : <p className="py-8 text-center text-sm text-gray-500">No notes yet.</p>}</section>
          <section className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
            <h2 className="mb-4 font-semibold text-gray-800">Role distribution</h2>
            {memberData.length > 0 ? <ResponsiveContainer width="100%" height={260}><BarChart data={[{ name: 'Members', admin: memberData.filter((m) => m.role === 'admin').length, editor: memberData.filter((m) => m.role === 'editor').length, viewer: memberData.filter((m) => m.role === 'viewer').length }]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="admin" fill="#800020" /><Bar dataKey="editor" fill="#E2B4BD" /><Bar dataKey="viewer" fill="#D89FAA" /></BarChart></ResponsiveContainer> : <p className="py-8 text-center text-sm text-gray-500">No members yet.</p>}</section>
          <section className="rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
            <h2 className="mb-4 font-semibold text-gray-800">Recent notes</h2>
            <div className="space-y-2">{(project.notes || []).slice(0, 5).map((note) => <div key={note._id} className="rounded-lg border border-blue-100 p-3"><p className="text-sm font-semibold text-gray-800">{note.title}</p><MarkdownViewer content={note.content?.slice(0, 200)} /></div>)}</div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalyticsPage;
