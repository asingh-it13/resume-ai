import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/ats/scorer";
import { incrementStat } from "@/lib/redis";
import type { ResumeData } from "@/types/resume";

export async function POST(req: NextRequest) {
  try {
    const { resumeData, jobDescription } = await req.json() as { resumeData: ResumeData; jobDescription?: string };
    if (!resumeData) return NextResponse.json({ error: "No resume data" }, { status: 400 });
    const result = analyzeResume(resumeData, jobDescription);
    void incrementStat("resumes");
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
