
export interface Meaning {
  type: string;
  definition_tr: string;
  example_en: string;
  example_tr: string;
}

export interface WordFamily {
  noun?: string | null;
  verb?: string | null;
  adjective?: string | null;
  adverb?: string | null;
}

export interface IdiomSlang {
  phrase: string;
  meaning_tr: string;
}

export interface DictionaryEntry {
  word: string;
  pronunciation: string;
  level: string;
  frequency_score: number;
  frequency_label: string;
  correction?: string | null;
  word_family?: WordFamily;
  idioms_slang?: IdiomSlang[];
  collocations: string[];
  synonyms: string[];
  meanings: Meaning[];
}

export interface WordOfTheDay {
  word: string;
  definition_tr: string;
  context: string;
}

export interface SearchState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: DictionaryEntry | null;
  error: string | null;
}

export interface HistoryItem {
  word: string;
  timestamp: number;
  frequency_score: number;
  part_of_speech: string;
}

export interface FavoriteItem {
  word: string;
  part_of_speech: string;
  frequency_score: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  accentColor: string;
  tts_accent: 'en-US' | 'en-GB';
  uiDensity: '14px' | '15px' | '16px';
  showMorphology: boolean;
  showFrequency: boolean;
  showIdioms: boolean;
}

// --- Writing Coach Types ---

export interface GrammarError {
  type: string;
  error_text: string;
  explanation: string;
  suggestion: string;
}

export interface GrammarAnalysis {
  analysis_status: string;
  overall_summary: string;
  tone: string;
  errors: GrammarError[];
  suggested_revision: string;
}