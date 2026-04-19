// src/lib/api.ts
import JSZip from "jszip";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787";

// ── EXTRACT TEXT (with better mobile fallback) ─────────────────
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXml = zip.file("word/document.xml");
    if (!docXml) throw new Error("Invalid DOCX");
    const xml = await docXml.async("string");
    const texts: string[] = [];
    const wtRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let m: RegExpExecArray | null;
    while ((m = wtRegex.exec(xml)) !== null) {
      if (m[1].trim()) texts.push(m[1]);
    }
    const result = texts.join(" ").replace(/\s+/g, " ").trim();
    return result;
  } catch (e) {
    // If JSZip fails on mobile, return empty so backend handles it
    console.error("DOCX extraction failed:", e);
    return "";
  }
}

function extractTextFromPDF(buffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(buffer);
    const str = new TextDecoder("latin1").decode(bytes);
    const texts: string[] = [];

    const btRegex = /BT([\s\S]*?)ET/g;
    let btMatch: RegExpExecArray | null;
    while ((btMatch = btRegex.exec(str)) !== null) {
      const block = btMatch[1];
      const tjRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
      let m: RegExpExecArray | null;
      while ((m = tjRegex.exec(block)) !== null) {
        const cleaned = m[1]
          .replace(/\\n/g, " ").replace(/\\r/g, " ")
          .replace(/\\t/g, " ").replace(/\\\\/g, "\\")
          .replace(/\\(.)/g, "$1");
        if (cleaned.trim().length > 0) texts.push(cleaned);
      }
      const tjArrRegex = /\[([^\]]*)\]\s*TJ/g;
      while ((m = tjArrRegex.exec(block)) !== null) {
        const inner = m[1]
          .replace(/\(([^)]*)\)/g, "$1 ")
          .replace(/-?\d+\.?\d*\s*/g, "")
          .replace(/\\/g, "").trim();
        if (inner.length > 0) texts.push(inner);
      }
    }

    if (texts.length < 5) {
      const tjFallback = /\(([^)]{2,200})\)\s*Tj/g;
      let m: RegExpExecArray | null;
      while ((m = tjFallback.exec(str)) !== null) {
        texts.push(m[1].replace(/\\/g, ""));
      }
    }

    return texts.join(" ").replace(/\s+/g, " ")
      .replace(/[^\x20-\x7E\n]/g, "").trim();
  } catch (e) {
    console.error("PDF extraction failed:", e);
    return "";
  }
}

export async function readFileAsText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  try {
    if (ext === "docx") {
      return await extractTextFromDOCX(file);
    } else {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = extractTextFromPDF(e.target?.result as ArrayBuffer);
          resolve(text);
        };
        reader.onerror = () => resolve(""); // don't throw, return empty
        reader.readAsArrayBuffer(file);
      });
    }
  } catch {
    return "";
  }
}

// ── UPLOAD RESUME ─────────────────────────────────────────────
export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || "Upload failed");
  }
  return res.json() as Promise<{
    sessionId: string;
    resumeId: string;
    fileName: string;
  }>;
}

// ── PARSE RESUME ──────────────────────────────────────────────
export async function parseResume(
  sessionId: string,
  resumeId: string,
  rawText: string
) {
  const cleaned = rawText.trim();

  if (cleaned.length === 0) {
    throw new Error(
      "No text could be extracted from your file. If this is a scanned PDF, please upload a DOCX version instead."
    );
  }

  if (cleaned.length < 100) {
    throw new Error(
      "Very little text was found in your file. Please try a DOCX version of your resume."
    );
  }

  const printable = cleaned.replace(/[^\x20-\x7E]/g, "").length;
  const ratio = printable / cleaned.length;
  if (ratio < 0.5) {
    throw new Error(
      "Your PDF appears to be scanned or image-based. Please upload a DOCX version."
    );
  }

  const res = await fetch(`${API_URL}/api/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, resumeId, rawText }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || "Parse failed");
  }
  return res.json();
}

// ── ANALYZE RESUME ────────────────────────────────────────────
export async function analyzeResume(sessionId: string, resumeId: string) {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, resumeId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || "Analysis failed");
  }
  return res.json();
}

// ── MATCH JOB ─────────────────────────────────────────────────
export async function matchJob(
  sessionId: string,
  resumeId: string,
  jobDescription: string
) {
  const res = await fetch(`${API_URL}/api/match-job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, resumeId, jobDescription }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || "Job match failed");
  }
  return res.json();
}

// ── IMPROVE RESUME ────────────────────────────────────────────
export async function improveResume(sessionId: string, resumeId: string) {
  const res = await fetch(`${API_URL}/api/improve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, resumeId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || "Improvement failed");
  }
  return res.json() as Promise<{ success: boolean; improvedText: string }>;
}

// ── GET RESULTS ───────────────────────────────────────────────
export async function getResults(sessionId: string) {
  const res = await fetch(`${API_URL}/api/results/${sessionId}`);
  if (!res.ok) throw new Error("Results not found");
  return res.json();
}

// ── DELETE SESSION ────────────────────────────────────────────
export async function deleteSession(sessionId: string) {
  const res = await fetch(`${API_URL}/api/session/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}