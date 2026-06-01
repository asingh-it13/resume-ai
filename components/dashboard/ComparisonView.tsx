"use client";
import type { AnalysisResult, OptimizedResume, ResumeData } from "@/types/resume";
export default function ComparisonView({ original, optimized }: { original: AnalysisResult; optimized: OptimizedResume; originalResume: ResumeData }) {
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-5">Before vs After</h3>
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div><div className="text-4xl font-black text-slate-400">{original.atsScore}</div><div className="text-slate-500 text-xs mt-1">Before</div></div>
          <div className="flex items-center justify-center"><div className="text-2xl font-black text-green-400">+{optimized.scoreImprovement}</div></div>
          <div><div className="text-4xl font-black text-green-400">{optimized.newAtsScore}</div><div className="text-slate-500 text-xs mt-1">After</div></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {optimized.addedKeywords.length>0&&<div className="glass rounded-2xl p-5"><h4 className="text-green-400 font-semibold text-xs mb-3">✅ Keywords Added ({optimized.addedKeywords.length})</h4><div className="flex flex-wrap gap-2">{optimized.addedKeywords.map(k=><span key={k} className="tag-found text-xs px-2 py-1 rounded-lg">{k}</span>)}</div></div>}
        {optimized.removedWeakPhrases.length>0&&<div className="glass rounded-2xl p-5"><h4 className="text-red-400 font-semibold text-xs mb-3">❌ Weak Phrases Removed</h4><div className="space-y-1">{optimized.removedWeakPhrases.map(p=><span key={p} className="tag-missing text-xs px-2 py-1 rounded-lg block w-fit line-through">{p}</span>)}</div></div>}
        {optimized.improvedVerbs.length>0&&<div className="glass rounded-2xl p-5"><h4 className="text-blue-400 font-semibold text-xs mb-3">💪 Action Verbs Improved</h4><div className="space-y-2">{optimized.improvedVerbs.map((v,i)=><div key={i} className="flex items-center gap-2 text-xs"><span className="text-red-400 line-through">{v.original}</span><span className="text-slate-500">→</span><span className="text-green-400">{v.improved}</span></div>)}</div></div>}
        {optimized.formattingImprovements.length>0&&<div className="glass rounded-2xl p-5"><h4 className="text-violet-400 font-semibold text-xs mb-3">✨ Formatting Improved</h4><div className="space-y-1">{optimized.formattingImprovements.map((f,i)=><p key={i} className="text-slate-400 text-xs">• {f}</p>)}</div></div>}
      </div>
      {optimized.summary&&<div className="glass rounded-2xl p-5"><h4 className="text-white font-semibold text-xs mb-3">✨ Optimized Summary</h4><p className="text-slate-300 text-sm leading-relaxed">{optimized.summary}</p></div>}
    </div>
  );
}
