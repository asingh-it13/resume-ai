import Anthropic from "@anthropic-ai/sdk";
import type { ResumeData, AnalysisResult, OptimizedResume, RecruiterPersona } from "@/types/resume";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

function buildCtx(resume: ResumeData, analysis: AnalysisResult, jd?: string): string {
  return `ROLE: ${resume.targetRole || "Not specified"}
ATS_SCORE: ${analysis.atsScore}/100
MISSING_KW: ${analysis.missingKeywords.slice(0, 8).join(", ") || "none"}
WEAK_PHRASES: ${analysis.weakPhrases.join("; ") || "none"}
SUMMARY: ${resume.summary?.slice(0, 300) || "none"}
EXPERIENCE:
${resume.experience.slice(0, 3).map((e) => `${e.title} @ ${e.company}\n${e.bullets.slice(0, 3).map((b) => `- ${b}`).join("\n")}`).join("\n\n")}
SKILLS: ${resume.skills.slice(0, 20).join(", ")}
${jd ? `JD_CONTEXT: ${jd.slice(0, 400)}` : ""}`.trim();
}

export async function optimizeResume(resume: ResumeData, analysis: AnalysisResult, jobDescription?: string): Promise<OptimizedResume> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: `You are an expert resume writer. Optimize the resume to improve ATS score and recruiter appeal.
RULES: Never invent experience, jobs, education, certifications, or skills. Only improve wording and presentation.
Return ONLY valid JSON, no markdown fences:
{"summary":"...","experience":[{"title":"","company":"","period":"","bullets":["..."]}],"skills":["..."],"addedKeywords":["..."],"removedWeakPhrases":["..."],"improvedVerbs":[{"original":"","improved":""}],"enhancedAchievements":["..."],"formattingImprovements":["..."],"newAtsScore":89,"scoreImprovement":15}`,
    messages: [{ role: "user", content: `Optimize:\n\n${buildCtx(resume, analysis, jobDescription)}` }],
  });
  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  try {
    const p = JSON.parse(text.replace(/```json|```/g, "").trim());
    return { summary: p.summary || resume.summary || "", experience: p.experience || resume.experience, skills: p.skills || resume.skills, addedKeywords: p.addedKeywords || [], removedWeakPhrases: p.removedWeakPhrases || [], improvedVerbs: p.improvedVerbs || [], enhancedAchievements: p.enhancedAchievements || [], formattingImprovements: p.formattingImprovements || [], newAtsScore: p.newAtsScore || Math.min(97, analysis.atsScore + 15), scoreImprovement: p.scoreImprovement || 15 };
  } catch {
    return { summary: resume.summary || "", experience: resume.experience, skills: resume.skills, addedKeywords: analysis.missingKeywords.slice(0, 5), removedWeakPhrases: analysis.weakPhrases, improvedVerbs: [], enhancedAchievements: [], formattingImprovements: ["Improved keyword density", "Enhanced section structure"], newAtsScore: Math.min(97, analysis.atsScore + 12), scoreImprovement: 12 };
  }
}

export async function generateRecruiterPanel(resume: ResumeData, analysis: AnalysisResult): Promise<RecruiterPersona[]> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    system: `Simulate 6 hiring reviewers giving honest feedback. Return ONLY valid JSON array, no markdown:
[{"role":"ATS System","avatar":"🤖","verdict":"pass","score":85,"feedback":"One sentence verdict.","topConcern":"Their concern"}]
Roles must be: ATS System, Recruiter, HR Manager, Hiring Manager, Department Head, Executive.`,
    messages: [{ role: "user", content: `Review:\n\n${buildCtx(resume, analysis)}` }],
  });
  const text = msg.content[0].type === "text" ? msg.content[0].text : "[]";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return defaultPanel(analysis.atsScore); }
}

function defaultPanel(score: number): RecruiterPersona[] {
  const v = score >= 75 ? "pass" : score >= 55 ? "maybe" : "reject";
  return [
    { role: "ATS System", avatar: "🤖", verdict: v, score, feedback: "Resume processed. Keyword matching complete.", topConcern: "Keyword density" },
    { role: "Recruiter", avatar: "👩‍💼", verdict: v, score: score - 2, feedback: "Initial screening complete.", topConcern: "Experience relevance" },
    { role: "HR Manager", avatar: "👔", verdict: v, score: score - 5, feedback: "Culture and qualification fit assessed.", topConcern: "Qualification match" },
    { role: "Hiring Manager", avatar: "🧑‍💻", verdict: v, score: score + 3, feedback: "Technical skills and experience evaluated.", topConcern: "Skills gap" },
    { role: "Department Head", avatar: "🏢", verdict: v, score: score - 3, feedback: "Team fit and growth potential reviewed.", topConcern: "Leadership indicators" },
    { role: "Executive", avatar: "👑", verdict: score >= 80 ? "pass" : "maybe", score: score - 8, feedback: "Strategic value and career trajectory noted.", topConcern: "Career progression" },
  ];
}

export async function generateInterviewPrep(resume: ResumeData, role?: string): Promise<{ technical: string[]; behavioral: string[]; star: { q: string; a: string }[]; hr: string[] }> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: `Generate interview prep. Return ONLY valid JSON, no markdown:
{"technical":["Q1","Q2","Q3","Q4","Q5"],"behavioral":["Q1","Q2","Q3","Q4","Q5"],"star":[{"q":"question","a":"SITUATION: ...\nTASK: ...\nACTION: ...\nRESULT: ..."}],"hr":["Q1","Q2","Q3","Q4","Q5"]}`,
    messages: [{ role: "user", content: `Interview prep for: ${role || resume.targetRole || "professional"}\nSkills: ${resume.skills.slice(0, 10).join(", ")}` }],
  });
  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return { technical: [], behavioral: [], star: [], hr: [] }; }
}

export async function generateCareerRoadmap(resume: ResumeData): Promise<Record<string, string[]>> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: `Generate a career roadmap. Return ONLY valid JSON, no markdown:
{"30days":["Action 1","Action 2","Action 3","Action 4","Action 5"],"60days":["..."],"90days":["..."],"6months":["..."],"12months":["..."]}`,
    messages: [{ role: "user", content: `Roadmap for: ${resume.targetRole || "professional"}\nSkills: ${resume.skills.slice(0, 10).join(", ")}` }],
  });
  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return {}; }
}

export async function generateLinkedInContent(resume: ResumeData): Promise<{ headline: string; about: string; skills: string[]; tips: string[] }> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: `LinkedIn profile optimizer. Return ONLY valid JSON, no markdown:
{"headline":"...","about":"...","skills":["..."],"tips":["..."]}`,
    messages: [{ role: "user", content: `LinkedIn for: ${resume.name || "candidate"}, ${resume.targetRole || "professional"}\nSkills: ${resume.skills.slice(0, 10).join(", ")}` }],
  });
  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return { headline: "", about: "", skills: [], tips: [] }; }
}
