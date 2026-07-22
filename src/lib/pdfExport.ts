import { jsPDF } from "jspdf";

export function downloadAsPDF(text: string, filename: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  // Basic PDF metadata for ATS and searchability
  doc.setProperties({
    title: filename,
    subject: "Generated CV",
    author: "AI Job Copilot",
    keywords: "CV, resume, ATS, applicant",
  });
  const ml = 15;
  const mw = 180;
  let y = 20;
  const lh = 5.5;
  const gap = 2.5;
  const pageBottom = 282;

  function newPageIfNeeded(extra = 0) {
    if (y + extra > pageBottom) { doc.addPage(); y = 20; }
  }

  function writeLine(
    parts: { text: string; bold: boolean }[],
    size: number,
    opts?: { indent?: number; bullet?: string | null; align?: "left" | "right" }
  ) {
    const indent = opts?.indent || 0;
    const bullet = opts?.bullet ?? null;
    const align = opts?.align || "left";
    newPageIfNeeded(lh);
    doc.setFontSize(size);
    let x = ml + indent;
    // add bullet width
    if (bullet) {
      doc.setFont("helvetica", "normal");
      doc.text(bullet, x - 3, y);
    }
    for (let pi = 0; pi < parts.length; pi++) {
      const p = parts[pi];
      if (!p.text) continue;
      doc.setFont("helvetica", p.bold ? "bold" : "normal");
      const safeText = p.text.replace(/\u00AD|\u200B|\u200C|\u200D|\uFEFF/g, "");
      const remaining = mw - (x - ml) - indent;
      const wrapWidth = remaining > 10 ? remaining : mw - indent;
      const wrapped = doc.splitTextToSize(safeText, wrapWidth);
      for (let i = 0; i < wrapped.length; i++) {
        const w = wrapped[i];
        if (i > 0) { x = ml + indent; y += lh; newPageIfNeeded(lh); }
        if (align === "right") {
          // right align using margin
          doc.text(w, ml + mw - doc.getTextWidth(w), y);
        } else {
          doc.text(w, x, y);
        }
        x += doc.getTextWidth(w);
      }
    }
    y += lh;
  }

  function isSeparator(line: string): boolean {
    return /^-{3,}\s*$/.test(line);
  }

  function parseLine(line: string): { text: string; bold: boolean }[] {
    // Preserve internal spacing; only treat fully-blank lines as empty
    if (!/\S/.test(line)) return [];
    const parts: { text: string; bold: boolean }[] = [];
    const regex = /\*{2}(.+?)\*{2}/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: line.slice(lastIndex, match.index), bold: false });
      }
      parts.push({ text: match[1], bold: true });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
      parts.push({ text: line.slice(lastIndex), bold: false });
    }
    return parts;
  }

  function isRTLLine(line: string) {
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(line);
  }

  // Sanitize and normalize raw text before processing
  function sanitizeTextForPdf(input: string) {
    if (!input) return input;
    // Remove zero-width/soft-hyphen characters that break words
    const s = input.replace(/\u00AD|\u200B|\u200C|\u200D|\uFEFF/g, "");
    // Normalize CRLF
    const lines = s.split(/\r?\n/);
    const out: string[] = [];
    let i = 0;
    let lastWasBlank = false;
    while (i < lines.length) {
      const line = lines[i];
      if (!/\S/.test(line)) {
        if (!lastWasBlank) out.push("");
        lastWasBlank = true;
        i++;
        continue;
      }

      // Handle hyphenated line-breaks: only join if the result forms a real word (not a compound)
      const hyphenMatch = line.match(/^(.*?)-\s*$/);
      if (hyphenMatch && i + 1 < lines.length) {
        const next = lines[i + 1] || "";
        const combined = (hyphenMatch[1] + next.trim()).replace(/[^\p{L}\p{N}]/gu, "");
        // Avoid joining intentional compounds like "eJPTv2-INE", "TCP/IP" split across lines
        if (combined.length > 3 && !hyphenMatch[1].includes("-") && !next.includes("-")) {
          out.push(hyphenMatch[1] + next.trim());
          i += 2;
          lastWasBlank = false;
          continue;
        }
      }

      const shortExceptions = new Set(["a", "A", "I"]);
      const isShortToken = (str: string) => {
        const core = str.replace(/[^\p{L}\p{N}]/gu, "");
        return core.length <= 2 && core.length > 0 && !shortExceptions.has(str.trim());
      };

      let runLen = 0;
      for (let j = i; j < lines.length; j++) {
        if (isShortToken(lines[j])) runLen++; else break;
      }
      // Join runs of 2+ short tokens (covers many pasted vertical-letter cases)
      if (runLen >= 2) {
        let word = "";
        for (let k = 0; k < runLen; k++) {
          word += lines[i + k].replace(/[^\p{L}\p{N}]/gu, "");
        }
        out.push(word);
        i += runLen;
        lastWasBlank = false;
        continue;
      }

      // otherwise keep the line as-is (trim trailing carriage returns)
      let fixedLine = line.replace(/\r/g, "");

      // Fix broken in-word splits like `Nma p` -> `Nmap` (single letter split off)
      const tokens = fixedLine.split(/\s+/);
      const merged: string[] = [];
      for (let t = 0; t < tokens.length; t++) {
        const cur = tokens[t];
        const next = tokens[t + 1];
        if (next && /\p{L}{2,}/u.test(cur) && /^[\p{L}]$/u.test(next) && (cur + next).length > 3) {
          merged.push(cur + next);
          t++;
          continue;
        }
        merged.push(cur);
      }
      fixedLine = merged.join(" ");
      // Collapse sequences where most tokens are short (vertical-letter paste)
      const parts = fixedLine.split(/\s+/);
      const shortSeq = parts.filter(p => p.replace(/[^\p{L}\p{N}]/gu, "").length <= 2);
      if (shortSeq.length >= Math.floor(parts.length / 2) && parts.length > 1) {
        fixedLine = parts.join("");
      }

      out.push(fixedLine);
      lastWasBlank = false;
      i++;
    }
    return out.join("\n");
  }

  const cleanText = sanitizeTextForPdf(text);
  const lines = cleanText.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const t = rawLine.trim();
    if (!t || isSeparator(t)) {
      if (i > 0 && lines[i - 1]?.trim()) {
        newPageIfNeeded(gap);
        y += gap;
      }
      continue;
    }

    // Headings
    if (/^#{1,3}\s/.test(t)) {
      newPageIfNeeded(4);
      y += 1.5;
      const level = /^###\s/.test(t) ? 3 : /^##\s/.test(t) ? 2 : 1;
      const size = level === 1 ? 15 : level === 2 ? 13 : 11;
      const text = t.replace(/^#{1,3}\s+/, "");
      writeLine([{ text, bold: true }], size, { indent: 0, align: isRTLLine(text) ? "right" : "left" });
      y += 0.5;
      continue;
    }

    // Lists: unordered (- or *), or numbered
    const ulMatch = t.match(/^([\-\*])\s+(.*)$/);
    const olMatch = t.match(/^(\d+)\.\s+(.*)$/);
    if (ulMatch) {
      const bullet = "•";
      const content = ulMatch[2];
      const parts = parseLine(content);
      writeLine(parts, 10, { indent: 6, bullet, align: isRTLLine(content) ? "right" : "left" });
      continue;
    }
    if (olMatch) {
      const bullet = olMatch[1] + ".";
      const content = olMatch[2];
      const parts = parseLine(content);
      writeLine(parts, 10, { indent: 6, bullet, align: isRTLLine(content) ? "right" : "left" });
      continue;
    }

    const parts = parseLine(t);
    if (parts.length > 0) {
      writeLine(parts, 10, { align: isRTLLine(t) ? "right" : "left" });
    }
  }

  doc.save(filename.endsWith(".pdf") ? filename : filename + ".pdf");
}
