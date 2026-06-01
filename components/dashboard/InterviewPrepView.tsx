"use client";
import { useState } from "react";
import type { ResumeData } from "@/types/resume";
export default function InterviewPrepView({ resumeData }: { resumeData: ResumeData }) {
  const [loading,setLoading]=useState(false);
  const [data,setData]=useState<{technical:string[];behavioral:string[];star:{q:string;a:string}[];hr:string[]}|null>(null);
  const [activeTab,setActiveTab]=useState("behavioral");
  const [expanded,setExpanded]=useState<number|null>(null);
  const generate=async()=>{
    setLoading(true);
    try{const r=await fetch("/api/interview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeData,role:resumeData.targetRole})});const j=await r.json();if(j.success)setData(j.data);}
    finally{setLoading(false);}
  };
  if(!data)return(<div className="glass rounded-2xl p-10 text-center"><div className="text-4xl mb-4">🎤</div><h3 className="text-white font-semibold text-lg mb-2">Interview Preparation</h3><p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Role-specific technical, behavioral, and HR questions with full STAR answer frameworks.</p><button onClick={generate} disabled={loading} className="px-6 py-3 rounded-xl font-semibold transition-all text-white" style={{background:"#3B82F6",opacity:loading?0.5:1}}>{loading?"Generating...":"Generate Interview Prep"}</button></div>);
  const tabs=[{id:"behavioral",label:"Behavioural",questions:data.behavioral},{id:"technical",label:"Technical",questions:data.technical},{id:"hr",label:"HR Questions",questions:data.hr}];
  return(
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5">
        <div className="flex gap-2 flex-wrap mb-5">
          {tabs.map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} className="px-4 py-2 rounded-xl text-xs font-medium transition-all" style={{background:activeTab===t.id?"#3B82F6":"rgba(255,255,255,0.05)",color:activeTab===t.id?"white":"#94A3B8"}}>{t.label}</button>)}
          <button onClick={()=>setActiveTab("star")} className="px-4 py-2 rounded-xl text-xs font-medium transition-all" style={{background:activeTab==="star"?"#3B82F6":"rgba(255,255,255,0.05)",color:activeTab==="star"?"white":"#94A3B8"}}>STAR Answers</button>
        </div>
        {activeTab==="star"?<div className="space-y-3">{data.star.map((item,i)=><div key={i} className="border border-white/8 rounded-xl overflow-hidden"><button onClick={()=>setExpanded(expanded===i?null:i)} className="w-full text-left p-4"><p className="text-white text-sm font-medium">{item.q}</p></button>{expanded===i&&<div className="px-4 pb-4 border-t border-white/5"><p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line mt-3">{item.a}</p></div>}</div>)}</div>
        :<div className="space-y-2">{(tabs.find(t=>t.id===activeTab)?.questions||[]).map((q,i)=><div key={i} className="p-4 rounded-xl" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}><p className="text-slate-300 text-sm">{i+1}. {q}</p></div>)}</div>}
      </div>
    </div>
  );
}
