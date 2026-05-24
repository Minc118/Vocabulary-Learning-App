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
  examples: { sentence: string; translation: string }[];
  collocations: string[];
  synonyms: string[];
  relatedWords: string[];
  collection: string;
  source: string;
  addedAt: string;
  reviewCount: number;
}
