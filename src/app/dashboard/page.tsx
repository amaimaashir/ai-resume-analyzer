// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { getResults } from "@/lib/api";
import {
  BarChart2, Brain, Target, Lightbulb,
  Download, GitCompare, ArrowRight, TrendingUp,
  Loader2, Briefcase, CheckCircle2, XCircle,
  AlertCircle,
} from "lucide-react";

function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const radius        = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset        = circumference - (score / 100) * circumference;
  const color         = score >= 80 ? "#A8C686" : score >= 60 ? "#1C6E4A" : "#E57373";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="var(--bg-tertiary)" strokeWidth={8} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.span
          className="text-3xl font-extrabold"
          style={{ fontFamily: "Inter", color: "var(--text-primary)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="block text-xs" style={{ color: "var(--text-muted)" }}>/100</span>
      </div>
    </div>
  );
}

function ScoreBar({ score, delay }: { score: number; delay: number }) {
  return (
    <div className="score-bar">
      <motion.div
        className="score-bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) { router.push("/analyze"); return; }

    getResults(sessionId)
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load results."))
      .finally(() => setLoading(false));
  }, [router]);

  const scoreColor = (s: number) =>
    s >= 80 ? "#A8C686" : s >= 60 ? "#1C6E4A" : "#E57373";

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}>
      <div className="text-center">
        <Loader2 size={40} className="animate-spin mx-auto mb-4"
          style={{ color: "var(--brand)" }} />
        <p style={{ color: "var(--text-secondary)" }}>Loading your results...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}>
      <div className="text-center glass-card p-8 max-w-md mx-4">
        <AlertCircle size={40} className="mx-auto mb-4" style={{ color: "#FF6B6B" }} />
        <p className="text-lg mb-4" style={{ color: "#FF6B6B" }}>{error}</p>
        <Link href="/analyze">
          <button className="btn-primary">Try Again</button>
        </Link>
      </div>
    </div>
  );

  if (!data) return null;

  const jm = data.jobMatch;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header />
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <motion.div className="mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
              Analysis results for
            </p>
            <h1 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
              {data.fileName || "your-resume.pdf"}
            </h1>
          </motion.div>

          {/* ATS Score + Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Score Ring */}
            <motion.div className="glass-card p-8 flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={20} style={{ color: "var(--matcha)" }} />
                <h2 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                  ATS Score
                </h2>
              </div>
              <ScoreRing score={data.atsScore} />
              <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                {data.atsScore >= 80 ? "Excellent — ATS ready!" :
                 data.atsScore >= 60 ? "Good — a few improvements needed." :
                 "Needs work — follow the suggestions below."}
              </p>
            </motion.div>

            {/* Score Breakdown */}
            <motion.div className="glass-card p-8 lg:col-span-2"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={20} style={{ color: "var(--matcha)" }} />
                <h2 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                  Score Breakdown
                </h2>
              </div>
              <div className="flex flex-col gap-5">
                {[
                  { label: "Keyword Density", score: data.keywordScore },
                  { label: "Formatting",      score: data.formatScore  },
                  { label: "Readability",     score: data.readability  },
                ].map((item, i) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold"
                        style={{ color: scoreColor(item.score), fontFamily: "Inter" }}>
                        {item.score}/100
                      </span>
                    </div>
                    <ScoreBar score={item.score} delay={0.3 + i * 0.15} />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── JOB MATCH CARD ── only shown if user provided a JD ── */}
          {jm && (
            <motion.div className="glass-card p-8 mb-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center gap-2 mb-6">
                <Briefcase size={20} style={{ color: "var(--matcha)" }} />
                <h2 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                  Job Match
                </h2>
                {/* Match % badge */}
                <span
                  className="ml-auto text-2xl font-extrabold"
                  style={{
                    fontFamily: "Inter",
                    color: jm.matchPercent >= 70 ? "#A8C686"
                         : jm.matchPercent >= 45 ? "#1C6E4A"
                         : "#E57373",
                  }}
                >
                  {jm.matchPercent}%
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>match</span>
              </div>

              {/* Match bar */}
              <div className="mb-6">
                <div className="score-bar" style={{ height: 10 }}>
                  <motion.div
                    style={{
                      height: "100%", borderRadius: 999,
                      background: jm.matchPercent >= 70
                        ? "linear-gradient(90deg, #1C6E4A, #A8C686)"
                        : jm.matchPercent >= 45
                        ? "linear-gradient(90deg, #556B2F, #1C6E4A)"
                        : "linear-gradient(90deg, #8B0000, #E57373)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${jm.matchPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Matched Skills */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "var(--text-muted)", fontFamily: "Inter" }}>
                    ✓ Matched Skills ({jm.matchedSkills?.length ?? 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(jm.matchedSkills ?? []).length > 0 ? (
                      jm.matchedSkills.map((skill: string, i: number) => (
                        <motion.span key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="skill-tag flex items-center gap-1"
                          style={{ borderColor: "var(--matcha)", color: "var(--matcha)" }}>
                          <CheckCircle2 size={11} />
                          {skill}
                        </motion.span>
                      ))
                    ) : (
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>None detected</p>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "var(--text-muted)", fontFamily: "Inter" }}>
                    ✗ Missing Skills ({jm.missingSkills?.length ?? 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(jm.missingSkills ?? []).length > 0 ? (
                      jm.missingSkills.map((skill: string, i: number) => (
                        <motion.span key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="skill-tag flex items-center gap-1"
                          style={{ borderColor: "#E57373", color: "#E57373" }}>
                          <XCircle size={11} />
                          {skill}
                        </motion.span>
                      ))
                    ) : (
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>None — great match!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              {jm.recommendation && (
                <div className="p-4 rounded-xl"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-muted)", fontFamily: "Inter" }}>
                    AI Recommendation
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {jm.recommendation}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Skills */}
          <motion.div className="glass-card p-8 mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-2 mb-6">
              <Brain size={20} style={{ color: "var(--matcha)" }} />
              <h2 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                Extracted Skills
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Technical Skills", items: data.skills?.technical ?? [] },
                { label: "Soft Skills",      items: data.skills?.soft      ?? [] },
                { label: "Tools",            items: data.skills?.tools     ?? [] },
              ].map((cat) => (
                <div key={cat.label}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "var(--text-muted)", fontFamily: "Inter" }}>
                    {cat.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.length > 0 ? cat.items.map((skill: string, i: number) => (
                      <motion.span key={skill} className="skill-tag"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}>
                        {skill}
                      </motion.span>
                    )) : (
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>None detected</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section Scores */}
          <motion.div className="glass-card p-8 mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center gap-2 mb-6">
              <Target size={20} style={{ color: "var(--matcha)" }} />
              <h2 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                Section Analysis
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.sections ?? []).map((section: any, i: number) => (
                <motion.div key={section.name} className="p-4 rounded-xl"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm"
                      style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                      {section.name}
                    </span>
                    <span className="text-sm font-bold" style={{ color: scoreColor(section.score) }}>
                      {section.score}
                    </span>
                  </div>
                  <div className="score-bar mb-2">
                    <motion.div className="score-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${section.score}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.08 }} />
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{section.tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div className="glass-card p-8 mb-8"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb size={20} style={{ color: "var(--matcha)" }} />
              <h2 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                AI Suggestions
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {(data.suggestions ?? []).map((s: string, i: number) => (
                <motion.div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}>
                  <span className="text-xs font-bold mt-0.5 px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--brand)", color: "white", fontFamily: "Inter" }}>
                    {i + 1}
                  </span>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{s}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Link href="/download">
              <motion.button className="btn-primary"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 28px" }}>
                <Download size={18} /> Get Improved Resume
              </motion.button>
            </Link>
            <Link href="/compare">
              <motion.button className="btn-secondary"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 28px" }}>
                <GitCompare size={18} /> Compare Versions
              </motion.button>
            </Link>
            <Link href="/analyze">
              <motion.button className="btn-secondary"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 28px" }}>
                <ArrowRight size={18} /> Analyze Another
              </motion.button>
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}