"use client";
import type { ATSSystemScore } from "@/types/resume";
export default function ATSMatrix({ systems }: { systems: ATSSystemScore[] }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-white font-semibold text-sm mb-5">ATS System Compatibility</h3>
      <div className="space-y-4">
        {systems.map(({ system, score, issues }) => {
          const c = score>=75?"#10B981":score>=55?"#F59E0B":"#EF4444";
          return (
            <div key={system}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 text-sm">{system}</span>
                <span className="text-sm font-bold" style={{color:c}}>{score}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}>
                <div className="h-full rounded-full transition-all duration-1000" style={{width:`${score}%`,background:c,boxShadow:`0 0 8px ${c}40`}}/>
              </div>
              {issues.length>0&&<p className="text-xs text-yellow-500/70 mt-1">{issues.join(" · ")}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
