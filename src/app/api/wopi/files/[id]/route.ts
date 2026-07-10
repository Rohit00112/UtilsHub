import { NextResponse } from 'next/server';
import { getPdfEditorSession, getPublicBaseUrl, tokenMatches } from '@/lib/pdf-editor/collabora';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getPdfEditorSession(id);
  const token = new URL(request.url).searchParams.get('access_token');

  if (!session || !tokenMatches(session, token)) {
    return NextResponse.json({ error: 'WOPI file not found.' }, { status: 404 });
  }

  return NextResponse.json({
    BaseFileName: session.fileName,
    OwnerId: 'freewebtools',
    Size: session.size,
    UserId: 'freewebtools-user',
    UserFriendlyName: 'FreeWebTools user',
    UserCanWrite: true,
    UserCanNotWriteRelative: true,
    SupportsUpdate: true,
    LastModifiedTime: session.updatedAt,
    PostMessageOrigin: getPublicBaseUrl(request),
  });
}
