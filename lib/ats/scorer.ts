import type { ResumeData, AnalysisResult, ATSIssue, KeywordMatch, ATSSystemScore, ParserField } from "@/types/resume";

const STRONG_VERBS = ["achieved","accelerated","built","delivered","designed","developed","drove","engineered","established","exceeded","expanded","generated","implemented","improved","increased","launched","led","managed","optimized","orchestrated","pioneered","reduced","resolved","spearheaded","streamlined","transformed","created","coordinated","executed"];
const WEAK_PHRASES = ["responsible for","worked on","helped with","assisted with","involved in","participated in","duties included","was tasked with","tasked with","contributed to"];

export function analyzeResume(resume: ResumeData, jobDescription?: string): AnalysisResult {
  const issues: ATSIssue[] = [];
  const jdKeywords = jobDescription ? extractJDKeywords(jobDescription) : [];

  const formattingScore = scoreFormatting(resume, issues);
  const readabilityScore = scoreReadability(resume, issues);
  const experienceScore = scoreExperience(resume, issues);
  const skillsScore = scoreSkills(resume, jdKeywords, issues);
  const keywordScore = scoreKeywords(resume, jdKeywords, issues);
  const recruiterAppeal = scoreRecruiterAppeal(resume, issues);
  const atsCompatibilityScore = scoreATSCompatibility(resume, issues);

  const atsScore = Math.round(
    formattingScore * 0.15 + readabilityScore * 0.10 + experienceScore * 0.20 +
    skillsScore * 0.15 + keywordScore * 0.20 + recruiterAppeal * 0.10 + atsCompatibilityScore * 0.10
  );

  const resumeHealthScore = Math.round((atsScore + recruiterAppeal) / 2);
  const careerSuccessScore = Math.round(atsScore * 0.3 + recruiterAppeal * 0.2 + experienceScore * 0.3 + skillsScore * 0.1 + readabilityScore * 0.1);
  const base = atsScore / 100;
  const interviewPassProbability = Math.round(Math.min(95, base * 110));
  const recruiterShortlistProbability = Math.round(Math.min(90, base * 90));
  const interviewProbability = Math.round(Math.min(80, base * 75));
  const finalRoundProbability = Math.round(Math.min(60, base * 50));
  const offerProbability = Math.round(Math.min(40, base * 30));
  const marketPercentile = Math.round(Math.min(99, base * 95));

  const keywordMatches = buildKeywordMatches(resume, jdKeywords);
  const missingKeywords = keywordMatches.filter((k) => k.status === "missing").map((k) => k.keyword);
  const weakPhrases = WEAK_PHRASES.filter((p) => new RegExp(`\\b${p}\\b`, "i").test(resume.rawText));
  const strongPoints = buildStrongPoints(resume);
  const atsSystemScores = buildATSSystemScores(resume, atsScore);
  const parserFields = buildParserFields(resume);
  const jobMatchScore = jobDescription ? Math.round(Math.min(100, (keywordScore + skillsScore) / 2 * 1.1)) : undefined;

  return {
    atsScore, keywordScore, formattingScore, readabilityScore, skillsScore, experienceScore,
    recruiterAppeal, atsCompatibilityScore, resumeHealthScore, careerSuccessScore,
    interviewPassProbability, recruiterShortlistProbability, interviewProbability,
    finalRoundProbability, offerProbability, marketPercentile,
    issues: issues.sort((a, b) => b.scoreGain - a.scoreGain),
    keywordMatches, atsSystemScores, parserFields, missingKeywords, weakPhrases, strongPoints, jobMatchScore,
  };
}

function scoreFormatting(resume: ResumeData, issues: ATSIssue[]): number {
  let score = 100;
  if (resume.wordCount < 300) {
    score -= 20;
    issues.push({ type: "error", category: "Formatting", location: "Entire Resume", title: "Resume is too short", description: `Only ${resume.wordCount} words — ATS expects 400–700.`, suggestion: "Expand experience bullets with quantified achievements.", scoreGain: 15 });
  } else if (resume.wordCount > 1000) {
    score -= 10;
    issues.push({ type: "warning", category: "Formatting", location: "Entire Resume", title: "Resume may be too long", description: `${resume.wordCount} words — aim for under 700.`, suggestion: "Trim older experience or remove redundant bullets.", scoreGain: 8 });
  }
  if (!resume.summary) {
    score -= 15;
    issues.push({ type: "error", category: "Formatting", location: "Top of Resume", title: "Missing Professional Summary", description: "A summary section is the first thing ATS and recruiters look for.", suggestion: "Add a 3–5 sentence summary targeting your role.", scoreGain: 12 });
  }
  if (resume.experience.length === 0) {
    score -= 25;
    issues.push({ type: "error", category: "Formatting", location: "Experience Section", title: "Experience section not detected", description: "ATS could not find a work experience section.", suggestion: "Ensure your experience section has a clear heading.", scoreGain: 20 });
  }
  if (!resume.email) {
    score -= 15;
    issues.push({ type: "error", category: "Contact", location: "Header", title: "No email address detected", description: "ATS systems need an email to process your application.", suggestion: "Add your email address clearly in the header.", scoreGain: 12 });
  }
  if (!resume.phone) {
    score -= 8;
    issues.push({ type: "warning", category: "Contact", location: "Header", title: "Phone number not detected", description: "Missing phone reduces ATS parsing confidence.", suggestion: "Add your phone number to the header.", scoreGain: 6 });
  }
  return Math.max(0, score);
}

function scoreReadability(resume: ResumeData, issues: ATSIssue[]): number {
  let score = 85;
  const weakFound = WEAK_PHRASES.filter((p) => new RegExp(`\\b${p}\\b`, "i").test(resume.rawText));
  if (weakFound.length > 0) {
    score -= Math.min(20, weakFound.length * 4);
    issues.push({ type: "warning", category: "Language", location: "Experience Section", title: `Weak phrases detected (${weakFound.length})`, description: `Phrases like "${weakFound[0]}" reduce ATS keyword matching.`, suggestion: `Replace with strong action verbs: "${STRONG_VERBS.slice(0, 5).join('", "')}"`, scoreGain: Math.min(15, weakFound.length * 3) });
  }
  const expText = resume.experience.map((e) => e.bullets.join(" ")).join(" ").toLowerCase();
  const strongCount = STRONG_VERBS.filter((v) => expText.includes(v)).length;
  if (strongCount < 3) {
    score -= 10;
    issues.push({ type: "warning", category: "Language", location: "Experience Bullets", title: "Few strong action verbs", description: "Strong action verbs improve both ATS scoring and recruiter appeal.", suggestion: `Start bullets with: "${STRONG_VERBS.slice(0, 6).join('", "')}"`, scoreGain: 8 });
  }
  const quantified = (resume.rawText.match(/\d+%|\d+x|\$\d+|\d+\s+(users|clients|team|people|projects)/gi) || []).length;
  if (quantified < 2) {
    score -= 12;
    issues.push({ type: "warning", category: "Achievements", location: "Experience Bullets", title: "Lacking quantified achievements", description: "Numbers (%, $, counts) significantly boost ATS scores.", suggestion: 'Add metrics: "Reduced processing time by 30%" or "Managed team of 8"', scoreGain: 10 });
  }
  return Math.max(0, score);
}

function scoreExperience(resume: ResumeData, issues: ATSIssue[]): number {
  let score = 70;
  if (resume.experience.length >= 1) score += 15;
  if (resume.experience.length >= 2) score += 10;
  if (resume.experience.length >= 3) score += 5;
  const avgBullets = resume.experience.reduce((s, e) => s + e.bullets.length, 0) / Math.max(1, resume.experience.length);
  if (avgBullets < 2) {
    score -= 15;
    issues.push({ type: "warning", category: "Experience", location: "Experience Section", title: "Experience bullets are sparse", description: `Average ${avgBullets.toFixed(1)} bullets per role — aim for 4–6.`, suggestion: "Add 4–6 impact-driven bullet points per role.", scoreGain: 12 });
  }
  if (resume.education.length === 0) {
    score -= 10;
    issues.push({ type: "warning", category: "Education", location: "Education Section", title: "Education section not found", description: "ATS systems look for a dedicated education section.", suggestion: "Add an Education section with your degrees and institutions.", scoreGain: 8 });
  }
  return Math.min(100, Math.max(0, score));
}

function scoreSkills(resume: ResumeData, jdKeywords: string[], issues: ATSIssue[]): number {
  if (resume.skills.length === 0) {
    issues.push({ type: "error", category: "Skills", location: "Skills Section", title: "No skills section detected", description: "ATS systems specifically scan for a skills section.", suggestion: "Add a dedicated Skills section listing your top 10–15 skills.", scoreGain: 18 });
    return 30;
  }
  let score = 60 + Math.min(30, resume.skills.length * 2);
  if (jdKeywords.length > 0) {
    const matched = jdKeywords.filter((kw) => resume.skills.some((s) => s.toLowerCase().includes(kw.toLowerCase()))).length;
    const matchRate = matched / jdKeywords.length;
    score = Math.round(score * 0.5 + matchRate * 100 * 0.5);
    if (matchRate < 0.5) issues.push({ type: "error", category: "Skills", location: "Skills Section", title: "Low job description skills match", description: `Only ${Math.round(matchRate * 100)}% of required skills found.`, suggestion: "Mirror exact skill terms from the job description.", scoreGain: 15 });
  }
  return Math.min(100, score);
}

function scoreKeywords(resume: ResumeData, jdKeywords: string[], issues: ATSIssue[]): number {
  if (jdKeywords.length === 0) return resume.skills.length > 5 && resume.experience.length > 0 ? 70 : 50;
  const text = resume.rawText.toLowerCase();
  const matched = jdKeywords.filter((kw) => text.includes(kw.toLowerCase())).length;
  const score = Math.round((matched / jdKeywords.length) * 100);
  if (score < 60) {
    const missing = jdKeywords.filter((kw) => !text.includes(kw.toLowerCase())).slice(0, 5);
    issues.push({ type: "error", category: "Keywords", location: "Entire Resume", title: "Critical keyword gaps", description: `Only ${score}% of job description keywords found.`, suggestion: `Add these missing keywords: ${missing.join(", ")}`, scoreGain: 20 });
  }
  return score;
}

function scoreRecruiterAppeal(resume: ResumeData, issues: ATSIssue[]): number {
  let score = 75;
  if (resume.summary && resume.summary.length > 100) score += 10;
  if (resume.summary && resume.summary.length > 200) score += 5;
  if (resume.certifications.length > 0) score += 5;
  if (resume.skills.length >= 10) score += 5;
  if (!resume.rawText.toLowerCase().includes("linkedin")) {
    issues.push({ type: "info", category: "Contact", location: "Header", title: "LinkedIn profile not included", description: "75% of recruiters check LinkedIn before interviews.", suggestion: "Add your LinkedIn URL to the contact section.", scoreGain: 5 });
    score -= 5;
  }
  return Math.min(100, Math.max(0, score));
}

function scoreATSCompatibility(resume: ResumeData, issues: ATSIssue[]): number {
  let score = 80;
  const tabRatio = (resume.rawText.match(/\t/g) || []).length / Math.max(1, resume.rawText.length);
  if (tabRatio > 0.02) {
    score -= 10;
    issues.push({ type: "warning", category: "ATS Compatibility", location: "Formatting", title: "Possible table or column formatting", description: "Tables and multi-column layouts break most ATS parsers.", suggestion: "Use single-column layout with standard section headings.", scoreGain: 8 });
  }
  if (!resume.email || !resume.name) {
    score -= 10;
    issues.push({ type: "error", category: "ATS Compatibility", location: "Header", title: "Contact info may be in header/footer", description: "ATS systems often cannot read content in Word headers or footers.", suggestion: "Place all contact information in the main body.", scoreGain: 10 });
  }
  return Math.max(0, score);
}

function extractJDKeywords(jd: string): string[] {
  const stopWords = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","this","that","will","must","should","would","could","have","has","had","been","is","are","was","were","be","by","from","not","all","we","you","our","your","they","it","its","as","also","any"]);
  const words = jd.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !stopWords.has(w));
  const freq: Record<string, number> = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).filter(([, c]) => c >= 2).sort(([, a], [, b]) => b - a).slice(0, 20).map(([w]) => w);
}

function buildKeywordMatches(resume: ResumeData, jdKeywords: string[]): KeywordMatch[] {
  const text = resume.rawText.toLowerCase();
  if (jdKeywords.length === 0) return resume.skills.slice(0, 15).map((s) => ({ keyword: s, status: "found" as const, foundAs: s }));
  return jdKeywords.map((kw) => {
    if (text.includes(kw.toLowerCase())) return { keyword: kw, status: "found" as const, foundAs: kw };
    const partial = resume.skills.find((s) => s.toLowerCase().includes(kw.slice(0, 4)) || kw.includes(s.toLowerCase().slice(0, 4)));
    if (partial) return { keyword: kw, status: "weak" as const, foundAs: partial, suggestion: `Replace "${partial}" with exact term "${kw}"` };
    return { keyword: kw, status: "missing" as const, suggestion: `Add "${kw}" to your skills or experience` };
  });
}

function buildStrongPoints(resume: ResumeData): string[] {
  const pts: string[] = [];
  if (resume.skills.length >= 8) pts.push(`Strong skills section with ${resume.skills.length} skills listed`);
  if (resume.experience.length >= 3) pts.push(`${resume.experience.length} roles showing career progression`);
  if (resume.certifications.length > 0) pts.push(`${resume.certifications.length} certification(s) listed`);
  if (resume.summary && resume.summary.length > 150) pts.push("Well-written professional summary detected");
  const q = (resume.rawText.match(/\d+%|\d+x|\$\d+/g) || []).length;
  if (q >= 3) pts.push(`${q} quantified achievements found`);
  return pts;
}

function buildATSSystemScores(resume: ResumeData, base: number): ATSSystemScore[] {
  return [
    { system: "Workday", modifier: 1.02 }, { system: "Greenhouse", modifier: 1.05 },
    { system: "Lever", modifier: 0.97 }, { system: "BambooHR", modifier: 1.01 },
    { system: "iCIMS", modifier: 0.93 }, { system: "SAP SuccessFactors", modifier: 0.98 },
    { system: "Taleo", modifier: 0.95 }, { system: "Oracle Recruiting", modifier: 0.99 },
  ].map(({ system, modifier }) => {
    const score = Math.min(100, Math.max(20, Math.round(base * modifier)));
    const issues: string[] = [];
    if (score < 70) issues.push("Improve keyword density");
    if (!resume.email) issues.push("Add contact email");
    if (score < 60) issues.push("Simplify formatting");
    return { system, score, issues };
  });
}

function buildParserFields(resume: ResumeData): ParserField[] {
  return [
    { field: "Full Name", value: resume.name || "", confidence: resume.name ? "high" : "not_found" },
    { field: "Email Address", value: resume.email || "", confidence: resume.email ? "high" : "not_found" },
    { field: "Phone Number", value: resume.phone || "", confidence: resume.phone ? "high" : "not_found" },
    { field: "Location", value: resume.location || "", confidence: resume.location ? "medium" : "not_found" },
    { field: "Target Role", value: resume.targetRole || "", confidence: resume.targetRole ? "medium" : "low" },
    { field: "Summary", value: resume.summary ? resume.summary.slice(0, 80) + "..." : "", confidence: resume.summary ? "high" : "not_found" },
    { field: "Experience Entries", value: `${resume.experience.length} roles detected`, confidence: resume.experience.length > 0 ? "high" : "not_found" },
    { field: "Education", value: `${resume.education.length} entries`, confidence: resume.education.length > 0 ? "high" : "low" },
    { field: "Skills", value: `${resume.skills.length} skills extracted`, confidence: resume.skills.length > 5 ? "high" : resume.skills.length > 0 ? "medium" : "not_found" },
    { field: "Certifications", value: `${resume.certifications.length} found`, confidence: resume.certifications.length > 0 ? "high" : "not_found" },
  ];
}
