"use client";
import { useState } from "react";
import type { ResumeData } from "@/types/resume";
const PERIODS=[{id:"30days",label:"30 Days",color:"#3B82F6"},{id:"60days",label:"60 Days",color:"#8B5CF6"},{id:"90days",label:"90 Days",color:"#10B981"},{id:"6months",label:"6 Months",color:"#F59E0B"},{id:"12months",label:"12 Months",color:"#EF4444"}];
export default function CareerRoadmapView({ resumeData }: { resumeData: ResumeData }) {
  const [loading,setLoading]=useState(false);
  const [data,setData]=useState<Record<string,string[]>|null>(null);
  const [active,setActive]=useState("30days");
  const generate=async()=>{setLoading(true);try{const r=await fetch("/api/roadmap",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeData})});const j=await r.json();if(j.success)setData(j.data);}finally{setLoading(false);}};
  if(!data)return(<div className="glass rounded-2xl p-10 text-center"><div className="text-4xl mb-4">🗺</div><h3 className="text-white font-semibold text-lg mb-2">Career Roadmap</h3><p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Personalised 30/60/90 day and 12-month action plan to accelerate your career.</p><button onClick={generate} disabled={loading} className="px-6 py-3 rounded-xl font-semibold text-white transition-all" style={{background:"#3B82F6",opacity:loading?0.5:1}}>{loading?"Generating...":"Generate Career Roadmap"}</button></div>);
  const period=PERIODS.find(p=>p.id===active)!;
  return(
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">{PERIODS.map(p=><button key={p.id} onClick={()=>setActive(p.id)} className="px-4 py-2 rounded-xl text-xs font-medium transition-all" style={{background:active===p.id?p.color:"rgba(255,255,255,0.05)",color:active===p.id?"white":"#94A3B8"}}>{p.label}</button>)}</div>
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-sm mb-4" style={{color:period.color}}>{period.label} Action Plan</h3>
        <div className="space-y-3">{(data[active]||[]).map((action,i)=><div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)"}}><div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5" style={{background:period.color}}>{i+1}</div><p className="text-slate-300 text-sm">{action}</p></div>)}</div>
      </div>
    </div>
  );
}
