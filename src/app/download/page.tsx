// src/app/download/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { Download, CheckCircle2, FileText, ArrowLeft, Sparkles } from "lucide-react";

const MOCK_IMPROVED = `John Doe
john.doe@email.com | linkedin.com/in/johndoe | github.com/johndoe | +1 (555) 123-4567

PROFESSIONAL SUMMARY
Results-driven Full Stack Developer with 4+ years of experience building scalable web applications using React, TypeScript, and Node.js. Proven track record of delivering high-performance solutions, reducing load times by 40%, and leading cross-functional agile teams. Seeking to leverage expertise in cloud infrastructure and CI/CD pipelines to drive innovation at a forward-thinking tech company.

TECHNICAL SKILLS
Languages:    JavaScript (ES2023), TypeScript, Python, SQL
Frontend:     React 18, Next.js 14, Tailwind CSS, Framer Motion
Backend:      Node.js, Express, REST APIs, GraphQL
DevOps:       Docker, AWS (EC2, S3, Lambda), CI/CD, GitHub Actions
Databases:    PostgreSQL, MongoDB, Redis
Tools:        Git, Jira, Figma, VS Code

PROFESSIONAL EXPERIENCE
Senior Frontend Developer | TechCorp Inc. | Jan 2022 – Present
- Architected and shipped 12 production features using React 18 and TypeScript, serving 50,000+ daily users
- Reduced page load time by 40% through code splitting, lazy loading, and CDN optimization
- Led a team of 4 developers using agile methodologies, achieving 95% sprint completion rate
- Implemented CI/CD pipeline using GitHub Actions, reducing deployment time from 2 hours to 15 minutes

Frontend Developer | StartupXYZ | Jun 2020 – Dec 2021
- Built responsive dashboard UI with React and Tailwind CSS, increasing user engagement by 35%
- Integrated REST APIs and WebSocket connections for real-time data visualization
- Wrote comprehensive unit and integration tests using Jest and React Testing Library (90% coverage)

EDUCATION
B.Sc. Computer Science | University of Technology | 2020 | GPA: 3.8/4.0

PROJECTS
AI Resume Analyzer | Next.js, TypeScript, Google Gemini API, Cloudflare Workers
- Built an AI-powered resume analysis tool processing 1,000+ resumes per day
- Integrated Google Gemini API for NLP-based skill extraction and ATS scoring`;

export default function DownloadPage() {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    // Real PDF generation wired in Phase 4
    const blob = new Blob([MOCK_IMPROVED], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "improved-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
<div style={{ minHeight: "100vh" }}>
    <Header />
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">

          <motion.div className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <Sparkles size={14} style={{ color: "var(--matcha)" }} />
              <span className="text-sm" style={{ color: "var(--matcha)", fontFamily: "Inter" }}>
                AI-Improved Resume Ready
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-3"
              style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
              Your Improved Resume
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Gemini AI has rewritten your resume for maximum ATS compatibility.
            </p>
          </motion.div>

          {/* Improvements summary */}
          <motion.div className="glass-card p-6 mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="font-semibold mb-4" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
              What was improved
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Added quantified achievements to all experience entries",
                "Expanded summary with role-specific keywords",
                "Reorganized skills section by category",
                "Added LinkedIn and GitHub to contact section",
                "Standardized bullet point formatting throughout",
                "Inserted CI/CD, Docker, and AWS keywords",
              ].map((item, i) => (
                <motion.div key={i} className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}>
                  <CheckCircle2 size={16} style={{ color: "var(--matcha)", flexShrink: 0, marginTop: 2 }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Resume Preview */}
          <motion.div className="glass-card p-8 mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} style={{ color: "var(--matcha)" }} />
              <h2 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                Preview
              </h2>
            </div>
            <div
              className="rounded-xl p-6 font-mono text-xs leading-relaxed overflow-y-auto max-h-96"
              style={{
                background:  "var(--bg-secondary)",
                border:      "1px solid var(--card-border)",
                color:       "var(--text-secondary)",
                whiteSpace:  "pre-wrap",
              }}
            >
              {MOCK_IMPROVED}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <motion.button
              className="btn-primary"
              onClick={handleDownload}
              whileHover={{ scale: 1.03 }}
              whileTap={{  scale: 0.97 }}
              style={{ padding: "14px 32px", fontSize: "16px" }}
            >
              {downloaded
                ? <><CheckCircle2 size={18} /> Downloaded!</>
                : <><Download size={18} /> Download as PDF</>}
            </motion.button>
            <Link href="/dashboard">
              <motion.button className="btn-secondary"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 28px" }}>
                <ArrowLeft size={18} /> Back to Dashboard
              </motion.button>
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
