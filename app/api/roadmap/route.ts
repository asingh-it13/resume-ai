import { NextRequest, NextResponse } from "next/server";
import { generateCareerRoadmap } from "@/lib/ai/client";
import { getCached, setCached, hashContent } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { resumeData } = await req.json();
    const key = `cache:roadmap:${hashContent(resumeData.rawText)}`;
    const cached = await getCached(key);
    if (cached) return NextResponse.json({ success: true, data: cached });
    const data = await generateCareerRoadmap(resumeData);
    await setCached(key, data, 86400);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
