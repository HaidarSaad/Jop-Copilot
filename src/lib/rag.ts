"use client";

export interface RagSource {
  id: string;
  label: string;
  text: string;
}

interface Chunk {
  text: string;
  sourceId: string;
  sourceLabel: string;
  tokens: string[];
}

interface PersistedRagState {
  signature: string;
  updatedAt: number;
  chunks: Chunk[];
}

const STORAGE_KEY = "jc_rag_state_v1";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .toLowerCase()
    .split(/[^a-z0-9\u0600-\u06ff]+/i)
    .filter(Boolean);
}

function splitIntoChunks(text: string, maxChunkSize = 900): string[] {
  const paragraphs = normalizeText(text).split(/\n{2,}/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs.length > 0 ? paragraphs : [normalizeText(text)]) {
    if (!paragraph) continue;
    const next = current ? `${current} ${paragraph}` : paragraph;
    if (next.length <= maxChunkSize) {
      current = next;
      continue;
    }

    if (current) chunks.push(current);
    if (paragraph.length <= maxChunkSize) {
      current = paragraph;
      continue;
    }

    for (let i = 0; i < paragraph.length; i += maxChunkSize) {
      chunks.push(paragraph.slice(i, i + maxChunkSize));
    }
    current = "";
  }

  if (current) chunks.push(current);
  return chunks;
}

function scoreTokens(queryTokens: string[], chunkTokens: string[]): number {
  if (queryTokens.length === 0 || chunkTokens.length === 0) return 0;
  const chunkSet = new Set(chunkTokens);
  let overlap = 0;
  for (const token of new Set(queryTokens)) {
    if (chunkSet.has(token)) overlap += 1;
  }
  return overlap / Math.sqrt(queryTokens.length * chunkTokens.length);
}

function fingerprint(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function buildSignature(sources: RagSource[]): string {
  return fingerprint(
    sources
      .map(source => `${source.id}:${normalizeText(source.text)}`)
      .join("\n\n---\n\n")
  );
}

function getStorageState(): PersistedRagState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedRagState;
    if (!parsed || !Array.isArray(parsed.chunks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistState(state: PersistedRagState) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

function hydrateState(state: PersistedRagState) {
  store = state.chunks;
  currentSignature = state.signature;
}

function ensureHydrated(): boolean {
  if (store.length > 0) return true;

  const state = getStorageState();
  if (!state) return false;

  hydrateState(state);
  return store.length > 0;
}

let store: Chunk[] = [];
let currentSignature: string | null = null;

export async function indexDocuments(
  sources: RagSource[],
): Promise<number> {
  const usableSources = sources
    .map(source => ({
      ...source,
      text: normalizeText(source.text),
    }))
    .filter(source => source.text.length > 0);

  if (usableSources.length === 0) {
    clearIndex();
    return 0;
  }

  const signature = buildSignature(usableSources);
  const cached = getStorageState();
  if (cached && cached.signature === signature && cached.chunks.length > 0) {
    hydrateState(cached);
    return store.length;
  }

  currentSignature = signature;
  store = [];

  for (const source of usableSources) {
    for (const doc of splitIntoChunks(source.text)) {
      const tokens = tokenize(doc);
      if (tokens.length === 0) continue;
      store.push({
        text: doc,
        sourceId: source.id,
        sourceLabel: source.label,
        tokens,
      });
    }
  }

  persistState({
    signature,
    updatedAt: Date.now(),
    chunks: store,
  });

  return store.length;
}

export async function indexDocument(
  text: string,
): Promise<number> {
  return indexDocuments([{ id: "document", label: "Document", text }]);
}

export async function ensureIndex(
  sources: RagSource[],
): Promise<number> {
  const usableSources = sources.filter(source => normalizeText(source.text).length > 0);
  if (usableSources.length === 0) {
    clearIndex();
    return 0;
  }

  const signature = buildSignature(usableSources);
  if (store.length > 0 && currentSignature === signature) {
    return store.length;
  }

  return indexDocuments(usableSources);
}

export async function retrieveContext(
  query: string,
  k: number = 3,
): Promise<string> {
  if (!ensureHydrated()) return "";

  const queryTokens = tokenize(query);
  const scored = store
    .map(chunk => ({
      text: chunk.text,
      label: chunk.sourceLabel,
      score: scoreTokens(queryTokens, chunk.tokens),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return scored
    .map((s, i) => `[Context ${i + 1}] [Source: ${s.label}] (relevance: ${(s.score * 100).toFixed(0)}%):\n${s.text}`)
    .join("\n\n");
}

export function clearIndex() {
  store = [];
  currentSignature = null;

  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function hasIndex(): boolean {
  if (store.length > 0) return true;
  return ensureHydrated();
}

export function indexStale(sources?: RagSource[]): boolean {
  if (store.length === 0) return true;
  if (!sources) return false;
  const signature = buildSignature(sources.filter(source => normalizeText(source.text).length > 0));
  return currentSignature !== signature;
}
