"use client";
import { useState } from "react";
import { Download, FileText, BarChart3, TrendingUp, Users } from "lucide-react";
import type { ResumeData, AnalysisResult, OptimizedResume } from "@/types/resume";

interface Props { resumeData: ResumeData; analysisResult: AnalysisResult; optimizedResume: OptimizedResume | null; }

function generateATSReport(resume: ResumeData, analysis: AnalysisResult): string {
  const line = "─".repeat(60);
  return `RESUME.AI — ATS ANALYSIS REPORT\nGenerated: ${new Date().toLocaleString()}\n${line}\nCANDIDATE: ${resume.name||"Unknown"}\nTARGET ROLE: ${resume.targetRole||"Not specified"}\n${line}\nSCORES\n${line}\nATS Score:            ${analysis.atsScore}/100\nKeyword Score:        ${analysis.keywordScore}/100\nFormatting Score:     ${analysis.formattingScore}/100\nReadability Score:    ${analysis.readabilityScore}/100\nSkills Score:         ${analysis.skillsScore}/100\nExperience Score:     ${analysis.experienceScore}/100\nRecruiter Appeal:     ${analysis.recruiterAppeal}/100\n${line}\nINTERVIEW PROBABILITY\n${line}\nATS Pass:             ${analysis.interviewPassProbability}%\nRecruiter Shortlist:  ${analysis.recruiterShortlistProbability}%\nInterview:            ${analysis.interviewProbability}%\nFinal Round:          ${analysis.finalRoundProbability}%\nJob Offer:            ${analysis.offerProbability}%\n${line}\nATS SYSTEM COMPATIBILITY\n${line}\n${analysis.atsSystemScores.map(s=>`${s.system.padEnd(22)} ${s.score}%`).join("\n")}\n${line}\nISSUES (${analysis.issues.length} found)\n${line}\n${analysis.issues.map((issue,i)=>`${i+1}. [${issue.type.toUpperCase()}] ${issue.title}\n   Location: ${issue.location}\n   Issue: ${issue.description}\n   Fix: ${issue.suggestion}\n   Score Gain: +${issue.scoreGain} points`).join("\n\n")}\n${line}\nMISSING KEYWORDS\n${line}\n${analysis.missingKeywords.slice(0,15).join(", ")||"None detected"}\n${line}\nResume.AI — Free forever. No signup.`;
}

export default function DownloadCenter({ resumeData, analysisResult, optimizedResume }: Props) {
  const [downloading, setDownloading] = useState<string|null>(null);
  const name = (resumeData.name||"Resume").replace(/\s+/g,"_");
  const role = (resumeData.targetRole||"Professional").replace(/\s+/g,"_");
  const dl = (content: string, filename: string) => {
    const blob = new Blob([content], {type:"text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
  };
  const dlJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
  };
  const handleDownload = async (type: string) => {
    setDownloading(type);
    if (type==="ats-report") dl(generateATSReport(resumeData,analysisResult),`${name}_${role}_ATS_Report.txt`);
    else if (type==="resume-txt") dl(resumeData.rawText,`${name}_${role}_Resume.txt`);
    else if (type==="full-analysis") dlJson({resume:resumeData,analysis:analysisResult},`${name}_${role}_Full_Analysis.json`);
    else if (type==="optimized") dlJson(optimizedResume,`${name}_${role}_Optimized.json`);
    setTimeout(()=>setDownloading(null),500);
  };
  const items=[
    {id:"resume-txt",icon:<FileText size={20} className="text-blue-400"/>,title:"Resume (Text)",desc:"Clean text version of your parsed resume",available:true},
    {id:"ats-report",icon:<BarChart3 size={20} className="text-green-400"/>,title:"ATS Analysis Report",desc:"Full scoring breakdown with all issues",available:true},
    {id:"full-analysis",icon:<TrendingUp size={20} className="text-violet-400"/>,title:"Full Analysis (JSON)",desc:"Complete machine-readable analysis results",available:true},
    {id:"optimized",icon:<Users size={20} className="text-yellow-400"/>,title:"Optimized Resume Data",desc:"AI-optimized content — requires AI optimization first",available:!!optimizedResume},
  ];
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-5">Download Center</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(item=>(
            <div key={item.id} onClick={()=>item.available&&handleDownload(item.id)} className={`border rounded-xl p-4 transition-all ${item.available?"border-white/8 cursor-pointer hover:border-white/20":"border-white/4 opacity-50 cursor-not-allowed"}`} style={{background:"rgba(255,255,255,0.02)"}}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white text-sm font-medium">{item.title}</span>
                    {downloading===item.id?<span className="text-blue-400 text-xs">↓</span>:item.available&&<Download size={14} className="text-slate-500 shrink-0"/>}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-3">Share Your Score</h3>
        <div className="rounded-xl p-6 text-center" style={{background:"linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))",border:"1px solid rgba(59,130,246,0.2)"}}>
          <div className="text-5xl font-black text-white mb-1">{analysisResult.atsScore}</div>
          <div className="text-blue-400 text-sm mb-3">ATS Score — Resume.AI</div>
          <div className="flex justify-center gap-3 text-xs text-slate-400 flex-wrap">
            <span>🎯 {analysisResult.interviewProbability}% interview probability</span>
            <span>📊 Top {100-analysisResult.marketPercentile}% of candidates</span>
          </div>
        </div>
        <button onClick={()=>{const t=`I scored ${analysisResult.atsScore}/100 on my ATS resume check! ${analysisResult.interviewProbability}% interview probability. Free check at resume-ai.vercel.app`;if(navigator.share)navigator.share({title:"My ATS Score",text:t});else{navigator.clipboard.writeText(t);alert("Copied to clipboard!");}}} className="mt-3 w-full py-2.5 rounded-xl text-sm font-medium transition-all" style={{background:"rgba(59,130,246,0.2)",color:"#60A5FA",border:"1px solid rgba(59,130,246,0.2)"}}>Share Score</button>
      </div>
    </div>
  );
}
