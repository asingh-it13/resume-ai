"use client";
import { useState } from "react";
import type { ResumeData } from "@/types/resume";
export default function LinkedInView({ resumeData }: { resumeData: ResumeData }) {
  const [loading,setLoading]=useState(false);
  const [data,setData]=useState<{headline:string;about:string;skills:string[];tips:string[]}|null>(null);
  const generate=async()=>{setLoading(true);try{const r=await fetch("/api/linkedin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeData})});const j=await r.json();if(j.success)setData(j.data);}finally{setLoading(false);}};
  if(!data)return(<div className="glass rounded-2xl p-10 text-center"><div className="text-4xl mb-4">💼</div><h3 className="text-white font-semibold text-lg mb-2">LinkedIn Optimizer</h3><p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">AI-optimized LinkedIn headline, About section, skills list, and recruiter visibility tips.</p><button onClick={generate} disabled={loading} className="px-6 py-3 rounded-xl font-semibold text-white transition-all" style={{background:"#3B82F6",opacity:loading?0.5:1}}>{loading?"Optimizing...":"Optimize LinkedIn Profile"}</button></div>);
  return(
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5"><h4 className="text-blue-400 font-semibold text-xs mb-2">🔵 Headline</h4><p className="text-white text-sm p-3 rounded-xl" style={{background:"rgba(255,255,255,0.03)"}}>{data.headline}</p></div>
      <div className="glass rounded-2xl p-5"><h4 className="text-blue-400 font-semibold text-xs mb-2">📝 About Section</h4><p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line p-3 rounded-xl" style={{background:"rgba(255,255,255,0.03)"}}>{data.about}</p></div>
      <div className="glass rounded-2xl p-5"><h4 className="text-blue-400 font-semibold text-xs mb-3">🛠 Top Skills to Add</h4><div className="flex flex-wrap gap-2">{data.skills.map(s=><span key={s} className="text-xs px-3 py-1.5 rounded-lg" style={{background:"rgba(59,130,246,0.15)",color:"#60A5FA",border:"1px solid rgba(59,130,246,0.2)"}}>{s}</span>)}</div></div>
      <div className="glass rounded-2xl p-5"><h4 className="text-blue-400 font-semibold text-xs mb-3">💡 Recruiter Visibility Tips</h4><div className="space-y-2">{data.tips.map((tip,i)=><div key={i} className="flex items-start gap-2 text-sm text-slate-300"><span className="text-blue-400 shrink-0">{i+1}.</span>{tip}</div>)}</div></div>
    </div>
  );
}
