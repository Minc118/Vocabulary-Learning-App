export type { VocabularyWord } from './types';
import type { VocabularyWord } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001';
import { supabase } from './supabase';

function buildApiUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Backend request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function checkBackendConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const result = await fetchApi<{ ok: boolean; service: string }>('/api/health');
    return {
      ok: result.ok,
      message: `${result.service} ready`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Backend connection failed',
    };
  }
}

// ================= AI Features =================

export async function enrichWord(word: string, language: string = 'English'): Promise<Partial<VocabularyWord>> {
  const nativeLanguage = localStorage.getItem('nativeLanguage') || 'Chinese';
  return fetchApi<Partial<VocabularyWord>>('/api/ai/enrich', {
    method: 'POST',
    body: JSON.stringify({ word, language, native_language: nativeLanguage }),
  });
}

export async function bulkEnrichWords(words: any[], language: string = 'English'): Promise<Partial<VocabularyWord>[]> {
  const nativeLanguage = localStorage.getItem('nativeLanguage') || 'Chinese';
  return fetchApi<Partial<VocabularyWord>[]>('/api/ai/enrich-batch', {
    method: 'POST',
    body: JSON.stringify({ words, language, native_language: nativeLanguage }),
  });
}

export async function analyzeText(text: string, language: string = 'English', level: string = 'Intermediate', goal: string = 'General', count: number = 10): Promise<any[]> {
  const nativeLanguage = localStorage.getItem('nativeLanguage') || 'Chinese';
  const res = await fetchApi<{ candidates: any[] }>('/api/import/analyze', {
    method: 'POST',
    body: JSON.stringify({ text, language, level, goal, count, native_language: nativeLanguage }),
  });
  return res.candidates;
}

export async function extractTextFromFile(fileData: string, mimeType: string): Promise<string> {
  const res = await fetchApi<{ text: string }>('/api/import/extract-text', {
    method: 'POST',
    body: JSON.stringify({ fileData, mimeType }),
  });
  return res.text;
}

export async function checkTypo(text: string, typed_word: string): Promise<{ is_typo: boolean, corrected_word: string | null, not_found: boolean }> {
  return fetchApi<{ is_typo: boolean, corrected_word: string | null, not_found: boolean }>('/api/import/check-typo', {
    method: 'POST',
    body: JSON.stringify({ text, typed_word }),
  });
}

// ================= Review System =================

export async function fetchReviewQueue(limit: number = 20): Promise<VocabularyWord[]> {
  const result = await fetchApi<{ items: VocabularyWord[]; count: number }>(`/api/review/queue?limit=${limit}`);
  return result.items;
}

export async function submitReviewAnswer(wordId: string | number, answer: 'again' | 'hard' | 'good' | 'easy'): Promise<VocabularyWord> {
  return fetchApi<VocabularyWord>('/api/review/answer', {
    method: 'POST',
    body: JSON.stringify({ word_id: wordId, answer }),
  });
}

// ================= Words =================

function mapBackendWord(item: any): VocabularyWord {
  return {
    ...item,
    tags: item.tags?.map((t: any) => t.tag?.name || t.name) || [],
    collocations: item.collocations?.map((c: any) => c.phrase) || [],
    synonyms: item.synonyms?.filter((s: any) => s.relation_type === 'synonym').map((s: any) => s.related_word) || [],
    relatedWords: item.synonyms?.filter((s: any) => s.relation_type === 'related').map((s: any) => s.related_word) || [],
  };
}

export async function fetchWords(): Promise<VocabularyWord[]> {
  const result = await fetchApi<{ items: any[]; count: number }>('/api/words');
  return result.items.map(mapBackendWord);
}

export async function fetchWordById(wordId: string | number): Promise<VocabularyWord> {
  const item = await fetchApi<any>(`/api/words/${wordId}`);
  return mapBackendWord(item);
}

export async function createWord(data: Partial<VocabularyWord>): Promise<VocabularyWord> {
  return fetchApi<VocabularyWord>('/api/words', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchWordsByCollection(collectionId: string): Promise<VocabularyWord[]> {
  const result = await fetchApi<{ items: any[]; count: number }>(`/api/words?collection_id=${collectionId}`);
  return result.items.map(mapBackendWord);
}

export async function updateWord(wordId: string | number, data: Partial<VocabularyWord>): Promise<VocabularyWord> {
  return fetchApi<VocabularyWord>(`/api/words/${wordId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteWord(wordId: string | number): Promise<void> {
  return fetchApi<void>(`/api/words/${wordId}`, {
    method: 'DELETE',
  });
}

// ================= Collections =================

export interface Collection {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export async function fetchCollections(): Promise<Collection[]> {
  const result = await fetchApi<{ items: Collection[]; count: number }>('/api/collections');
  return result.items;
}

export async function createCollection(data: Partial<Collection>): Promise<Collection> {
  return fetchApi<Collection>('/api/collections', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ================= Tags =================

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export async function fetchTags(): Promise<Tag[]> {
  const result = await fetchApi<{ items: Tag[]; count: number }>('/api/tags');
  return result.items;
}



export async function fetchStats(): Promise<any> {
  return fetchApi<any>('/api/stats');
}
