"use client";

import { useState, useRef } from "react";
import { extractTextFromPDF } from "@/lib/utils";

interface Props {
  onTextExtracted: (text: string) => void;
  language: "ar" | "en";
}

const t = (lang: "ar" | "en") => (ar: string, en: string) => lang === "ar" ? ar : en;

export default function PdfUploader({ onTextExtracted, language }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const loc = t(language);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) {
      setError(loc("الرجاء اختيار ملف PDF", "Please select a PDF file"));
      return;
    }
    setLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      if (text.trim()) {
        onTextExtracted(text);
      } else {
        setError(loc("لم يتم استخراج نص من الملف. قد يكون ممسوحاً ضوئياً.", "No text extracted. The PDF may be scanned."));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : loc("فشل قراءة الملف", "Failed to read file"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input ref={ref} type="file" accept=".pdf" onChange={handleFile} className="hidden" />
      <button type="button" onClick={() => ref.current?.click()} disabled={loading}
        className="w-full px-4 py-2 text-xs rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors bg-transparent">
        {loading ? loc("جارٍ استخراج النص...", "Extracting text...") : loc("رفع ملف PDF لاستخراج النص تلقائياً", "Upload PDF to auto-extract text")}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
