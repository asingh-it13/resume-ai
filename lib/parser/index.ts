import type { ResumeData, ResumeExperience, ResumeEducation } from "@/types/resume";

export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text as string;
  }
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value as string;
  }
  return buffer.toString("utf-8");
}

export function parseResumeText(text: string): ResumeData {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const fullText = lines.join("\n");
  return {
    rawText: fullText,
    name: extractName(lines),
    email: extractEmail(fullText),
    phone: extractPhone(fullText),
    location: extractLocation(fullText),
    targetRole: extractTargetRole(lines),
    summary: extractSection(fullText, ["summary", "professional summary", "profile", "objective"]),
    experience: extractExperience(fullText),
    education: extractEducation(fullText),
    skills: extractSkills(fullText),
    certifications: extractCertifications(fullText),
    wordCount: fullText.split(/\s+/).length,
    pageEstimate: Math.max(1, Math.ceil(fullText.split(/\s+/).length / 450)),
  };
}

function extractName(lines: string[]): string {
  for (const line of lines.slice(0, 5)) {
    const clean = line.replace(/[^a-zA-Z\s]/g, "").trim();
    const words = clean.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && clean.length > 3) {
      if (words.every((w) => w.length > 0 && /^[A-Z]/.test(w))) return clean;
    }
  }
  return "";
}

function extractEmail(text: string): string {
  const m = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  return m ? m[0] : "";
}

function extractPhone(text: string): string {
  const m = text.match(/(\+?\d[\d\s\-().]{7,})/);
  return m ? m[0].trim() : "";
}

function extractLocation(text: string): string {
  const m = text.match(/\b([A-Z][a-z]+(?:,?\s+[A-Z]{2,3})?)\b/);
  return m ? m[0] : "";
}

function extractTargetRole(lines: string[]): string {
  const rolePattern = /analyst|engineer|manager|coordinator|developer|designer|officer|specialist|consultant|administrator/i;
  for (const line of lines.slice(0, 10)) {
    if (rolePattern.test(line) && line.length < 80) return line;
  }
  return "";
}

function extractSection(text: string, headings: string[]): string {
  const lines = text.split("\n");
  for (const heading of headings) {
    const headRe = new RegExp(`^${heading.replace(/\s+/g, "\\s+")}\\s*:?\\s*$`, "i");
    const startIdx = lines.findIndex((l) => headRe.test(l.trim()));
    if (startIdx === -1) continue;
    // Collect lines until next heading-like line (short, all-caps, or title-case standalone)
    const nextHeadRe = /^[A-Z][A-Za-z\s&\/]{2,40}$/;
    const sectionLines: string[] = [];
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && nextHeadRe.test(line) && i > startIdx + 2 && sectionLines.length > 2) break;
      sectionLines.push(lines[i]);
    }
    const result = sectionLines.join("\n").trim();
    if (result.length > 20) return result.slice(0, 1200);
  }
  return "";
}

function extractExperience(text: string): ResumeExperience[] {
  let expSection = extractSection(text, ["experience", "work experience", "employment", "professional experience", "career history"]);
  // Fallback: look for date patterns if section header not found
  if (!expSection) {
    const dateMatch = text.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d{2})[^\n]{0,60}(?:Present|Current|\d{4})/i);
    if (dateMatch) expSection = text.slice(Math.max(0, text.indexOf(dateMatch[0]) - 200), text.indexOf(dateMatch[0]) + 1500);
  }
  if (!expSection) return [];
  const jobs: ResumeExperience[] = [];
  const chunks = expSection.split(/\n(?=[A-Z][^\n]{5,60}\n)/);
  for (const chunk of chunks.slice(0, 6)) {
    const chunkLines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (chunkLines.length < 2) continue;
    const bullets = chunkLines
      .filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*") || /^[A-Z]/.test(l))
      .filter((l) => l.length > 20)
      .slice(0, 8)
      .map((l) => l.replace(/^[•\-*]\s*/, ""));
    const dateMatch = chunk.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d\d)[^|•\n]{0,30}(?:–|-|to|present|current)/i);
    jobs.push({ title: chunkLines[0] || "", company: chunkLines[1] || "", period: dateMatch ? dateMatch[0] : "", bullets });
  }
  return jobs.filter((j) => j.title.length > 2);
}

function extractEducation(text: string): ResumeEducation[] {
  const sec = extractSection(text, ["education", "qualifications", "academic"]);
  if (!sec) return [];
  const items: ResumeEducation[] = [];
  const lines = sec.split("\n").map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i += 2) {
    if (lines[i]) items.push({ degree: lines[i], institution: lines[i + 1] || "", year: lines[i + 1]?.match(/\d{4}/)?.[0] });
  }
  return items.slice(0, 4);
}

function extractSkills(text: string): string[] {
  const skillSection = extractSection(text, ["skills", "key skills", "technical skills", "competencies"]);
  const src = skillSection || text;
  const known = ["Python","SQL","Excel","Power BI","Tableau","JavaScript","TypeScript","React","Node.js",
    "AWS","Azure","Docker","Git","Jira","SAP","Salesforce","Xero","Word","Outlook","Teams","PowerPoint",
    "Microsoft Office","Data Analysis","Machine Learning","Project Management","Agile","Scrum",
    "Communication","Leadership","Customer Service","Operations","Logistics","Supply Chain","ERP",
    "Microsoft Dynamics","Databricks","Snowflake","R","Statistics","Forecasting","Business Analysis",
    "Risk Management","Compliance","Quality Assurance","Process Improvement","Stakeholder Management"];
  const found = known.filter((s) => new RegExp(`\\b${s.replace(/\s/g, "\\s+")}\\b`, "i").test(src));
  if (skillSection) {
    const extra = skillSection.split(/[,|•\n]/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 40 && !s.match(/^\d/));
    found.push(...extra.filter((s) => !found.includes(s)).slice(0, 20));
  }
  return [...new Set(found)].slice(0, 30);
}

function extractCertifications(text: string): string[] {
  const sec = extractSection(text, ["certifications", "certificates", "licenses"]);
  if (!sec) return [];
  return sec.split("\n").map((l) => l.trim().replace(/^[•\-*]\s*/, "")).filter((l) => l.length > 5 && l.length < 100).slice(0, 8);
}
