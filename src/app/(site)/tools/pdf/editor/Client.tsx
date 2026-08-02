'use client';

import { useState, type ChangeEvent } from 'react';
import { Download, ExternalLink, FileText, RefreshCw, Server, Upload } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import {
  ToolActionBar,
  ToolEmptyState,
  ToolField,
  ToolMetric,
  ToolPanel,
  ToolStatus,
  ToolUploadZone,
} from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';

interface EditorSession {
  id: string;
  fileName: string;
  size: number;
  editorUrl: string;
  downloadUrl: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const sizeIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** sizeIndex).toFixed(sizeIndex === 0 ? 0 : 1)} ${units[sizeIndex]}`;
}

export default function PDFEditor() {
  const [session, setSession] = useToolState<EditorSession | null>('pdf-editor', 'session', null);
  const [selectedFileName, setSelectedFileName] = useToolState('pdf-editor', 'selectedFileName', '');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  const startEditor = async (file: File) => {
    setIsStarting(true);
    setError('');
    setSession(null);
    setSelectedFileName(file.name);

    try {
      const body = new FormData();
      body.append('file', file);

      const response = await fetch('/api/pdf-editor/sessions', {
        method: 'POST',
        body,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to start the PDF editor.');
      }

      setSession(payload as EditorSession);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to start the PDF editor.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Choose a PDF file.');
      return;
    }

    void startEditor(file);
  };

  return (
    <ToolLayout
      title="PDF Editor"
      description="Edit PDFs with a LibreOffice-compatible online editor, using a WOPI session instead of simple browser overlays."
      category="pdf"
      processingLabel="Server-backed editing"
      privacyNote="PDF Editor sends the selected file to your configured FreeWebTools WOPI host and Collabora/LibreOffice Online server so the document can be edited and saved."
    >
      <div className="space-y-6">
        <ToolStatus tone="warning">
          This editor requires a running Collabora/LibreOffice Online server, a public WOPI callback URL,
          and private Blob storage. Configure <span className="font-mono">COLLABORA_URL</span>,{' '}
          <span className="font-mono">WOPI_PUBLIC_BASE_URL</span>, and a private Vercel Blob store before
          using it in production.
        </ToolStatus>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <ToolPanel
            title="LibreOffice-backed editor"
            description="Upload a PDF to open it in the embedded office editor. Use the editor's save command, then download the updated PDF."
            actions={
              session ? (
                <ToolActionBar>
                  <a href={session.downloadUrl} className="btn btn-secondary" download>
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                  <a href={session.editorUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                    <ExternalLink className="h-4 w-4" />
                    New tab
                  </a>
                </ToolActionBar>
              ) : null
            }
            className="min-h-[640px]"
          >
            {session ? (
              <div className="overflow-hidden rounded-md border bg-background">
                <iframe
                  title={`Edit ${session.fileName}`}
                  src={session.editorUrl}
                  className="h-[70dvh] min-h-[620px] w-full"
                  allow="clipboard-read; clipboard-write; fullscreen"
                />
              </div>
            ) : (
              <ToolEmptyState
                icon={isStarting ? <RefreshCw className="h-8 w-8 animate-spin" /> : <FileText className="h-8 w-8" />}
                title={isStarting ? 'Starting editor session' : 'No PDF loaded'}
                description={
                  isStarting
                    ? 'Creating a WOPI session and asking Collabora for the editor URL.'
                    : 'Upload a PDF to create a temporary editing session.'
                }
                action={
                  <label className="btn btn-primary cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Upload PDF
                    <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                }
              />
            )}
          </ToolPanel>

          <aside className="space-y-6">
            <ToolPanel title="Document">
              <div className="grid gap-3">
                <ToolMetric label="Status" value={session ? 'Open' : isStarting ? 'Starting' : 'Ready'} />
                <ToolMetric label="File" value={session?.fileName || selectedFileName || 'None'} />
                <ToolMetric label="Size" value={session ? formatBytes(session.size) : '-'} />
              </div>
            </ToolPanel>

            <ToolPanel title="Open another PDF">
              <ToolUploadZone
                title="Choose PDF"
                description="Starts a new LibreOffice-backed editing session."
                icon={<Upload className="h-8 w-8" />}
                inputProps={{
                  type: 'file',
                  accept: 'application/pdf,.pdf',
                  disabled: isStarting,
                  onChange: handleFileChange,
                }}
              />
            </ToolPanel>

            <ToolPanel title="Runtime setup">
              <div className="space-y-4 text-sm text-muted-foreground">
                <ToolField label="Required server">
                  <p>
                    Use Collabora Online/CODE or another LibreOffice Online-compatible server that exposes
                    WOPI discovery.
                  </p>
                </ToolField>
                <ToolField label="Required environment">
                  <div className="space-y-1 font-mono text-xs">
                    <p>COLLABORA_URL=https://office.yourdomain.com</p>
                    <p>WOPI_PUBLIC_BASE_URL=https://utils-hub.vercel.app</p>
                    <p>BLOB_READ_WRITE_TOKEN=...</p>
                  </div>
                </ToolField>
                <ToolStatus tone="info">
                  Connect a private Vercel Blob store for production. Collabora must also be able to reach
                  this app&apos;s WOPI endpoints from its server.
                </ToolStatus>
              </div>
            </ToolPanel>

            {error && (
              <ToolStatus
                tone={
                  error.includes('COLLABORA_URL') ||
                  error.includes('Collabora server') ||
                  error.includes('Blob storage')
                    ? 'warning'
                    : 'error'
                }
              >
                <span className="font-medium">Editor unavailable:</span> {error}
              </ToolStatus>
            )}

            <ToolStatus tone="info">
              <Server className="mr-1 inline h-4 w-4" />
              This is no longer browser-only processing. For private documents, run the WOPI host and
              Collabora server under infrastructure you control.
            </ToolStatus>
          </aside>
        </div>
      </div>
    </ToolLayout>
  );
}
