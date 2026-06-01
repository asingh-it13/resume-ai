"use client";
import type { ParserField, ResumeData } from "@/types/resume";
export default function ParserView({ fields }: { fields: ParserField[]; resume: ResumeData }) {
  const cc = (c:string)=>c==="high"?"text-green-400 bg-green-400/10 border-green-400/20":c==="medium"?"text-yellow-400 bg-yellow-400/10 border-yellow-400/20":c==="low"?"text-orange-400 bg-orange-400/10 border-orange-400/20":"text-red-400 bg-red-400/10 border-red-400/20";
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-white font-semibold text-sm mb-2">How ATS Reads Your Resume</h3>
      <p className="text-slate-500 text-xs mb-5">Exactly what ATS systems extract from your document.</p>
      <div className="space-y-3">
        {fields.map(({field,value,confidence})=>(
          <div key={field} className="flex items-start justify-between gap-4 py-2 border-b border-white/5">
            <div className="flex-1 min-w-0">
              <span className="text-slate-400 text-xs block mb-1">{field}</span>
              <span className="text-white text-sm truncate block">{value||"—"}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${cc(confidence)}`}>{confidence==="not_found"?"Not Found":confidence}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
