 // 这个类型定义了“前端期待从后端拿到什么样的数据结构”。
// 它的作用非常重要：
// 1. 让页面开发时有明确的数据契约
// 2. 如果后端字段变了，TypeScript 能及时提醒
// 3. 帮你建立“前后端接口要对齐”的意识
export interface VocabularyWord {
  id: number;
  word: string;
  translation: string;
  pos: string;
  language: string;
  tags: string[];
  nextReview: string;
  mastery: 'Learning' | 'Familiar' | 'Mastered';
  definition: string;
  examples: string[];
  collocations: string[];
  synonyms: string[];
  relatedWords: string[];
  collection: string;
  source: string;
  addedAt: string;
  reviewCount: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001';

function buildApiUrl(path: string) {
  // 把基础地址和具体路径拼起来。
  // 这样做的好处是：后续如果后端地址改变，只需要改环境变量，不需要全项目替换。
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}

async function parseJsonResponse<T>(path: string): Promise<T> {
  // 这是一个“底层通用请求函数”。
  // 当前项目里所有请求都会先走这里，这样错误处理逻辑可以统一。
  const response = await fetch(buildApiUrl(path));

  if (!response.ok) {
    // 如果 HTTP 状态码不是 2xx，直接抛错。
    // 这样页面层就能统一进入 error 分支，而不是误以为请求成功。
    throw new Error(`Backend request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function checkBackendConnection(): Promise<{ ok: boolean; message: string }> {
  // 这个函数专门用来做“连接测试”。
  // 它不拿业务数据，只测试后端 health endpoint 是否可用。
  try {
    const result = await parseJsonResponse<{ ok: boolean; service: string; items: number }>('/api/health');
    return {
      ok: result.ok,
      message: `${result.service} ready · ${result.items} fixed words available`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Backend connection failed',
    };
  }
}

export async function fetchWords(): Promise<VocabularyWord[]> {
  // 获取词汇列表，对应词汇总览页。
  const result = await parseJsonResponse<{ items: VocabularyWord[]; count: number }>('/api/words');
  return result.items;
}

export async function fetchWordById(wordId: number): Promise<VocabularyWord> {
  // 获取单词详情，对应详情页。
  return parseJsonResponse<VocabularyWord>(`/api/words/${wordId}`);
}
