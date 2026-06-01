"use client";
export default function ScoreCard({ label, score }: { label: string; score: number }) {
  const color = score>=75?"#10B981":score>=55?"#F59E0B":"#EF4444";
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-slate-400 text-xs">{label}</span>
        <span className="font-bold text-sm" style={{color}}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}>
        <div className="h-full rounded-full transition-all duration-1000" style={{width:`${score}%`,background:color}}/>
      </div>
    </div>
  );
}
