import { NextRequest, NextResponse } from "next/server";
import { generateLinkedInContent } from "@/lib/ai/client";
import { getCached, setCached, hashContent } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { resumeData } = await req.json();
    const key = `cache:linkedin:${hashContent(resumeData.rawText)}`;
    const cached = await getCached(key);
    if (cached) return NextResponse.json({ success: true, data: cached });
    const data = await generateLinkedInContent(resumeData);
    await setCached(key, data, 86400);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate LinkedIn content" }, { status: 500 });
  }
}
