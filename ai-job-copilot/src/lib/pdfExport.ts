import { jsPDF } from "jspdf";

export function downloadAsPDF(text: string, filename: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ml = 15;
  const mw = 180;
  let y = 20;
  const lh = 5.5;
  const gap = 2.5;
  let pageBottom = 282;

  function newPageIfNeeded(extra = 0) {
    if (y + extra > pageBottom) { doc.addPage(); y = 20; }
  }

  function writeLine(parts: { text: string; bold: boolean }[], size: number) {
    newPageIfNeeded(lh);
    doc.setFontSize(size);
    let x = ml;
    for (const p of parts) {
      if (!p.text) continue;
      // Use font-style only to rely on the built-in default font and ensure bold works
      doc.setFont(undefined, p.bold ? "bold" : "normal");
      // Ensure p.text doesn't contain control/zero-width chars
      const safeText = p.text.replace(/\u00AD|\u200B|\u200C|\u200D|\uFEFF/g, "");
      const wrapped = doc.splitTextToSize(safeText, mw - (x - ml));
      for (let i = 0; i < wrapped.length; i++) {
        const w = wrapped[i];
        if (i > 0) { x = ml; y += lh; newPageIfNeeded(lh); }
        doc.text(w, x, y);
        // Add a small space width after each chunk so adjacent parts don't stick
        x += doc.getTextWidth(w + " ");
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

  // Sanitize and normalize raw text before processing
  function sanitizeTextForPdf(input: string) {
    if (!input) return input;
    // Remove zero-width/soft-hyphen characters that break words
    let s = input.replace(/\u00AD|\u200B|\u200C|\u200D|\uFEFF/g, "");
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

      // Heuristic: handle hyphenated line-breaks and join short runs of single-character lines
      // 1) If a line ends with a hyphen-like char, join with next line (remove hyphen)
      const hyphenMatch = line.match(/^(.*?)-\s*$/);
      if (hyphenMatch && i + 1 < lines.length) {
        const next = lines[i + 1] || "";
        out.push(hyphenMatch[1] + next.trim());
        i += 2;
        lastWasBlank = false;
        continue;
      }

      const isShortToken = (str: string) => {
        const core = str.replace(/[^\p{L}\p{N}]/gu, "");
        return core.length <= 2 && core.length > 0;
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

      // Fix common in-word spaces like `Nma p` -> `Nmap`, or `Hyper V` -> `HyperV`
      const tokens = fixedLine.split(/\s+/);
      const merged: string[] = [];
      for (let t = 0; t < tokens.length; t++) {
        const cur = tokens[t];
        const next = tokens[t + 1];
        if (next && /\p{L}/u.test(cur) && /^[\p{L}]$/u.test(next)) {
          // merge cur + next (e.g., 'Nma' + 'p' -> 'Nmap')
          merged.push(cur + next);
          t++; // skip next
          continue;
        }
        merged.push(cur);
      }
      fixedLine = merged.join(" ");
      // Additionally, collapse sequences where many tokens are short (e.g., letters separated)
      const parts = fixedLine.split(/\s+/);
      const shortSeq = parts.filter(p => p.replace(/[^\p{L}\p{N}]/gu, "").length <= 2);
      if (shortSeq.length >= Math.floor(parts.length / 2) && parts.length > 1) {
        // join tokens when line seems to be mostly short fragments
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
    const t = lines[i].trim();
    if (!t || isSeparator(t)) {
      if (i > 0 && lines[i - 1]?.trim()) {
        newPageIfNeeded(gap);
        y += gap;
      }
      continue;
    }

    if (/^#{1,3}\s/.test(t)) {
      newPageIfNeeded(4);
      y += 1.5;
      const level = /^###\s/.test(t) ? 3 : /^##\s/.test(t) ? 2 : 1;
      const size = level === 1 ? 15 : level === 2 ? 13 : 11;
      const text = t.replace(/^#{1,3}\s+/, "");
      writeLine([{ text, bold: true }], size);
      y += 0.5;
      continue;
    }

    const parts = parseLine(t);
    if (parts.length > 0) {
      writeLine(parts, 10);
    }
  }

  doc.save(filename.endsWith(".pdf") ? filename : filename + ".pdf");
}
