// src/types/index.ts

export interface AnalysisResult {
  sessionId:    string;
  resumeId:     string;
  atsScore:     number;
  keywordScore: number;
  formatScore:  number;
  readability:  number;
  skills: {
    technical: string[];
    soft:      string[];
    tools:     string[];
  };
  sections: {
    name:  string;
    score: number;
    tip:   string;
  }[];
  suggestions: string[];
  improvedText?: string;
}

export interface JobMatchResult {
  matchPercent:   number;
  missingSkills:  string[];
  matchedSkills:  string[];
  recommendation: string;
}

export interface ResumeFile {
  id:         string;
  name:       string;
  size:       number;
  type:       "pdf" | "docx";
  uploadedAt: string;
}

export interface SessionState {
  sessionId:    string | null;
  resumeFile:   ResumeFile | null;
  analysisResult: AnalysisResult | null;
  jobMatchResult: JobMatchResult | null;
  isAnalyzing:  boolean;
  error:        string | null;
}

export type ThemeMode = "dark" | "light";