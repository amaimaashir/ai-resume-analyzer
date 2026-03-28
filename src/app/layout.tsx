// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";

const BackgroundScene = dynamic(
  () => import("@/components/three/BackgroundScene"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "AI Resume Analyzer",
  description: "Analyze your resume with AI. Get ATS scores, skill gaps, and an improved version instantly.",
  keywords: ["resume", "ATS", "AI", "job search", "career"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ position: "relative",
        background: "var(--bg-primary)"
       }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {/* Fixed 3D background — pointer-events: none so it never blocks clicks */}
          <BackgroundScene />

          {/* All page content sits above the canvas */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </div>

        </ThemeProvider>
      </body>
    </html>
  );
}
