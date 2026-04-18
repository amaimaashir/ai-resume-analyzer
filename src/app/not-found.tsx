// src/app/not-found.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Animated number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <span
          className="font-black"
          style={{
            fontFamily:           "Inter, sans-serif",
            fontSize:             "clamp(6rem, 20vw, 12rem)",
            lineHeight:           1,
            background:           "linear-gradient(135deg, #1C6E4A, #A8C686)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
          }}
        >
          404
        </span>
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: "rgba(28,110,74,0.15)",
          border:     "1px solid var(--glass-border)",
        }}
      >
        <FileText size={28} style={{ color: "var(--matcha)" }} />
      </motion.div>

      {/* Text */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold mb-3"
        style={{ fontFamily: "Inter", color: "var(--text-primary)" }}
      >
        Page Not Found
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-base mb-10 max-w-sm"
        style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
      >
        Looks like this page doesn't exist. Let's get you back on track.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex items-center gap-2"
            style={{ padding: "12px 24px" }}
          >
            <Home size={18} /> Go Home
          </motion.button>
        </Link>
        <Link href="/analyze">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-secondary flex items-center gap-2"
            style={{ padding: "12px 24px" }}
          >
            Analyze Resume <ArrowRight size={18} />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}