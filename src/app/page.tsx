// src/app/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  FileText, Zap, Target, TrendingUp,
  Download, GitCompare, ArrowRight, CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: <Zap size={22} />,
    title: "ATS Score",
    desc: "Get a 0–100 compatibility score with detailed breakdown across keywords, formatting, and readability.",
  },
  {
    icon: <Target size={22} />,
    title: "Job Matching",
    desc: "Paste any job description and instantly see your match percentage plus missing skills.",
  },
  {
    icon: <FileText size={22} />,
    title: "Skill Extraction",
    desc: "AI categorizes all your skills into Technical, Soft Skills, and Tools & Technologies.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Section Analysis",
    desc: "Every resume section scored individually — Contact, Summary, Experience, Skills, and more.",
  },
  {
    icon: <GitCompare size={22} />,
    title: "Resume Comparison",
    desc: "Upload two versions and compare ATS scores, keyword coverage, and improvements side by side.",
  },
  {
    icon: <Download size={22} />,
    title: "Download Improved",
    desc: "Get an AI-rewritten, ATS-optimized version of your resume ready to download.",
  },
];

const steps = [
  { step: "01", title: "Upload Resume",     desc: "Drop your PDF or DOCX resume" },
  { step: "02", title: "AI Analysis",       desc: "Groq AI analyzes every detail" },
  { step: "03", title: "Get Your Score",    desc: "See ATS score, skills & gaps" },
  { step: "04", title: "Download Improved", desc: "Export your optimized resume" },
];

export default function LandingPage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "transparent", position: "relative", zIndex: 1 }}
    >
      <Header />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "radial-gradient(ellipse at center, transparent 10%, rgba(13,31,26,0.55) 100%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 skill-tag"
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--matcha)" }} />
            <span className="text-sm">Powered by Groq AI (Llama 3.3 70B)</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-black leading-tight mb-6"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize:   "clamp(2.5rem, 6vw, 4.5rem)",
              color:      "var(--text-primary)",
            }}
          >
            Land Your Dream Job
            <br />
            <span style={{
              background:           "linear-gradient(135deg, #1C6E4A, #A8C686)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
            }}>
              Beat the ATS System
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg mb-10 max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)", fontFamily: "Roboto, sans-serif", lineHeight: "1.7" }}
          >
            Upload your resume and get an instant AI-powered ATS score,
            skill gap analysis, job description matching, and a fully
            improved version — all in under 15 seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/analyze">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-primary text-base px-8 py-4 flex items-center gap-2"
              >
                Analyze My Resume <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link href="/compare">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-secondary text-base px-8 py-4"
              >
                Compare Versions
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-6 mt-12"
          >
            {["No login required", "Results in 15 seconds", "Auto-deleted in 24h"].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <CheckCircle size={15} style={{ color: "var(--matcha)" }} />
                {badge}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>scroll down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border flex items-start justify-center pt-1"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <div className="w-1 h-2 rounded-full" style={{ background: "var(--matcha)" }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
              How It Works
            </h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              From upload to optimized resume in 4 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center relative"
              >
                <div
                  className="text-4xl font-black mb-3"
                  style={{
                    fontFamily: "Inter",
                    background: "linear-gradient(135deg, #1C6E4A, #A8C686)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.step}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)", fontFamily: "Inter" }}>
                  {s.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10"
                    style={{ color: "var(--matcha)" }}>
                    <ArrowRight size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
              Everything You Need
            </h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              A complete resume intelligence platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass-card p-6 group cursor-default"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(28,110,74,0.2)", color: "var(--matcha)" }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--text-primary)", fontFamily: "Inter" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Inter", color: "var(--text-primary)" }}>
              Ready to Get Hired?
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
              Upload your resume now — no sign up, no credit card, instant results.
            </p>
            <Link href="/analyze">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
              >
                Analyze My Resume Free <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t text-center"
        style={{ borderColor: "var(--glass-border)", color: "var(--text-muted)" }}>
        <p className="text-sm">© 2025 ResumeAI — Built with Next.js, Groq AI & Three.js</p>
      </footer>
    </main>
  );
}