import { NextResponse } from 'next/server';
import { getPdfEditorSession, readPdfEditorFile, tokenMatches } from '@/lib/pdf-editor/collabora';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getPdfEditorSession(id);
  const token = new URL(request.url).searchParams.get('access_token');

  if (!session || !tokenMatches(session, token)) {
    return NextResponse.json({ error: 'PDF editor session not found.' }, { status: 404 });
  }

  const bytes = await readPdfEditorFile(session);

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(bytes.byteLength),
      'Content-Disposition': `attachment; filename="${session.fileName.replace(/"/g, '')}"`,
      'Cache-Control': 'no-store',
    },
  });
}
