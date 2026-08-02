import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

const TOOL_STATE_PREFIX = 'fw:tool:';
const RECENT_TOOLS_KEY = 'fw:recentTools';
const RECENT_TOOLS_MAX = 8;
const SESSION_MIRROR_LIMIT = 200 * 1024;

// Module-scoped memory store. Next.js keeps the module alive across client-side
// navigation, so this survives page switches within the tab session. It also
// holds values that cannot be JSON-serialized (File, Blob, object URLs).
const memoryStore = new Map<string, unknown>();

function sessionKey(toolId: string, field: string) {
  return `${TOOL_STATE_PREFIX}${toolId}:${field}`;
}

function isSerializable(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  const type = typeof value;
  if (type === 'string') {
    // Blob URLs are invalid after a page reload, so keep them in memory only.
    return !(value as string).startsWith('blob:');
  }
  if (type === 'number' || type === 'boolean') return true;
  if (type === 'function' || type === 'symbol' || type === 'bigint') return false;
  if (value instanceof File || value instanceof Blob || value instanceof URL || value instanceof Date) return false;
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return false;
  if (Array.isArray(value)) return value.every(isSerializable);
  if (type === 'object') {
    try {
      return Object.values(value as Record<string, unknown>).every(isSerializable);
    } catch {
      return false;
    }
  }
  return false;
}

function readSession(key: string): unknown {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw == null) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function writeSession(key: string, value: unknown) {
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > SESSION_MIRROR_LIMIT) {
      sessionStorage.removeItem(key);
      return;
    }
    sessionStorage.setItem(key, serialized);
  } catch {
    // Quota or private-mode failures are ignored; in-memory state still works.
  }
}

/**
 * A drop-in `useState` replacement that remembers tool state for the tab session.
 * Serializable values are mirrored to sessionStorage (surviving in-tab reloads);
 * non-serializable values (File, Blob, object URLs) live in a module-level store
 * that survives client-side navigation between pages. Hydration happens after
 * mount so server and client markup never mismatch.
 */
export function useToolState<T>(
  toolId: string,
  field: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const key = sessionKey(toolId, field);
  const [state, setState] = useState<T>(() => {
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  });

  useEffect(() => {
    const restored = memoryStore.get(key);
    if (restored !== undefined) {
      setState(restored as T);
      return;
    }
    const fromSession = readSession(key);
    if (fromSession !== undefined) {
      memoryStore.set(key, fromSession);
      setState(fromSession as T);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setPersistent = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    setState((prev) => {
      const next = typeof action === 'function' ? (action as (prev: T) => T)(prev) : action;
      memoryStore.set(key, next);
      if (isSerializable(next)) {
        writeSession(key, next);
      }
      return next;
    });
  }, [key]);

  return [state, setPersistent];
}

export interface RecentTool {
  id: string;
  at: number;
}

export function recordToolVisit(toolId: string) {
  try {
    const raw = localStorage.getItem(RECENT_TOOLS_KEY);
    const recents: RecentTool[] = raw ? JSON.parse(raw) : [];
    const filtered = recents.filter((entry) => entry.id !== toolId);
    filtered.unshift({ id: toolId, at: Date.now() });
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(filtered.slice(0, RECENT_TOOLS_MAX)));
  } catch {
    // Ignore storage failures.
  }
}

export function getRecentToolIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_TOOLS_KEY);
    if (!raw) return [];
    const recents: RecentTool[] = JSON.parse(raw);
    return recents.map((entry) => entry.id).filter(Boolean);
  } catch {
    return [];
  }
}

export function clearRecentTools() {
  try {
    localStorage.removeItem(RECENT_TOOLS_KEY);
  } catch {
    // Ignore storage failures.
  }
}
