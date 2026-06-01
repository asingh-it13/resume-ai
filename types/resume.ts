export interface ResumeExperience {
  title: string;
  company: string;
  period: string;
  location?: string;
  bullets: string[];
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  year?: string;
}

export interface ResumeData {
  rawText: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  targetRole?: string;
  summary?: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  certifications: string[];
  wordCount: number;
  pageEstimate: number;
}

export interface ATSIssue {
  type: "error" | "warning" | "info";
  category: string;
  title: string;
  location: string;
  description: string;
  suggestion: string;
  scoreGain: number;
}

export interface KeywordMatch {
  keyword: string;
  status: "found" | "missing" | "weak";
  foundAs?: string;
  suggestion?: string;
}

export interface ATSSystemScore {
  system: string;
  score: number;
  issues: string[];
}

export interface ParserField {
  field: string;
  value: string;
  confidence: "high" | "medium" | "low" | "not_found";
}

export interface AnalysisResult {
  atsScore: number;
  keywordScore: number;
  formattingScore: number;
  readabilityScore: number;
  skillsScore: number;
  experienceScore: number;
  recruiterAppeal: number;
  atsCompatibilityScore: number;
  resumeHealthScore: number;
  careerSuccessScore: number;
  interviewPassProbability: number;
  recruiterShortlistProbability: number;
  interviewProbability: number;
  finalRoundProbability: number;
  offerProbability: number;
  marketPercentile: number;
  issues: ATSIssue[];
  keywordMatches: KeywordMatch[];
  atsSystemScores: ATSSystemScore[];
  parserFields: ParserField[];
  missingKeywords: string[];
  weakPhrases: string[];
  strongPoints: string[];
  jobMatchScore?: number;
}

export interface OptimizedResume {
  summary: string;
  experience: ResumeExperience[];
  skills: string[];
  addedKeywords: string[];
  removedWeakPhrases: string[];
  improvedVerbs: { original: string; improved: string }[];
  enhancedAchievements: string[];
  formattingImprovements: string[];
  newAtsScore: number;
  scoreImprovement: number;
}

export interface RecruiterPersona {
  role: string;
  avatar: string;
  verdict: "pass" | "maybe" | "reject";
  score: number;
  feedback: string;
  topConcern?: string;
}

export type TemplateId = "ats-classic" | "modern-professional" | "executive" | "minimalist";
