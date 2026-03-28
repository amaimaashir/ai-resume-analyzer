// src/app/compare/page.tsx
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Header from "@/components/layout/Header";
import { Upload, FileText, GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react";

const MOCK_V1 = { atsScore: 72, keywordScore: 68, formatScore: 85, readability: 74,
  skills: ["React", "TypeScript", "Node.js", "Python", "SQL", "Git"] };
const MOCK_V2 = { atsScore: 85, keywordScore: 82, formatScore: 88, readability: 86,
  skills: ["React", "TypeScript", "Node.js", "Python", "SQL", "Git", "Docker", "AWS", "CI/CD"] };

function DiffBadge({ v1, v2 }: { v1: number; v2: number }) {
  const diff = v2 - v1;
  if (diff > 0)  return <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#A8C686" }}><TrendingUp size={12} />+{diff}</span>;
  if (diff < 0)  return <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#E57373" }}><TrendingDown size={12} />{diff}</span>;
  return <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}><Minus size={12} />0</span>;
}

function ScoreBar({ score, delay }: { score: number; delay: number }) {
  return (
    <div className="score-bar">
      <motion.div className="score-bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, delay, ease: "easeOut" }} />
    </div>
  );
}

export default function ComparePage() {
  const [v2File, setV2File] = useState<File | null>(null);
  const [compared, setCompared] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setV2File(accepted[0]); setCompared(true); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  });

  const metrics = [
    { label: "ATS Score",      v1: MOCK_V1.atsScore,      v2: MOCK_V2.atsScore      },
    { label: "Keyword Score",  v1: MOCK_V1.keywordScore,  v2: MOCK_V2.keywordScore  },
    { label: "Format Score",   v1: MOCK_V1.formatScore,   v2: MOCK_V2.formatScore   },
    { label: "Readability",    v1: MOCK_V1.readability,   v2: MOCK_V2.readability   },
  ];

  return (
<div style={{ minHeight: "100vh" }}>
    <Header />
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">

          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold mb-3"
              style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
              Compare Versions
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              See how your updated resume stacks up against the original.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Version 1 */}
            <motion.div className="glass-card p-6"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--olive)", color: "white" }}>1</div>
                <h3 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                  Original Resume
                </h3>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}>
                <FileText size={18} style={{ color: "var(--matcha)" }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {sessionStorage.getItem("resumeFileName") || "resume-v1.pdf"}
                </span>
              </div>
              <div className="text-center py-4">
                <span className="text-5xl font-extrabold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                  {MOCK_V1.atsScore}
                </span>
                <span className="text-lg ml-1" style={{ color: "var(--text-muted)" }}>/100</span>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>ATS Score</p>
              </div>
            </motion.div>

            {/* Version 2 */}
            <motion.div className="glass-card p-6"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--brand)", color: "white" }}>2</div>
                <h3 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                  New Version
                </h3>
              </div>
              {!v2File ? (
                <div {...getRootProps()} className={`upload-zone p-8 text-center ${isDragActive ? "drag-over" : ""}`}>
                  <input {...getInputProps()} />
                  <Upload size={28} className="mx-auto mb-3" style={{ color: "var(--matcha)" }} />
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                    {isDragActive ? "Drop it!" : "Upload new version"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>PDF or DOCX</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}>
                    <FileText size={18} style={{ color: "var(--matcha)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{v2File.name}</span>
                  </div>
                  <div className="text-center py-4">
                    <span className="text-5xl font-extrabold" style={{ fontFamily: "Inter", color: "var(--matcha)" }}>
                      {MOCK_V2.atsScore}
                    </span>
                    <span className="text-lg ml-1" style={{ color: "var(--text-muted)" }}>/100</span>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>ATS Score</p>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Comparison Table */}
          {compared && (
            <motion.div className="glass-card p-8"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-6">
                <GitCompare size={20} style={{ color: "var(--matcha)" }} />
                <h2 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                  Side-by-Side Comparison
                </h2>
              </div>
              <div className="flex flex-col gap-6">
                {metrics.map((m, i) => (
                  <div key={m.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{m.label}</span>
                      <DiffBadge v1={m.v1} v2={m.v2} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>v1</span>
                          <span className="text-xs font-bold" style={{ color: "var(--olive)" }}>{m.v1}</span>
                        </div>
                        <ScoreBar score={m.v1} delay={0.3 + i * 0.1} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>v2</span>
                          <span className="text-xs font-bold" style={{ color: "var(--matcha)" }}>{m.v2}</span>
                        </div>
                        <ScoreBar score={m.v2} delay={0.4 + i * 0.1} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill diff */}
              <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--glass-border)" }}>
                <h3 className="font-semibold mb-4" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                  New Skills Added
                </h3>
                <div className="flex flex-wrap gap-2">
                  {MOCK_V2.skills
                    .filter((s) => !MOCK_V1.skills.includes(s))
                    .map((skill) => (
                      <span key={skill} className="skill-tag"
                        style={{ borderColor: "var(--matcha)", color: "var(--matcha)" }}>
                        + {skill}
                      </span>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}