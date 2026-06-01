import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume.AI — Free ATS Resume Optimizer",
  description: "Upload your resume and get an instant ATS score, AI optimization, interview prep, and career roadmap. Free forever. No signup required.",
  keywords: ["ATS resume checker","resume optimizer","AI resume","job application","ATS score"],
  openGraph: { title: "Resume.AI — Free AI Resume Optimizer", description: "Beat the ATS. Land more interviews. Free.", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased" style={{background:"#0A0A0F",color:"#F8FAFC"}}>{children}</body>
    </html>
  );
}
