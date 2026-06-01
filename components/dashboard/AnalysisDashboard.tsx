"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Zap, Download, CheckCircle, Eye, Users, Road, Globe, TrendingUp, Target } from "lucide-react";
import type { ResumeData, AnalysisResult, OptimizedResume, RecruiterPersona } from "@/types/resume";
import ScoreGauge from "./ScoreGauge";
import ScoreCard from "./ScoreCard";
import ATSMatrix from "./ATSMatrix";
import ParserView from "./ParserView";
import KeywordAnalysis from "./KeywordAnalysis";
import IssueList from "./IssueList";
import InterviewFunnel from "./InterviewFunnel";
import RecruiterPanel from "./RecruiterPanel";
import ComparisonView from "./ComparisonView";
import DownloadCenter from "./DownloadCenter";
import InterviewPrepView from "./InterviewPrepView";
import CareerRoadmapView from "./CareerRoadmapView";
import LinkedInView from "./LinkedInView";

interface Props { resumeData: ResumeData; analysisResult: AnalysisResult; jobDescription?: string; onBack: () => void; }
type Tab = "overview"|"keywords"|"ats"|"parser"|"optimize"|"interview"|"roadmap"|"linkedin"|"download";

export default function AnalysisDashboard({ resumeData, analysisResult, jobDescription, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState<OptimizedResume|null>(null);
  const [recruiterPanel, setRecruiterPanel] = useState<RecruiterPersona[]|null>(null);
  const [optimizeError, setOptimizeError] = useState("");
  const [animScore, setAnimScore] = useState(0);

  useEffect(()=>{
    const start=Date.now();
    const tick=()=>{const p=Math.min(1,(Date.now()-start)/1500);setAnimScore(Math.round((1-Math.pow(1-p,3))*analysisResult.atsScore));if(p<1)requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
  },[analysisResult.atsScore]);

  const handleOptimize=async()=>{
    setOptimizing(true);setOptimizeError("");
    try{
      const r=await fetch("/api/optimize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeData,analysisResult,jobDescription})});
      const d=await r.json();
      if(d.success){setOptimized(d.data.optimized);setRecruiterPanel(d.data.recruiterPanel);setActiveTab("optimize");}
      else setOptimizeError(d.error||"Optimization failed");
    }catch{setOptimizeError("Failed to connect. Please try again.");}
    setOptimizing(false);
  };

  const sc=(s:number)=>s>=75?"#10B981":s>=55?"#F59E0B":"#EF4444";
  const grade=(s:number)=>s>=90?"A+":s>=80?"A":s>=70?"B":s>=60?"C":s>=50?"D":"F";
  const tabs=[
    {id:"overview",label:"Overview",icon:<TrendingUp size={14}/>},
    {id:"keywords",label:"Keywords",icon:<Target size={14}/>},
    {id:"ats",label:"ATS Systems",icon:<CheckCircle size={14}/>},
    {id:"parser",label:"Parser View",icon:<Eye size={14}/>},
    {id:"optimize",label:"AI Optimize",icon:<Zap size={14}/>},
    {id:"interview",label:"Interview Prep",icon:<Users size={14}/>},
    {id:"roadmap",label:"Career Roadmap",icon:<Road size={14}/>},
    {id:"linkedin",label:"LinkedIn",icon:<Globe size={14}/>},
    {id:"download",label:"Download",icon:<Download size={14}/>},
  ] as const;

  return (
    <div className="min-h-screen" style={{background:"#0A0A0F"}}>
      <div className="sticky top-0 z-50 border-b border-white/5" style={{background:"rgba(10,10,15,0.9)",backdropFilter:"blur(12px)"}}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"><ArrowLeft size={16}/> Back</button>
            <div className="hidden sm:block text-slate-600">|</div>
            <span className="hidden sm:block text-slate-400 text-sm truncate max-w-48">{resumeData.name||"Resume"} — {resumeData.targetRole||"Analysis"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl">
              <span className="text-slate-400 text-xs">ATS Score</span>
              <span className="font-black text-lg" style={{color:sc(animScore)}}>{animScore}</span>
              <span className="text-xs font-bold" style={{color:sc(animScore)}}>{grade(animScore)}</span>
            </div>
            <button onClick={handleOptimize} disabled={optimizing} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all text-white" style={{background:"#3B82F6",opacity:optimizing?0.5:1}}>
              <Zap size={14}/>{optimizing?"Optimizing...":"Optimize with AI"}
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-0 border-b border-white/5">
            {tabs.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id as Tab)} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all" style={{borderColor:activeTab===tab.id?"#3B82F6":"transparent",color:activeTab===tab.id?"#60A5FA":"#64748B"}}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {optimizeError&&<div className="mb-4 p-3 rounded-xl text-red-400 text-sm" style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)"}}>{optimizeError}</div>}

        {activeTab==="overview"&&(
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-6 flex flex-col items-center">
                <ScoreGauge score={analysisResult.atsScore} label="ATS Score" size={140}/>
                <div className="mt-3 text-center">
                  <p className="text-sm font-medium" style={{color:sc(analysisResult.atsScore)}}>{analysisResult.atsScore>=75?"Strong Resume":analysisResult.atsScore>=55?"Needs Improvement":"Requires Major Work"}</p>
                  <p className="text-slate-500 text-xs mt-1">Better than {analysisResult.marketPercentile}% of candidates</p>
                </div>
              </div>
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[{label:"Keyword Score",value:analysisResult.keywordScore},{label:"Formatting",value:analysisResult.formattingScore},{label:"Readability",value:analysisResult.readabilityScore},{label:"Skills",value:analysisResult.skillsScore},{label:"Experience",value:analysisResult.experienceScore},{label:"Recruiter Appeal",value:analysisResult.recruiterAppeal}].map(({label,value})=><ScoreCard key={label} label={label} score={value}/>)}
              </div>
            </div>
            <InterviewFunnel result={analysisResult}/>
            {analysisResult.strongPoints.length>0&&(
              <div className="glass rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/>What&apos;s Working Well</h3>
                <div className="space-y-2">{analysisResult.strongPoints.map((pt,i)=><div key={i} className="flex items-start gap-2 text-sm text-slate-300"><span className="text-green-400 mt-0.5">✓</span>{pt}</div>)}</div>
              </div>
            )}
            <IssueList issues={analysisResult.issues}/>
            {recruiterPanel&&<RecruiterPanel personas={recruiterPanel}/>}
          </div>
        )}
        {activeTab==="keywords"&&<KeywordAnalysis matches={analysisResult.keywordMatches} jobMatchScore={analysisResult.jobMatchScore} hasJobDesc={!!jobDescription}/>}
        {activeTab==="ats"&&<ATSMatrix systems={analysisResult.atsSystemScores}/>}
        {activeTab==="parser"&&<ParserView fields={analysisResult.parserFields} resume={resumeData}/>}
        {activeTab==="optimize"&&(optimized?<ComparisonView original={analysisResult} optimized={optimized} originalResume={resumeData}/>:(
          <div className="glass rounded-2xl p-10 text-center">
            <Zap size={40} className="text-blue-400 mx-auto mb-4"/>
            <h3 className="text-white font-semibold text-lg mb-2">AI Resume Optimization</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Claude AI rewrites your resume to maximise ATS compatibility and recruiter appeal. Never invents experience.</p>
            <button onClick={handleOptimize} disabled={optimizing} className="px-6 py-3 rounded-xl font-semibold text-white transition-all" style={{background:"#3B82F6",opacity:optimizing?0.5:1}}>{optimizing?"Optimizing...":"Start AI Optimization"}</button>
          </div>
        ))}
        {activeTab==="interview"&&<InterviewPrepView resumeData={resumeData}/>}
        {activeTab==="roadmap"&&<CareerRoadmapView resumeData={resumeData}/>}
        {activeTab==="linkedin"&&<LinkedInView resumeData={resumeData}/>}
        {activeTab==="download"&&<DownloadCenter resumeData={resumeData} analysisResult={analysisResult} optimizedResume={optimized}/>}
      </div>
    </div>
  );
}
