"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, Zap, Target, Star, BarChart3, Users, TrendingUp, Award, ChevronRight, FileText } from "lucide-react";
import type { ResumeData, AnalysisResult } from "@/types/resume";
import AnalysisDashboard from "@/components/dashboard/AnalysisDashboard";

export default function HomePage() {
  const [dragOver, setDragOver] = useState(false);
  const [jobDesc, setJobDesc] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [step, setStep] = useState<"upload"|"parsing"|"analyzing"|"done">("upload");
  const [progress, setProgress] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData|null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult|null>(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ totalAnalyzed: 12847, activeUsers: 3 });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{fetch("/api/community/stats").then(r=>r.json()).then(d=>{if(d.stats)setStats(d.stats);}).catch(()=>{});}, []);

  const processFile = useCallback(async (f: File) => {
    setError(""); setStep("parsing"); setProgress(0);
    const iv = setInterval(()=>setProgress(p=>Math.min(p+12,85)),200);
    try {
      const fd = new FormData(); fd.append("resume",f);
      const pr = await fetch("/api/parse",{method:"POST",body:fd});
      const pd = await pr.json();
      clearInterval(iv); setProgress(100);
      if(!pd.success){setError(pd.error);setStep("upload");return;}
      setResumeData(pd.data); setStep("analyzing");
      const ar = await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeData:pd.data,jobDescription:jobDesc})});
      const ad = await ar.json();
      if(!ad.success){setError(ad.error);setStep("upload");return;}
      setAnalysisResult(ad.data); setStep("done");
    } catch {
      clearInterval(iv); setError("Something went wrong. Please try again."); setStep("upload");
    }
  }, [jobDesc]);

  const handleDrop = useCallback((e: React.DragEvent)=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)processFile(f);},[processFile]);

  if(step==="done"&&resumeData&&analysisResult) return <AnalysisDashboard resumeData={resumeData} analysisResult={analysisResult} jobDescription={jobDesc} onBack={()=>{setStep("upload");setResumeData(null);setAnalysisResult(null);}}/>;

  return (
    <main className="min-h-screen overflow-x-hidden" style={{background:"#0A0A0F"}}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{background:"rgba(59,130,246,0.05)"}}/>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{background:"rgba(139,92,246,0.05)"}}/>
      </div>
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:"#3B82F6"}}><Zap size={16} className="text-white"/></div>
          <span className="font-bold text-lg text-white">Resume<span style={{color:"#60A5FA"}}>.AI</span></span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="hidden sm:flex items-center gap-1.5"><span className="w-2 h-2 rounded-full animate-pulse" style={{background:"#10B981"}}/>{stats.activeUsers} analyzing now</span>
          <span className="hidden sm:block">{stats.totalAnalyzed.toLocaleString()} resumes analyzed</span>
        </div>
      </nav>

      <section className="relative z-10 text-center px-6 pt-16 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",color:"#60A5FA"}}>
          <Star size={12}/> Free forever · No signup · No credit card
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 leading-none tracking-tight">
          Get the<br/><span className="gradient-text">Interview.</span>
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto mb-10">
          AI-powered ATS analysis, instant optimization, and personalized career coaching.<br className="hidden sm:block"/>Outperform 95% of applicants — completely free.
        </p>

        <div className="max-w-xl mx-auto">
          {step==="upload"&&(
            <>
              <div className={`upload-zone rounded-2xl p-10 cursor-pointer${dragOver?" drag-over":""}`}
                onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop} onClick={()=>fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={e=>e.target.files?.[0]&&processFile(e.target.files[0])}/>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)"}}>
                    <Upload size={28} style={{color:"#60A5FA"}}/>
                  </div>
                  <div><p className="text-white font-semibold text-lg mb-1">Drop your resume here</p><p className="text-slate-500 text-sm">PDF, DOCX, or TXT · Max 5MB</p></div>
                  <button className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors" style={{background:"#3B82F6"}}>Choose File</button>
                </div>
              </div>
              <button onClick={()=>setShowJD(!showJD)} className="mt-4 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors mx-auto">
                <Target size={14}/>{showJD?"Hide":"Add"} job description for deeper match analysis
                <ChevronRight size={14} style={{transform:showJD?"rotate(90deg)":"",transition:"transform 0.2s"}}/>
              </button>
              {showJD&&<textarea value={jobDesc} onChange={e=>setJobDesc(e.target.value.slice(0,3000))} placeholder="Paste the job description here... (optional but recommended)" className="mt-3 w-full h-32 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}/>}
              {error&&<div className="mt-4 p-3 rounded-xl text-red-400 text-sm" style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)"}}>{error}</div>}
            </>
          )}
          {(step==="parsing"||step==="analyzing")&&(
            <div className="glass rounded-2xl p-10">
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)"}}><FileText size={28} style={{color:"#60A5FA"}} className="animate-pulse"/></div>
                <div className="w-full">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">{step==="parsing"?"Parsing resume...":"Running ATS analysis..."}</span>
                    <span style={{color:"#60A5FA"}}>{step==="analyzing"?"✓ Parsed":`${progress}%`}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}>
                    <div className="progress-bar h-full" style={{width:step==="analyzing"?"100%":`${progress}%`}}/>
                  </div>
                  {step==="analyzing"&&<div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}><div className="progress-bar h-full animate-pulse" style={{width:"70%"}}/></div>}
                </div>
                <p className="text-slate-500 text-xs">Processing securely in memory — never stored</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {icon:BarChart3,title:"ATS Score",desc:"Instant scoring across 8 major ATS systems with evidence-based feedback",color:"#3B82F6"},
            {icon:Zap,title:"AI Optimization",desc:"Claude AI rewrites your resume to beat the ATS — never invents experience",color:"#8B5CF6"},
            {icon:Target,title:"Job Matching",desc:"Paste any job description for a tailored keyword gap analysis",color:"#10B981"},
            {icon:Users,title:"Recruiter Panel",desc:"6 virtual reviewers — ATS, recruiter, HR, hiring manager, and more",color:"#F59E0B"},
            {icon:TrendingUp,title:"Career Roadmap",desc:"Personalised 30/60/90 day plans to accelerate your career growth",color:"#EC4899"},
            {icon:Award,title:"Interview Prep",desc:"Role-specific questions with full STAR answer frameworks",color:"#06B6D4"},
          ].map(({icon:Icon,title,desc,color})=>(
            <div key={title} className="glass rounded-2xl p-5 transition-all hover:border-white/15">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{background:`${color}15`,border:`1px solid ${color}20`}}>
                <Icon size={18} style={{color}}/>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 text-center py-8 px-6 border-t border-white/5">
        <p className="text-slate-600 text-xs">🔒 Your resume is processed in memory and never stored · GDPR compliant · Free forever</p>
      </footer>
    </main>
  );
}
