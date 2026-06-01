import { NextRequest, NextResponse } from "next/server";
import { generateInterviewPrep } from "@/lib/ai/client";
import { getCached, setCached, hashContent } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { resumeData, role } = await req.json();
    const key = `cache:interview:${hashContent(resumeData.rawText + (role || ""))}`;
    const cached = await getCached(key);
    if (cached) return NextResponse.json({ success: true, data: cached });
    const data = await generateInterviewPrep(resumeData, role);
    await setCached(key, data, 43200);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate interview prep" }, { status: 500 });
  }
}
