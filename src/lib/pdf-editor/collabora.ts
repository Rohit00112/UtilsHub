import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { del, get, put } from '@vercel/blob';

export const pdfEditorMaxBytes = Number(process.env.PDF_EDITOR_MAX_BYTES || 4_000_000);
const sessionTtlSeconds = Number(process.env.PDF_EDITOR_SESSION_TTL_SECONDS || 60 * 60);
const blobPrefix = (process.env.PDF_EDITOR_BLOB_PREFIX || 'pdf-editor').replace(/^\/+|\/+$/g, '');

export interface PdfEditorSession {
  id: string;
  tokenHash: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  storage: 'blob' | 'filesystem';
}

export interface CreatedPdfEditorSession {
  session: PdfEditorSession;
  token: string;
}

const storageRoot =
  process.env.PDF_EDITOR_STORAGE_DIR || path.join(os.tmpdir(), 'freewebtools-pdf-editor');

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function safeFileName(name: string) {
  const cleaned = name.replace(/[^\w.\-() ]+/g, '_').trim();
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned || 'document'}.pdf`;
}

function localSessionMetaPath(id: string) {
  return path.join(storageRoot, `${id}.json`);
}

function localFilePath(id: string) {
  return path.join(storageRoot, `${id}.pdf`);
}

function blobSessionMetaPath(id: string) {
  return `${blobPrefix}/${id}/session.json`;
}

function blobFilePath(id: string) {
  return `${blobPrefix}/${id}/document.pdf`;
}

function assertSessionId(id: string) {
  if (!/^[a-f0-9]{32}$/.test(id)) {
    throw new Error('Invalid PDF editor session id.');
  }
}

async function ensureStorageRoot() {
  await fs.mkdir(storageRoot, { recursive: true });
}

function blobStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function shouldUseBlobStorage() {
  const configured = blobStorageConfigured();

  if (!configured && process.env.VERCEL) {
    throw new Error(
      'Private Vercel Blob storage is not configured. Connect a private Blob store to this project.'
    );
  }

  return configured;
}

function nextExpiry() {
  return new Date(Date.now() + sessionTtlSeconds * 1000).toISOString();
}

async function writeBlobSessionMetadata(session: PdfEditorSession) {
  await put(blobSessionMetaPath(session.id), JSON.stringify(session), {
    access: 'private',
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: 'application/json',
  });
}

async function deletePdfEditorSession(session: PdfEditorSession) {
  if (session.storage === 'blob') {
    await del([blobFilePath(session.id), blobSessionMetaPath(session.id)]);
    return;
  }

  await Promise.all([
    fs.rm(localFilePath(session.id), { force: true }),
    fs.rm(localSessionMetaPath(session.id), { force: true }),
  ]);
}

export async function createPdfEditorSession(file: File): Promise<CreatedPdfEditorSession> {
  const bytes = Buffer.from(await file.arrayBuffer());

  if (bytes.byteLength === 0) {
    throw new Error('Upload a non-empty PDF file.');
  }

  if (bytes.byteLength > pdfEditorMaxBytes) {
    throw new Error(`PDF is larger than the ${Math.round(pdfEditorMaxBytes / 1024 / 1024)} MB limit.`);
  }

  if (bytes.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error('The uploaded file is not a valid PDF.');
  }

  const id = randomBytes(16).toString('hex');
  const token = randomBytes(32).toString('base64url');
  const now = new Date().toISOString();
  const fileName = safeFileName(file.name || 'document.pdf');
  const storage = shouldUseBlobStorage() ? 'blob' : 'filesystem';
  const session: PdfEditorSession = {
    id,
    tokenHash: hashToken(token),
    fileName,
    mimeType: file.type || 'application/pdf',
    size: bytes.byteLength,
    createdAt: now,
    updatedAt: now,
    expiresAt: nextExpiry(),
    storage,
  };

  if (storage === 'blob') {
    try {
      await put(blobFilePath(id), bytes, {
        access: 'private',
        allowOverwrite: false,
        cacheControlMaxAge: 60,
        contentType: 'application/pdf',
      });
      await writeBlobSessionMetadata(session);
    } catch (error) {
      await del([blobFilePath(id), blobSessionMetaPath(id)]).catch(() => undefined);
      throw error;
    }
  } else {
    await ensureStorageRoot();
    await fs.writeFile(localFilePath(id), bytes);
    await fs.writeFile(localSessionMetaPath(id), JSON.stringify(session, null, 2));
  }

  return { session, token };
}

export async function getPdfEditorSession(id: string) {
  assertSessionId(id);

  let session: PdfEditorSession | null = null;

  if (shouldUseBlobStorage()) {
    const result = await get(blobSessionMetaPath(id), {
      access: 'private',
      useCache: false,
    });

    if (result?.statusCode === 200) {
      const raw = await new Response(result.stream).text();
      session = JSON.parse(raw) as PdfEditorSession;
    }
  } else {
    try {
      const raw = await fs.readFile(localSessionMetaPath(id), 'utf8');
      session = JSON.parse(raw) as PdfEditorSession;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  if (!session) return null;

  if (Date.parse(session.expiresAt) <= Date.now()) {
    await deletePdfEditorSession(session);
    return null;
  }

  return session;
}

export async function readPdfEditorFile(session: PdfEditorSession) {
  if (session.storage === 'blob') {
    const result = await get(blobFilePath(session.id), {
      access: 'private',
      useCache: false,
    });

    if (!result || result.statusCode !== 200) {
      throw new Error('The PDF file for this editor session was not found.');
    }

    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }

  return fs.readFile(localFilePath(session.id));
}

export async function writePdfEditorFile(session: PdfEditorSession, bytes: Buffer) {
  if (bytes.byteLength === 0) {
    throw new Error('Collabora returned an empty PDF file.');
  }

  if (bytes.byteLength > pdfEditorMaxBytes) {
    throw new Error(`Edited PDF is larger than the ${Math.round(pdfEditorMaxBytes / 1024 / 1024)} MB limit.`);
  }

  const updated: PdfEditorSession = {
    ...session,
    size: bytes.byteLength,
    updatedAt: new Date().toISOString(),
    expiresAt: nextExpiry(),
  };

  if (session.storage === 'blob') {
    await put(blobFilePath(session.id), bytes, {
      access: 'private',
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: 'application/pdf',
    });
    await writeBlobSessionMetadata(updated);
  } else {
    await fs.writeFile(localFilePath(session.id), bytes);
    await fs.writeFile(localSessionMetaPath(session.id), JSON.stringify(updated, null, 2));
  }

  return updated;
}

export function tokenMatches(session: PdfEditorSession, token: string | null) {
  if (!token) return false;

  const expected = Buffer.from(session.tokenHash, 'hex');
  const actual = Buffer.from(hashToken(token), 'hex');
  return expected.byteLength === actual.byteLength && timingSafeEqual(expected, actual);
}

export function getCollaboraBaseUrl() {
  return (process.env.COLLABORA_URL || process.env.NEXT_PUBLIC_COLLABORA_URL || '').replace(/\/$/, '');
}

export function getPublicBaseUrl(request: Request) {
  const configured = process.env.WOPI_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');

  const forwardedProto = request.headers.get('x-forwarded-proto') || 'http';
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');

  return new URL(request.url).origin;
}

function getAttribute(source: string, name: string) {
  const match = source.match(new RegExp(`${name}="([^"]+)"`));
  return match?.[1] || '';
}

export function findCollaboraPdfActionUrl(discoveryXml: string) {
  const override = process.env.COLLABORA_EDITOR_URL;
  if (override) return override;

  const appBlocks = Array.from(discoveryXml.matchAll(/<app\b[^>]*>[\s\S]*?<\/app>/g)).map((match) => match[0]);
  const candidates = appBlocks.flatMap((app) =>
    Array.from(app.matchAll(/<action\b[^>]*\/?>/g)).map((match) => ({
      ext: getAttribute(match[0], 'ext'),
      name: getAttribute(match[0], 'name'),
      url: getAttribute(match[0], 'urlsrc'),
    }))
  );

  const pdfCandidates = candidates.filter((candidate) => candidate.ext === 'pdf' && candidate.url);
  return (
    pdfCandidates.find((candidate) => candidate.name === 'edit')?.url ||
    pdfCandidates.find((candidate) => candidate.name === 'view')?.url ||
    pdfCandidates[0]?.url ||
    ''
  );
}

export async function getCollaboraPdfActionUrl() {
  const collaboraBaseUrl = getCollaboraBaseUrl();
  if (!collaboraBaseUrl) {
    throw new Error('COLLABORA_URL is not configured.');
  }

  let response: Response;

  try {
    response = await fetch(`${collaboraBaseUrl}/hosting/discovery`, {
      cache: 'no-store',
    });
  } catch {
    throw new Error(`Unable to reach the Collabora server at ${collaboraBaseUrl}.`);
  }

  if (!response.ok) {
    throw new Error(`Collabora discovery failed with HTTP ${response.status}.`);
  }

  const discoveryXml = await response.text();
  const discoveredActionUrl = findCollaboraPdfActionUrl(discoveryXml);

  // Collabora discovery commonly advertises HTTPS action URLs.
  // In local/dev setups we may run HTTP only, so force the configured origin.
  let actionUrl = discoveredActionUrl;
  try {
    const configuredOrigin = new URL(collaboraBaseUrl).origin;
    const resolved = new URL(discoveredActionUrl, configuredOrigin);
    const normalized = new URL(resolved.pathname + resolved.search, configuredOrigin);
    actionUrl = normalized.toString();
  } catch {
    actionUrl = discoveredActionUrl;
  }

  if (!actionUrl) {
    throw new Error('The configured Collabora server did not advertise a PDF action.');
  }

  return actionUrl;
}

export function buildCollaboraEditorUrl(actionUrl: string, wopiSrc: string, accessToken: string) {
  const separator = actionUrl.endsWith('?') || actionUrl.endsWith('&') ? '' : actionUrl.includes('?') ? '&' : '?';
  const launchUrl = new URL(`${actionUrl}${separator}WOPISrc=${encodeURIComponent(wopiSrc)}`);
  launchUrl.searchParams.set('access_token', accessToken);
  launchUrl.searchParams.set('access_token_ttl', '0');
  return launchUrl.toString();
}
