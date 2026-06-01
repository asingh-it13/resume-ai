"use client";
import { useEffect, useState } from "react";
interface Props { score: number; label: string; size?: number; }
export default function ScoreGauge({ score, label, size = 120 }: Props) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1,(Date.now()-start)/1500);
      setAnim(Math.round((1-Math.pow(1-p,3))*score));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score]);
  const r = size*0.38, cx = size/2, cy = size/2;
  const circ = 2*Math.PI*r, arc = circ*0.75;
  const offset = arc - (anim/100)*arc;
  const color = score>=75?"#10B981":score>=55?"#F59E0B":"#EF4444";
  return (
    <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(135deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size*0.065} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size*0.065} strokeDasharray={`${arc-offset} ${circ}`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 6px ${color}60)`}}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-white" style={{fontSize:size*0.22}}>{anim}</span>
        <span className="text-slate-400" style={{fontSize:size*0.09}}>{label}</span>
      </div>
    </div>
  );
}
