"use client";
import type { KeywordMatch } from "@/types/resume";
interface Props { matches: KeywordMatch[]; jobMatchScore?: number; hasJobDesc: boolean; }
export default function KeywordAnalysis({ matches, jobMatchScore, hasJobDesc }: Props) {
  const found=matches.filter(m=>m.status==="found"), weak=matches.filter(m=>m.status==="weak"), missing=matches.filter(m=>m.status==="missing");
  return (
    <div className="space-y-4">
      {jobMatchScore!==undefined&&(
        <div className="glass rounded-2xl p-5 flex items-center justify-between">
          <div><h3 className="text-white font-semibold text-sm">Job Description Match</h3><p className="text-slate-400 text-xs mt-0.5">Keywords matched from the pasted job description</p></div>
          <div className={`text-3xl font-black ${jobMatchScore>=70?"text-green-400":jobMatchScore>=50?"text-yellow-400":"text-red-400"}`}>{jobMatchScore}%</div>
        </div>
      )}
      {!hasJobDesc&&<div className="glass rounded-2xl p-5 border border-blue-500/20" style={{background:"rgba(59,130,246,0.05)"}}><p className="text-blue-400 text-sm font-medium mb-1">💡 Add a job description for deeper keyword analysis</p><p className="text-slate-400 text-xs">Go back and paste a job description for precise gap analysis.</p></div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5"><h4 className="text-green-400 font-semibold text-sm mb-3">✅ Found ({found.length})</h4><div className="flex flex-wrap gap-2">{found.map(m=><span key={m.keyword} className="tag-found text-xs px-2 py-1 rounded-lg">{m.keyword}</span>)}{found.length===0&&<span className="text-slate-500 text-xs">None detected</span>}</div></div>
        <div className="glass rounded-2xl p-5"><h4 className="text-yellow-400 font-semibold text-sm mb-3">⚠ Weak ({weak.length})</h4><div className="space-y-2">{weak.map(m=><div key={m.keyword} className="text-xs"><span className="tag-weak px-2 py-1 rounded-lg">{m.keyword}</span>{m.suggestion&&<p className="text-slate-500 mt-1">{m.suggestion}</p>}</div>)}{weak.length===0&&<span className="text-slate-500 text-xs">None</span>}</div></div>
        <div className="glass rounded-2xl p-5"><h4 className="text-red-400 font-semibold text-sm mb-3">❌ Missing ({missing.length})</h4><div className="space-y-2">{missing.map(m=><div key={m.keyword} className="text-xs"><span className="tag-missing px-2 py-1 rounded-lg">{m.keyword}</span>{m.suggestion&&<p className="text-slate-500 mt-1">{m.suggestion}</p>}</div>)}{missing.length===0&&<span className="text-slate-500 text-xs">All keywords present!</span>}</div></div>
      </div>
    </div>
  );
}
