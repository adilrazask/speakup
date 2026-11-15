export interface CorrectionItem {
  original: string;
  corrected: string;
  category: string;
  rule: string;
  explanation_simple: string;
  explanation_hindi?: string;
  explanation_telugu?: string;
  severity: "minor" | "major";
}

export interface VocabSuggestion {
  word: string;
  meaning: string;
  example: string;
}

export interface FluencyNotes {
  fillers: string[];
  wpm?: number;
  long_pauses_count?: number;
}

export interface DomainScores {
  grammar: number;
  vocabulary: number;
  fluency: number;
  clarity: number;
  confidence: number;
}

export interface CorrectionCardResponse {
  reply: string;
  corrections: CorrectionItem[];
  better_version: string;
  vocabulary_suggestions: VocabSuggestion[];
  fluency_notes: FluencyNotes;
  scores: DomainScores;
  praise: string;
  next_tip: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  content: string;
  structured_data?: CorrectionCardResponse;
  wpm?: number;
  created_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  current_role: string;
  years_experience: number;
  target_role: string;
  initial_cefr_level: string;
  current_cefr_level: string;
  correction_style: string;
  explanation_lang: string;
}

export interface UserSettings {
  id?: string;
  profile_id?: string;
  tts_voice: string;
  tts_speed: number;
  slow_mode: boolean;
  silence_timeout_ms: number;
  auto_speak_replies: boolean;
  theme: "dark" | "light" | "system";
}
