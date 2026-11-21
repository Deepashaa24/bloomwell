import { useEffect, useState } from 'react';
import { FileText, Image, FileSpreadsheet, File, Download, X } from 'lucide-react';

const fileIcons = {
  pdf: FileText,
  doc: FileText, docx: FileText,
  xls: FileSpreadsheet, xlsx: FileSpreadsheet, csv: FileSpreadsheet,
  png: Image, jpg: Image, jpeg: Image, gif: Image, svg: Image, webp: Image,
};

const detectMimeType = (file) => {
  if (file?.mimeType) return file.mimeType;
  if (file?.type) return file.type;
  const name = file?.originalName || file?.name || '';
  const ext = name.split('.').pop().toLowerCase();
  const mimeMap = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', csv: 'text/csv', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp' };
  return mimeMap[ext] || 'application/octet-stream';
};

const getExt = (name) => (name?.split('.').pop() || '').toLowerCase();
const getIconForType = (mimeType, name) => { if (mimeType?.startsWith('image/')) return Image; if (mimeType?.includes('pdf')) return FileText; if (mimeType?.includes('sheet') || mimeType?.includes('excel') || mimeType?.includes('csv')) return FileSpreadsheet; if (mimeType?.includes('word') || mimeType?.includes('document')) return FileText; const ext = getExt(name); return fileIcons[ext] || File; };

const FilePreview = ({ file, onRemove, canDownload = true, fetchUrl }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgUrl, setImgUrl] = useState(null);
  const mimeType = detectMimeType(file);
  const Icon = getIconForType(mimeType, file?.originalName || file?.name);
  const isImage = mimeType.startsWith('image/');
  const directUrl = file?.url || file?.path;

  useEffect(() => {
    if (!isImage || !directUrl || !fetchUrl) { setImgUrl(directUrl || null); return; }
    let cancelled = false;
    const load = async () => {
      try {
        const url = await fetchUrl(file);
        if (!cancelled) setImgUrl(url);
      } catch { setImgError(true); }
    };
    load();
    return () => { cancelled = true; };
  }, [isImage, directUrl, fetchUrl, file?._id]);

  useEffect(() => {
    return () => { if (imgUrl && fetchUrl && directUrl) { /* object URL created by caller */ } };
  }, [imgUrl, fetchUrl]);

  const currentUrl = isImage && fetchUrl ? imgUrl : directUrl;

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-[#fff5f5] p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon size={20} /></div>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-800">{file?.originalName || file?.name || 'Unknown'}</p><p className="text-xs text-gray-500">{file?.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}<span className="text-gray-400"> · {mimeType}</span></p></div>
        <div className="flex items-center gap-1">
          {canDownload && directUrl && <button type="button" onClick={() => fetchUrl ? fetchUrl(file).then((url) => window.open(url, '_blank')).catch(() => window.open(directUrl, '_blank')) : window.open(directUrl, '_blank')} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Download"><Download size={16} /></button>}
          {onRemove && <button type="button" onClick={onRemove} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"><X size={16} /></button>}
        </div>
      </div>
      {isImage && currentUrl && (previewOpen || false) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewOpen(false)}>
          <button type="button" onClick={() => setPreviewOpen(false)} className="absolute top-4 right-4 rounded-full bg-white/90 p-2 hover:bg-white"><X size={20} /></button>
          {imgError ? <p className="text-white">Could not load image</p> : <img src={currentUrl} alt={file?.originalName || file?.name} className="max-h-[80vh] max-w-[80vw] rounded-xl object-contain" onError={() => setImgError(true)} />}
        </div>
      )}
      {isImage && currentUrl && (
        <button type="button" onClick={() => setPreviewOpen(true)} className="mt-1 block w-full text-left">
          {imgError ? <p className="text-xs text-gray-400">Image failed to load</p> : <img src={currentUrl} alt={file?.originalName || file?.name} className="h-40 w-full max-w-xs rounded-lg object-cover" onError={() => setImgError(true)} />}
        </button>
      )}
    </>
  );
};

export default FilePreview;
