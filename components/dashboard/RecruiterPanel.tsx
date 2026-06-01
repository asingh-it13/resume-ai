"use client";
import type { RecruiterPersona } from "@/types/resume";
export default function RecruiterPanel({ personas }: { personas: RecruiterPersona[] }) {
  const vs=(v:string)=>v==="pass"?"text-green-400 bg-green-400/10 border-green-400/20":v==="maybe"?"text-yellow-400 bg-yellow-400/10 border-yellow-400/20":"text-red-400 bg-red-400/10 border-red-400/20";
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-white font-semibold text-sm mb-5">AI Recruiter Panel</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {personas.map(p=>(
          <div key={p.role} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><span className="text-xl">{p.avatar}</span><span className="text-white text-xs font-medium">{p.role}</span></div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${vs(p.verdict)}`}>{p.verdict}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{p.feedback}</p>
            {p.topConcern&&<p className="text-yellow-500/70 text-xs mt-2">⚠ {p.topConcern}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
