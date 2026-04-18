// src/app/compare/page.tsx
"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  uploadResume, parseResume, analyzeResume,
  getResults, readFileAsText,
} from "@/lib/api";
import {
  Upload, FileText, GitCompare, TrendingUp,
  TrendingDown, Minus, Loader2, AlertCircle,
} from "lucide-react";

interface ScoreSet {
  atsScore:     number;
  keywordScore: number;
  formatScore:  number;
  readability:  number;
  skills:       { technical: string[]; soft: string[]; tools: string[] };
  fileName:     string;
}

function DiffBadge({ v1, v2 }: { v1: number; v2: number }) {
  const diff = v2 - v1;
  if (diff > 0)  return <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#A8C686" }}><TrendingUp size={12} />+{diff}</span>;
  if (diff < 0)  return <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#E57373" }}><TrendingDown size={12} />{diff}</span>;
  return <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}><Minus size={12} />No change</span>;
}

function ScoreBar({ score, delay }: { score: number; delay: number }) {
  const color = score >= 80 ? "#A8C686" : score >= 60 ? "#1C6E4A" : "#E57373";
  return (
    <div className="score-bar">
      <motion.div
        style={{ height: "100%", borderRadius: 999, background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
      />
    </div>
  );
}

export default function ComparePage() {
  const [v1, setV1]             = useState<ScoreSet | null>(null);
  const [v2, setV2]             = useState<ScoreSet | null>(null);
 //const [v2File, setV2File] = useState<File | null>(null); // eslint-disable-line
  const [v1Loading, setV1Loading] = useState(true);
  const [v2Loading, setV2Loading] = useState(false);
  const [error, setError]       = useState("");

  // Load V1 from current session
  useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) { setV1Loading(false); return; }

    getResults(sessionId)
      .then((data: any) => setV1({
        atsScore:     data.atsScore,
        keywordScore: data.keywordScore,
        formatScore:  data.formatScore,
        readability:  data.readability,
        skills:       data.skills ?? { technical: [], soft: [], tools: [] },
        fileName:     data.fileName ?? "Original Resume",
      }))
      .catch(() => setError("Could not load your original resume scores."))
      .finally(() => setV1Loading(false));
  }, []);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted[0]) return;
    const file = accepted[0];
   // setV2File(file);
    setV2Loading(true);
    setError("");

    try {
      const { sessionId, resumeId } = await uploadResume(file);
      const rawText = await readFileAsText(file);
      await parseResume(sessionId, resumeId, rawText);
      const res = await analyzeResume(sessionId, resumeId) as any;

      // analyzeResume returns { success, resultId, analysis }
      const a = res.analysis;
      setV2({
        atsScore:     a.atsScore,
        keywordScore: a.keywordScore,
        formatScore:  a.formatScore,
        readability:  a.readabilityScore,
        skills:       a.skills ?? { technical: [], soft: [], tools: [] },
        fileName:     file.name,
      });
    } catch (e: any) {
      setError(e.message || "Failed to analyze new resume.");
    } finally {
      setV2Loading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize:  10 * 1024 * 1024,
  });

  const metrics = v1 && v2 ? [
    { label: "ATS Score",     v1: v1.atsScore,     v2: v2.atsScore     },
    { label: "Keyword Score", v1: v1.keywordScore, v2: v2.keywordScore },
    { label: "Format Score",  v1: v1.formatScore,  v2: v2.formatScore  },
    { label: "Readability",   v1: v1.readability,  v2: v2.readability  },
  ] : [];

  // New skills in V2 not in V1
  const newSkills = v1 && v2 ? [
    ...v2.skills.technical,
    ...v2.skills.tools,
  ].filter(
    (s) => ![...v1.skills.technical, ...v1.skills.tools].includes(s)
  ) : [];

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header />
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">

          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold mb-3"
              style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
              Compare Resume Versions
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Upload an updated resume to see how it improves your ATS score.
            </p>
          </motion.div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl mb-6"
              style={{ background: "rgba(139,0,0,0.15)", border: "1px solid rgba(220,50,50,0.3)" }}>
              <AlertCircle size={18} style={{ color: "#FF6B6B" }} />
              <p className="text-sm" style={{ color: "#FF6B6B" }}>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* V1 Card */}
            <motion.div className="glass-card p-6"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--olive)", color: "white" }}>1</div>
                <h3 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                  Original Resume
                </h3>
              </div>

              {v1Loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={28} className="animate-spin" style={{ color: "var(--brand)" }} />
                </div>
              ) : v1 ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}>
                    <FileText size={18} style={{ color: "var(--matcha)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{v1.fileName}</span>
                  </div>
                  <div className="text-center py-4">
                    <span className="text-5xl font-extrabold"
                      style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                      {v1.atsScore}
                    </span>
                    <span className="text-lg ml-1" style={{ color: "var(--text-muted)" }}>/100</span>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>ATS Score</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                    No analyzed resume found.
                  </p>
                  <Link href="/analyze">
                    <button className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
                      Analyze a Resume First
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* V2 Card */}
            <motion.div className="glass-card p-6"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--brand)", color: "white" }}>2</div>
                <h3 className="font-semibold" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                  New Version
                </h3>
              </div>

              {v2Loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 size={28} className="animate-spin" style={{ color: "var(--brand)" }} />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Analyzing new resume...</p>
                </div>
              ) : v2 ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)" }}>
                    <FileText size={18} style={{ color: "var(--matcha)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{v2.fileName}</span>
                  </div>
                  <div className="text-center py-4">
                    <span className="text-5xl font-extrabold"
                      style={{ fontFamily: "Inter", color: "var(--matcha)" }}>
                      {v2.atsScore}
                    </span>
                    <span className="text-lg ml-1" style={{ color: "var(--text-muted)" }}>/100</span>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>ATS Score</p>
                  </div>
                </>
              ) : (
                <div {...getRootProps()}
                  className={`upload-zone p-8 text-center ${isDragActive ? "drag-over" : ""}`}>
                  <input {...getInputProps()} />
                  <Upload size={28} className="mx-auto mb-3" style={{ color: "var(--matcha)" }} />
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                    {isDragActive ? "Drop it!" : "Upload updated resume"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>PDF or DOCX · max 10MB</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Side-by-side comparison */}
          {v1 && v2 && (
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
                      <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                        {m.label}
                      </span>
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

              {newSkills.length > 0 && (
                <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--glass-border)" }}>
                  <h3 className="font-semibold mb-4"
                    style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
                    New Skills Detected in v2
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {newSkills.map((skill) => (
                      <span key={skill} className="skill-tag"
                        style={{ borderColor: "var(--matcha)", color: "var(--matcha)" }}>
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {newSkills.length === 0 && (
                <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid var(--glass-border)" }}>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No new skills detected between versions.
                  </p>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}