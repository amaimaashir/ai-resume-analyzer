// src/app/download/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { improveResume } from "@/lib/api";
import {
  Download, CheckCircle2, FileText,
  ArrowLeft, Sparkles, Loader2, AlertCircle,
} from "lucide-react";

export default function DownloadPage() {
  const router = useRouter();
  const [improvedText, setImprovedText] = useState("");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [downloaded, setDownloaded]     = useState(false);

  useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId");
    const resumeId  = sessionStorage.getItem("resumeId");

    if (!sessionId || !resumeId) {
      router.push("/analyze");
      return;
    }

    improveResume(sessionId, resumeId)
      .then((res) => setImprovedText(res.improvedText))
      .catch((e)  => setError(e.message || "Failed to generate improved resume."))
      .finally(() => setLoading(false));
  }, [router]);

  const handleDownload = () => {
    const blob = new Blob([improvedText], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "improved-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  if (loading) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "var(--bg-primary)" }}>
      <Loader2 size={40} className="animate-spin mb-4" style={{ color: "var(--brand)" }} />
      <p className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)", fontFamily: "Inter" }}>
        Rewriting your resume...
      </p>
      <p style={{ color: "var(--text-secondary)" }}>
        AI is optimizing every bullet point for ATS
      </p>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}>
      <div className="glass-card p-8 text-center max-w-md">
        <AlertCircle size={40} className="mx-auto mb-4" style={{ color: "#FF6B6B" }} />
        <p className="mb-4" style={{ color: "#FF6B6B" }}>{error}</p>
        <Link href="/dashboard">
          <button className="btn-secondary">← Back to Dashboard</button>
        </Link>
      </div>
    </div>
  );

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
              AI has rewritten your resume for maximum ATS compatibility.
            </p>
          </motion.div>

          {/* What was improved */}
          <motion.div className="glass-card p-6 mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="font-semibold mb-4"
              style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
              What the AI improved
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Added strong action verbs to every bullet",
                "Quantified achievements with numbers",
                "Injected ATS keywords naturally",
                "Restructured sections in optimal order",
                "Tightened language and removed filler",
                "Added clear ALL CAPS section headers",
              ].map((item, i) => (
                <motion.div key={i} className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}>
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
            <div className="rounded-xl p-6 font-mono text-xs leading-relaxed overflow-y-auto max-h-96"
              style={{
                background: "var(--bg-secondary)",
                border:     "1px solid var(--card-border)",
                color:      "var(--text-secondary)",
                whiteSpace: "pre-wrap",
              }}>
              {improvedText}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <motion.button className="btn-primary"
              onClick={handleDownload}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ padding: "14px 32px", fontSize: "16px" }}>
              {downloaded
                ? <><CheckCircle2 size={18} /> Downloaded!</>
                : <><Download size={18} /> Download as TXT</>}
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