// src/lib/api.ts
import JSZip from "jszip";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787";

// ── DOCX TEXT EXTRACTOR (JSZip — free, browser-native) ────────
async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // word/document.xml holds all the text
  const docXml = zip.file("word/document.xml");
  if (!docXml) throw new Error("Invalid DOCX: word/document.xml not found");

  const xml = await docXml.async("string");

  // Extract all <w:t> text nodes
  const texts: string[] = [];
  const wtRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = wtRegex.exec(xml)) !== null) {
    if (m[1].trim()) texts.push(m[1]);
  }

  // Extract paragraph breaks as newlines
  const result = xml
    .replace(/<w:p[ >]/g, "\n")          // paragraph = newline
    .replace(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g, "$1") // keep text
    .replace(/<[^>]+>/g, "")             // strip remaining tags
    .replace(/\n{3,}/g, "\n\n")          // collapse blank lines
    .trim();

  // Prefer the structured version if it has content
  const structured = texts.join(" ").replace(/\s+/g, " ").trim();
  return structured.length > 100 ? structured : result;
}

// ── PDF TEXT EXTRACTOR (improved regex, browser-native) ────────
function extractTextFromPDF(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const str = new TextDecoder("latin1").decode(bytes);
  const texts: string[] = [];

  // Method 1: BT...ET blocks (standard PDF text blocks)
  const btRegex = /BT([\s\S]*?)ET/g;
  let btMatch: RegExpExecArray | null;
  while ((btMatch = btRegex.exec(str)) !== null) {
    const block = btMatch[1];

    // Tj operator — single string
    const tjRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
    let m: RegExpExecArray | null;
    while ((m = tjRegex.exec(block)) !== null) {
      const cleaned = m[1]
        .replace(/\\n/g, " ")
        .replace(/\\r/g, " ")
        .replace(/\\t/g, " ")
        .replace(/\\\\/g, "\\")
        .replace(/\\(.)/g, "$1");
      if (cleaned.trim().length > 0) texts.push(cleaned);
    }

    // TJ operator — array of strings with kerning
    const tjArrRegex = /\[([^\]]*)\]\s*TJ/g;
    while ((m = tjArrRegex.exec(block)) !== null) {
      const inner = m[1]
        .replace(/\(([^)]*)\)/g, "$1 ")
        .replace(/-?\d+\.?\d*\s*/g, "")
        .replace(/\\/g, "")
        .trim();
      if (inner.length > 0) texts.push(inner);
    }
  }

  // Method 2: Direct Tj fallback (for flat PDFs without BT/ET)
  if (texts.length < 5) {
    const tjFallback = /\(([^)]{2,200})\)\s*Tj/g;
    let m: RegExpExecArray | null;
    while ((m = tjFallback.exec(str)) !== null) {
      texts.push(m[1].replace(/\\/g, ""));
    }
  }

  // Method 3: Stream text fallback (last resort)
  if (texts.length < 3) {
    const streamRegex = /stream([\s\S]*?)endstream/g;
    let m: RegExpExecArray | null;
    while ((m = streamRegex.exec(str)) !== null) {
      const readable = m[1]
        .replace(/[^\x20-\x7E\n]/g, " ")
        .replace(/\s{3,}/g, " ")
        .trim();
      if (readable.length > 50) texts.push(readable);
    }
  }

  return texts
    .join(" ")
    .replace(/\\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E\n]/g, "") // strip non-printable
    .trim();
}

// ── MAIN READ FILE ─────────────────────────────────────────────
export async function readFileAsText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "docx") {
    return await extractTextFromDOCX(file);
  } else {
    // PDF
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = extractTextFromPDF(e.target?.result as ArrayBuffer);
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
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
    const err = await res.json().catch(() => ({})) as any;
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

  // Specific helpful errors based on what we got
  if (cleaned.length === 0) {
    throw new Error(
      "No text could be extracted from your file. If this is a scanned PDF, please export it as a text-based PDF or convert it to DOCX first."
    );
  }

  if (cleaned.length < 100) {
    throw new Error(
      "Very little text was extracted from your file. This may be a scanned or image-based PDF. Please try a text-based PDF or DOCX version of your resume."
    );
  }

  // Check if what we got looks like garbage (too many non-printable chars)
  const printable = cleaned.replace(/[^\x20-\x7E]/g, "").length;
  const ratio = printable / cleaned.length;
  if (ratio < 0.5) {
    throw new Error(
      "Your PDF appears to be scanned or image-based and cannot be read as text. Please upload a DOCX version or a text-selectable PDF."
    );
  }

  const res = await fetch(`${API_URL}/api/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, resumeId, rawText }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
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
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err.error || "Analysis failed");
  }
  return res.json();
}

// ── MATCH JOB DESCRIPTION ─────────────────────────────────────
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
    const err = await res.json().catch(() => ({})) as any;
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
    const err = await res.json().catch(() => ({})) as any;
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