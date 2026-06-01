import { NextRequest, NextResponse } from "next/server";
import { optimizeResume, generateRecruiterPanel } from "@/lib/ai/client";
import { getCached, setCached, hashContent, incrementStat, checkRateLimit } from "@/lib/redis";
import type { ResumeData, AnalysisResult } from "@/types/resume";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { allowed } = await checkRateLimit(`optimize:${ip}`, 3, 3600);
  if (!allowed) return NextResponse.json({ error: "Rate limit reached. Try again in 1 hour." }, { status: 429 });
  try {
    const { resumeData, analysisResult, jobDescription } = await req.json() as { resumeData: ResumeData; analysisResult: AnalysisResult; jobDescription?: string };
    if (!resumeData || !analysisResult) return NextResponse.json({ error: "Missing data" }, { status: 400 });
    const cacheKey = `cache:opt:${hashContent(resumeData.rawText + (jobDescription || ""))}`;
    const cached = await getCached(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached, cached: true });
    const [optimized, recruiterPanel] = await Promise.all([
      optimizeResume(resumeData, analysisResult, jobDescription),
      generateRecruiterPanel(resumeData, analysisResult),
    ]);
    const result = { optimized, recruiterPanel };
    await setCached(cacheKey, result, 86400);
    void incrementStat("optimized");
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("Optimize error:", err);
    return NextResponse.json({ error: "AI optimization failed. Please try again." }, { status: 500 });
  }
}
