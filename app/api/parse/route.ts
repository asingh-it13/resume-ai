import { NextRequest, NextResponse } from "next/server";
import { extractTextFromBuffer, parseResumeText } from "@/lib/parser";

const ALLOWED_MIMES = ["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document","text/plain"];

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const file = fd.get("resume") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    if (!ALLOWED_MIMES.includes(file.type)) return NextResponse.json({ error: "Invalid file type. Use PDF, DOCX, or TXT." }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromBuffer(buffer, file.type);
    if (!text || text.trim().length < 50) return NextResponse.json({ error: "Could not extract text from file." }, { status: 400 });
    const data = parseResumeText(text);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Parse error:", err);
    return NextResponse.json({ error: "Failed to parse resume. Please try again." }, { status: 500 });
  }
}
