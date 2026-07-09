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
      doc.setFont("helvetica", p.bold ? "bold" : "normal");
      const wrapped = doc.splitTextToSize(p.text, mw - (x - ml));
      for (let i = 0; i < wrapped.length; i++) {
        const w = wrapped[i];
        if (i > 0) { x = ml; y += lh; newPageIfNeeded(lh); }
        doc.text(w, x, y);
        x += doc.getTextWidth(w);
      }
    }
    y += lh;
  }

  function isSeparator(line: string): boolean {
    return /^-{3,}\s*$/.test(line);
  }

  function parseLine(line: string): { text: string; bold: boolean }[] {
    const clean = line.trim();
    if (!clean) return [];
    const parts: { text: string; bold: boolean }[] = [];
    const regex = /\*{2}(.+?)\*{2}/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(clean)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: clean.slice(lastIndex, match.index), bold: false });
      }
      parts.push({ text: match[1], bold: true });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < clean.length) {
      parts.push({ text: clean.slice(lastIndex), bold: false });
    }
    return parts;
  }

  const lines = text.split("\n");
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
