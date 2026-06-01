"use client";
import type { AnalysisResult } from "@/types/resume";
export default function InterviewFunnel({ result }: { result: AnalysisResult }) {
  const stages=[
    {label:"ATS Pass",prob:result.interviewPassProbability,color:"#3B82F6"},
    {label:"Recruiter Shortlist",prob:result.recruiterShortlistProbability,color:"#8B5CF6"},
    {label:"Interview",prob:result.interviewProbability,color:"#10B981"},
    {label:"Final Round",prob:result.finalRoundProbability,color:"#F59E0B"},
    {label:"Job Offer",prob:result.offerProbability,color:"#EF4444"},
  ];
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-white font-semibold text-sm mb-5">Interview Probability™</h3>
      <div className="space-y-3">
        {stages.map(({label,prob,color})=>(
          <div key={label} className="flex items-center gap-4">
            <span className="text-slate-400 text-xs w-36 shrink-0">{label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}>
              <div className="h-full rounded-full transition-all duration-1000" style={{width:`${prob}%`,background:color,boxShadow:`0 0 8px ${color}60`}}/>
            </div>
            <span className="text-sm font-bold w-10 text-right" style={{color}}>{prob}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
