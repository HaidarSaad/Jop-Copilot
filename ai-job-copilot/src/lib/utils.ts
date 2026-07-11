"use client";

import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export function stripImages(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/!\[.*?\]/g, "")
    .trim();
}

export function sanitizePrompt(text: string): string {
  if (!text) return "";
  // URLs
  let s = text.replace(/https?:\/\/[^\s]+(?=[\s,.!?;:)\]]|$)/gi, "[url]");
  // Windows paths: D:\anything\file.ext (handles Unicode, Arabic, spaces)
  s = s.replace(/[A-Za-z]:\\(?:[^\\\n]*\\)*[^\\\n]*\.\w{2,8}/g, "[file path]");
  // Windows paths with forward slashes
  s = s.replace(/[A-Za-z]:\/(?:[^\/\n]*\/)*[^\/\n]*\.\w{2,8}/g, "[file path]");
  // Unix paths: /home/user/file.ext
  s = s.replace(/\/(?:[^\s\/]+\/)+[^\s\/]+\.\w{2,8}/g, "[file path]");
  // UNC paths: \\server\share\file.ext
  s = s.replace(/\\\\[^\\\n]+(?:\\[^\\\n]*)*\\[^\\\n]*\.\w{2,8}/g, "[file path]");
  // Catch-all: any filename-like token ending with common extensions
  s = s.replace(/\b[\w\u0600-\u06FF\u00C0-\u024F-]+\.(png|jpg|jpeg|gif|svg|webp|bmp|avif|heic|ico|tiff?|psd|raw|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|json|xml|yaml|yml|md|css|js|ts|jsx|tsx|env)\b/gi, "[file]");
  return s;
}

export function extractJobTitle(text: string): string {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/(?:Job\s*Title|Position|Title|Role)\s*[:：]\s*(.+)/i);
    if (match) return match[1].trim().slice(0, 40);
  }
  const rolePrefix = /^(Senior|Junior|Lead|Principal|Staff|Head|Director|Manager|Engineer|Developer|Designer|Analyst|Consultant|Architect|Specialist|Coordinator|Associate|Intern)\b/i;
  for (const line of lines) {
    if (rolePrefix.test(line)) return line.replace(/^-\s*/, "").trim().slice(0, 40).replace(/[.,;:!?]$/, "");
  }
  const first = lines[0]?.replace(/^-\s*/, "").trim().slice(0, 40).replace(/[.,;:!?]$/, "");
  return first || "cv";
}

export function extractCandidateName(text: string): string {
  if (!text) return "";
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/(?:Name|اسم)\s*[:：]\s*(.+)/i);
    if (match) return match[1].trim().slice(0, 40);
  }
  const firstLine = lines[0];
  if (firstLine && !/^(##|\- |\*|Job|Position|Title|Role|http|\/)/i.test(firstLine)) {
    const name = firstLine.replace(/^-\s*/, "").trim().slice(0, 40);
    if (name.length > 2 && !name.includes("@") && !name.includes(":")) return name;
  }
  for (const line of lines.slice(0, 5)) {
    if (line.includes("@")) {
      const parts = line.split("@")[0].trim();
      if (parts.length > 2) return parts;
    }
  }
  return "";
}

export function extractTailoredCV(text: string): string {
  const markers = ["## Tailored CV", "## **Tailored CV**"];
  let idx = -1;
  for (const m of markers) {
    idx = text.indexOf(m);
    if (idx !== -1) { idx += m.length; break; }
  }
  if (idx === -1) return text;
  const after = text.slice(idx).trim();
  const lines = after.split("\n");
  if (lines[0] && lines[0].startsWith("[")) return lines.slice(1).join("\n").trim();
  return after;
}

export function sanitizeForFilename(s: string): string {
  if (!s) return "";
  return s.replace(/[<>:"/\\|?*]/g, "").trim().replace(/\s+/g, " ") || "";
}

export function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const doc = await pdfjsLib.getDocument({ data }).promise;
        let text = "";
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          text += strings.join(" ") + "\n";
        }
        resolve(text);
      } catch (e) {
        reject(new Error("Failed to read PDF. Make sure it's a text-based PDF, not scanned."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}
