// src/lib/api.ts
// NO top-level pdfjs import here

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787";

// ── PDF EXTRACTOR (dynamic import — browser only) ──────────────
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      textParts.push(pageText);
    }

    return textParts.join("\n").replace(/\s+/g, " ").trim();
  } catch (e) {
    console.error("PDF extraction failed:", e);
    return "";
  }
}

// ── DOCX EXTRACTOR (dynamic import — browser only) ─────────────
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const JSZip = (await import("jszip")).default;
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXml = zip.file("word/document.xml");
    if (!docXml) throw new Error("Invalid DOCX: word/document.xml not found");
    const xml = await docXml.async("string");
    const texts: string[] = [];
    const wtRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let m: RegExpExecArray | null;
    while ((m = wtRegex.exec(xml)) !== null) {
      if (m[1].trim()) texts.push(m[1]);
    }
    return texts.join(" ").replace(/\s+/g, " ").trim();
  } catch (e) {
    console.error("DOCX extraction failed:", e);
    return "";
  }
}

// ── MAIN READ FILE ─────────────────────────────────────────────
export async function readFileAsText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  try {
    if (ext === "docx") {
      return await extractTextFromDOCX(file);
    } else {
      return await extractTextFromPDF(file);
    }
  } catch (e) {
    console.error("Text extraction failed:", e);
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