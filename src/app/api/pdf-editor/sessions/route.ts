import { NextResponse } from 'next/server';
import {
  buildCollaboraEditorUrl,
  createPdfEditorSession,
  getCollaboraPdfActionUrl,
  getPublicBaseUrl,
} from '@/lib/pdf-editor/collabora';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Upload a PDF file.' }, { status: 400 });
    }

    if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    const actionUrl = await getCollaboraPdfActionUrl();
    const { session, token } = await createPdfEditorSession(file);
    const publicBaseUrl = getPublicBaseUrl(request);
    const wopiSrc = `${publicBaseUrl}/api/wopi/files/${session.id}`;
    const editorUrl = buildCollaboraEditorUrl(actionUrl, wopiSrc, token);

    return NextResponse.json({
      id: session.id,
      fileName: session.fileName,
      size: session.size,
      editorUrl,
      downloadUrl: `/api/pdf-editor/sessions/${session.id}/contents?access_token=${encodeURIComponent(token)}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start the PDF editor.';
    const status =
      message.includes('COLLABORA_URL') ||
      message.includes('Collabora server') ||
      message.includes('Blob storage')
      ? 503
      : message.includes('Content-Type')
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
