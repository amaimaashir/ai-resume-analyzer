// src/app/analyze/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
//import { useDropzone } from "react-dropzone";
import { useDropzone, FileRejection } from "react-dropzone";
import Header from "@/components/layout/Header";
import {
  Upload, FileText, X, Briefcase,
  Sparkles, AlertCircle, CheckCircle2,
} from "lucide-react";
import { uploadResume, parseResume, analyzeResume, matchJob, readFileAsText } from "@/lib/api";

const STEPS = [
  "Uploading resume...",
  "Extracting text content...",
  "Calculating ATS score...",
  "Matching job description...",
  "Finalizing results...",
];

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile]           = useState<File | null>(null);
  const [jobDesc, setJobDesc]     = useState("");
  const [error, setError]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep]           = useState(0);
 

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setError("");
    if (rejected.length > 0) {
      setError("Only PDF or DOCX files under 10MB are accepted.");
      return;
    }
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize:  10 * 1024 * 1024,
    maxFiles: 1,
  });

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFile(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) { setError("Please upload a resume first."); return; }
    setError("");
    setIsLoading(true);

    try {
      // Step 1 — Upload file
setStep(0);
const { sessionId, resumeId } = await uploadResume(file);
//alert(`Debug - Session: ${sessionId}`); // temporary debug - remove later
alert(`SID: ${sessionId}`);
      // Step 2 — Extract text on frontend then send to backend
      setStep(1);
      const rawText = await readFileAsText(file);
      console.log("Extracted text length:", rawText.length);
      console.log("Text preview:", rawText.slice(0, 200));
      await parseResume(sessionId, resumeId, rawText);

      // Step 3 — Analyze with AI
      setStep(2);
      await analyzeResume(sessionId, resumeId);

      // Step 4 — Job match
      setStep(3);
      if (jobDesc.trim()) {
        await matchJob(sessionId, resumeId, jobDesc);
      }

      // Step 5 — Done
      setStep(4);

      sessionStorage.setItem("sessionId",      sessionId);
      sessionStorage.setItem("resumeId",       resumeId);
      sessionStorage.setItem("resumeFileName", file.name);
      sessionStorage.setItem("jobDescription", jobDesc);

      setTimeout(() => router.push("/dashboard"), 800);

    } catch (e: unknown) {
      setIsLoading(false);
      const message = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(message);
    }
  };

  // ── LOADING SCREEN ──────────────────────────────
  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: "rgba(13,31,26,0.97)", backdropFilter: "blur(20px)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-16 h-16 rounded-full mb-8"
          style={{
            border:         "3px solid var(--glass-border)",
            borderTopColor: "var(--brand)",
          }}
        />
        <motion.h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "Inter", color: "var(--text-primary)" }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Analyzing your resume...
        </motion.h2>
        <p className="mb-10" style={{ color: "var(--text-secondary)" }}>
          Groq AI is processing your resume
        </p>

        <div className="flex flex-col gap-3 w-72">
          {STEPS.map((stepText, i) => (
            <motion.div
              key={stepText}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div
                animate={i === step ? { scale: [1, 1.3, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <CheckCircle2
                  size={16}
                  style={{
                    color: i < step
                      ? "var(--matcha)"
                      : i === step
                      ? "var(--brand)"
                      : "var(--text-muted)",
                  }}
                />
              </motion.div>
              <span
                className="text-sm"
                style={{
                  color: i <= step ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {stepText}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ── MAIN PAGE ────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh" }}>
      <Header />

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Page Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background:     "var(--glass-bg)",
                border:         "1px solid var(--glass-border)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Sparkles size={14} style={{ color: "var(--matcha)" }} />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--matcha)", fontFamily: "Inter" }}
              >
                AI-Powered Analysis
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "Inter", color: "var(--text-primary)" }}
            >
              Analyze Your Resume
            </h1>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              Upload your resume and get instant ATS score, skill analysis,
              and AI improvements.
            </p>
          </motion.div>

          {/* Upload Card */}
          <motion.div
            className="glass-card p-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ fontFamily: "Inter", color: "var(--text-primary)" }}
            >
              <FileText size={20} style={{ color: "var(--matcha)" }} />
              Upload Resume
              <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>
                (PDF or DOCX, max 10MB)
              </span>
            </h2>

            <div
              {...getRootProps()}
              className={`upload-zone p-10 text-center ${isDragActive ? "drag-over" : ""}`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: "rgba(28,110,74,0.15)",
                    border:     "1px solid var(--glass-border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--brand)" }}
                    >
                      <FileText size={18} color="white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                        {file.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    style={{
                      color:      "var(--text-muted)",
                      cursor:     "pointer",
                      background: "none",
                      border:     "none",
                      padding:    "4px",
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div>
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: "var(--glass-bg)",
                      border:     "1px solid var(--glass-border)",
                    }}
                  >
                    <Upload size={28} style={{ color: "var(--matcha)" }} />
                  </div>
                  <p
                    className="font-semibold mb-1"
                    style={{ fontFamily: "Inter", color: "var(--text-primary)" }}
                  >
                    {isDragActive ? "Drop it here!" : "Drag & drop your resume"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    or{" "}
                    <span style={{ color: "var(--matcha)", textDecoration: "underline" }}>
                      browse files
                    </span>
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    PDF or DOCX · Max 10MB
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Job Description Card */}
          <motion.div
            className="glass-card p-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2
              className="text-lg font-semibold mb-2 flex items-center gap-2"
              style={{ fontFamily: "Inter", color: "var(--text-primary)" }}
            >
              <Briefcase size={20} style={{ color: "var(--matcha)" }} />
              Job Description
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--glass-bg)",
                  color:      "var(--text-muted)",
                  border:     "1px solid var(--glass-border)",
                }}
              >
                Optional
              </span>
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Paste a job description to get match % and missing skills.
              You can skip this and analyze resume only.
            </p>
            <textarea
              className="glass-input"
              rows={5}
              placeholder="Optional — paste job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{   opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 rounded-xl mb-6"
                style={{
                  background: "rgba(139,0,0,0.15)",
                  border:     "1px solid rgba(220,50,50,0.3)",
                }}
              >
                <AlertCircle size={18} style={{ color: "#FF6B6B" }} />
                <p className="text-sm" style={{ color: "#FF6B6B" }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyze Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              type="button"
              onClick={handleAnalyze}
              style={{
                padding:        "16px",
                fontSize:       "17px",
                width:          "100%",
                opacity:        file ? 1 : 0.5,
                cursor:         file ? "pointer" : "not-allowed",
                background:     "var(--brand)",
                color:          "white",
                borderRadius:   "10px",
                fontFamily:     "Inter",
                fontWeight:     600,
                border:         "none",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            "8px",
                transition:     "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (file) e.currentTarget.style.background = "var(--brand-dark)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--brand)";
              }}
            >
              <Sparkles size={20} />
              {file ? "Analyze My Resume" : "Upload a resume to continue"}
            </button>
          </motion.div>

          <p
            className="text-center text-xs mt-4"
            style={{ color: "var(--text-muted)" }}
          >
            Your resume is processed securely and deleted within 24 hours.
          </p>

        </div>
      </div>
    </div>
  );
}