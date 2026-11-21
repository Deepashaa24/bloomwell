import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, Image, FileSpreadsheet, File, Upload, X, Plus } from 'lucide-react';
import { projectsAPI, notesAPI, filesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MarkdownEditor } from '../components/MarkdownViewer';
import { toast } from 'sonner';

const getExt = (name) => (name?.split('.').pop() || '').toLowerCase();
const fileIcons = {
  pdf: FileText, doc: FileText, docx: FileText,
  xls: FileSpreadsheet, xlsx: FileSpreadsheet, csv: FileSpreadsheet,
  png: Image, jpg: Image, jpeg: Image, gif: Image, svg: Image, webp: Image,
};
const getIcon = (name) => fileIcons[getExt(name)] || File;
const formatSize = (bytes) => { if (!bytes) return ''; if (bytes < 1024) return `${bytes} B`; if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / 1048576).toFixed(1)} MB`; };

const NewProjectPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialNote, setInitialNote] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [filesError, setFilesError] = useState('');
  const [noteCreated, setNoteCreated] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      setNoteError('');
      setFilesError('');
      setNoteCreated(false);
      setFilesUploaded(false);

      const response = await projectsAPI.create({ name, description });
      const project = response.data.project || response.data;
      setProjectId(project._id);
      setCreated(true);
      toast.success('Project created');

      if (initialNote.trim()) {
        setNotesLoading(true);
        try {
          await notesAPI.create(project._id, { title: 'Welcome', content: initialNote });
          setNoteCreated(true);
          toast.success('Initial note added');
        } catch (err) {
          setNoteError(err.response?.data?.message || 'Could not create note');
          toast.error('Could not create initial note');
        } finally {
          setNotesLoading(false);
        }
      }

      if (selectedFiles.length > 0) {
        setFilesLoading(true);
        try {
          const uploadPromises = selectedFiles.map((file) => filesAPI.upload(project._id, file));
          await Promise.all(uploadPromises);
          setFilesUploaded(true);
          toast.success(`${selectedFiles.length} file(s) uploaded`);
        } catch (err) {
          setFilesError(err.response?.data?.message || 'Could not upload all files');
          toast.error('Could not upload all files');
        } finally {
          setFilesLoading(false);
        }
      }

      setTimeout(() => navigate(`/projects/${project._id}`), 1500);
    } catch {
      toast.error('Could not create project');
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] p-6">
        <div className="app-surface max-w-md p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 text-blue-500" size={40} />
          <h1 className="font-display text-2xl font-semibold">Project created</h1>
          {noteCreated && <p className="mt-2 text-sm text-green-600">Note added successfully.</p>}
          {!noteCreated && noteError && <p className="mt-2 text-sm text-red-500">{noteError}</p>}
          {filesUploaded && <p className="mt-1 text-sm text-green-600">All files uploaded.</p>}
          {!filesUploaded && filesError && <p className="mt-1 text-sm text-red-500">{filesError}</p>}
          {notesLoading && <p className="mt-2 text-sm text-blue-600">Adding note...</p>}
          {filesLoading && <p className="mt-1 text-sm text-blue-600">Uploading files...</p>}
          <p className="mt-4 text-sm text-[var(--color-muted)]">Redirecting to project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <Link to="/projects" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"><ArrowLeft size={16} />Projects</Link>
        <header className="mb-8"><p className="text-xs font-semibold uppercase tracking-wider text-blue-500">New</p><h1 className="font-display text-3xl font-bold text-gray-800">Create project</h1></header>
        <form onSubmit={createProject} className="space-y-4 rounded-2xl border border-blue-100 bg-[#fff5f5] p-6 shadow-soft">
          <div><label className="block text-sm font-medium text-gray-700">Project name</label><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q3 Health Tracking" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this project about?" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500" /></div>
          <div className="border-t border-blue-100 pt-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">Initial note (optional)</h2>
            <MarkdownEditor value={initialNote} onChange={setInitialNote} placeholder="Write a welcome note for this project in Markdown..." />
          </div>
          <div className="border-t border-blue-100 pt-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">Upload files (optional)</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50"><Plus size={16} />Add files</button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
              <span className="self-center text-xs text-gray-400">{selectedFiles.length} file(s) selected</span>
            </div>
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><FileIcon name={file.name} /></div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-800">{file.name}</p><p className="text-xs text-gray-500">{formatSize(file.size)}</p></div>
                    <button type="button" onClick={() => removeFile(index)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading || notesLoading || filesLoading} className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-[#fff5f5] disabled:opacity-50">{loading ? 'Creating...' : notesLoading ? 'Adding note...' : filesLoading ? 'Uploading files...' : 'Create project'}</button>
          {noteError && <p className="text-sm text-red-500">{noteError}</p>}
          {filesError && <p className="text-sm text-red-500">{filesError}</p>}
        </form>
      </div>
    </div>
  );
};

const FileIcon = ({ name }) => {
  const Icon = getIcon(name);
  return <Icon size={18} />;
};

export default NewProjectPage;
