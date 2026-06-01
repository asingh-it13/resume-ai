"use client";
import { useState } from "react";
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import type { ATSIssue } from "@/types/resume";
export default function IssueList({ issues }: { issues: ATSIssue[] }) {
  const [expanded, setExpanded] = useState<number|null>(0);
  if (issues.length===0) return null;
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4">Issues &amp; Recommendations ({issues.length})</h3>
      <div className="space-y-2">
        {issues.map((issue,i)=>{
          const borderCls=issue.type==="error"?"border-red-500/20":issue.type==="warning"?"border-yellow-500/20":"border-blue-500/20";
          const icon=issue.type==="error"?<AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5"/>:issue.type==="warning"?<AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5"/>:<Info size={14} className="text-blue-400 shrink-0 mt-0.5"/>;
          return (
            <div key={i} className={`border rounded-xl overflow-hidden ${borderCls}`} style={{background:"rgba(255,255,255,0.02)"}}>
              <button onClick={()=>setExpanded(expanded===i?null:i)} className="w-full flex items-start gap-3 p-4 text-left">
                {icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white text-sm font-medium">{issue.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-green-400 text-xs">+{issue.scoreGain} pts</span>
                      {expanded===i?<ChevronUp size={14} className="text-slate-400"/>:<ChevronDown size={14} className="text-slate-400"/>}
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs">{issue.location} · {issue.category}</span>
                </div>
              </button>
              {expanded===i&&(
                <div className="px-4 pb-4 border-t border-white/5">
                  <p className="text-slate-400 text-xs mt-3">{issue.description}</p>
                  <div className="flex items-start gap-2 p-3 mt-2 rounded-lg" style={{background:"rgba(59,130,246,0.05)",border:"1px solid rgba(59,130,246,0.15)"}}>
                    <span className="text-blue-400 text-xs font-medium shrink-0">💡 Fix:</span>
                    <p className="text-blue-300 text-xs">{issue.suggestion}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
