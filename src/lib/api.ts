// src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787";

// ── UPLOAD RESUME ─────────────────────────────────────────────
export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body:   formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json() as Promise<{ sessionId: string; resumeId: string; fileName: string }>;
}

// ── PARSE RESUME ──────────────────────────────────────────────
export async function parseResume(sessionId: string, resumeId: string) {
  const res = await fetch(`${API_URL}/api/parse`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ sessionId, resumeId }),
  });

  if (!res.ok) throw new Error("Parse failed");
  return res.json();
}

// ── ANALYZE RESUME ────────────────────────────────────────────
export async function analyzeResume(sessionId: string, resumeId: string) {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ sessionId, resumeId }),
  });

  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

// ── MATCH JOB DESCRIPTION ─────────────────────────────────────
export async function matchJob(
  sessionId:      string,
  resumeId:       string,
  jobDescription: string
) {
  const res = await fetch(`${API_URL}/api/match-job`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ sessionId, resumeId, jobDescription }),
  });

  if (!res.ok) throw new Error("Job match failed");
  return res.json();
}

// ── IMPROVE RESUME ────────────────────────────────────────────
export async function improveResume(sessionId: string, resumeId: string) {
  const res = await fetch(`${API_URL}/api/improve`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ sessionId, resumeId }),
  });

  if (!res.ok) throw new Error("Improvement failed");
  return res.json();
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