// src/components/layout/Header.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, FileText, Menu, X, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "Analyze",   href: "/analyze" },
  { label: "Compare",   href: "/compare" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted]     = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl border-b" : "bg-transparent"
      }`}
      style={{
        background:   scrolled ? "var(--glass-bg)" : "transparent",
        borderColor:  "var(--glass-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--brand)" }}
          >
            <FileText size={16} color="white" />
          </div>
          <span
            className="font-bold text-lg"
            style={{ fontFamily: "Inter, sans-serif", color: "var(--text-primary)" }}
          >
            Resume<span style={{ color: "var(--matcha)" }}>AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors duration-200"
                style={{
                  color:       isActive ? "var(--matcha)" : "var(--text-secondary)",
                  fontFamily:  "Inter, sans-serif",
                  borderBottom: isActive ? "2px solid var(--matcha)" : "2px solid transparent",
                  paddingBottom: "2px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--matcha)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = isActive
                    ? "var(--matcha)"
                    : "var(--text-secondary)")
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {pathname !== "/" && (
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: "var(--glass-bg)",
                  border:     "1px solid var(--glass-border)",
                  color:      "var(--matcha)",
                }}
                title="Go to Home"
              >
                <Home size={16} />
              </motion.button>
            </Link>
          )}

          {/* Theme Toggle */}
          {mounted && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                background: "var(--glass-bg)",
                border:     "1px solid var(--glass-border)",
                color:      "var(--matcha)",
              }}
              aria-label="Toggle theme"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </motion.div>
            </motion.button>
          )}

          {/* CTA Button */}
          <Link href="/analyze">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex btn-primary text-sm px-4 py-2"
            >
              Analyze Resume
            </motion.button>
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden"
            style={{ color: "var(--text-primary)" }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden px-6 pb-4 flex flex-col gap-4"
          style={{ background: "var(--bg-secondary)" }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium py-2"
                style={{
                  color:      isActive ? "var(--matcha)" : "var(--text-secondary)",
                  fontFamily: "Inter",
                  fontWeight: isActive ? "600" : "400",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/analyze" onClick={() => setMenuOpen(false)}>
            <button className="btn-primary w-full text-sm">
              Analyze Resume
            </button>
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}