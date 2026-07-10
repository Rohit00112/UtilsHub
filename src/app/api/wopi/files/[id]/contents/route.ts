import { NextResponse } from 'next/server';
import {
  getPdfEditorSession,
  readPdfEditorFile,
  tokenMatches,
  writePdfEditorFile,
} from '@/lib/pdf-editor/collabora';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getPdfEditorSession(id);
  const token = new URL(request.url).searchParams.get('access_token');

  if (!session || !tokenMatches(session, token)) {
    return NextResponse.json({ error: 'WOPI file not found.' }, { status: 404 });
  }

  const bytes = await readPdfEditorFile(session);

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getPdfEditorSession(id);
  const token = new URL(request.url).searchParams.get('access_token');

  if (!session || !tokenMatches(session, token)) {
    return NextResponse.json({ error: 'WOPI file not found.' }, { status: 404 });
  }

  const body = Buffer.from(await request.arrayBuffer());
  const updated = await writePdfEditorFile(session, body);

  return NextResponse.json({
    LastModifiedTime: updated.updatedAt,
  });
}
