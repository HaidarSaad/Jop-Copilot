"use client";

import PdfUploader from "./PdfUploader";
import { downloadAsPDF } from "@/lib/pdfExport";
import { sanitizeForFilename } from "@/lib/utils";

interface Props {
  oldCv: string; setOldCv: (v: string) => void;
  experiencePoints: string; setExperiencePoints: (v: string) => void;
  updatedCv: string; setUpdatedCv: (v: string) => void;
  onGenerate: () => void; loading: boolean;
  language: "ar" | "en"; t: (ar: string, en: string) => string;
  jobTitle?: string;
  candidateName?: string;
}

function stripAddMarkers(text: string): string {
  return text.replace(/\[ADD\]/g, "").replace(/\[\/ADD\]/g, "");
}

function renderHighlighted(text: string): { text: string; isNew: boolean }[] {
  const parts: { text: string; isNew: boolean }[] = [];
  const regex = /\[ADD\]([\s\S]*?)\[\/ADD\]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isNew: false });
    }
    parts.push({ text: match[1], isNew: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isNew: false });
  }
  return parts;
}

export default function StepUpdateCV({
  oldCv, setOldCv, experiencePoints, setExperiencePoints,
  updatedCv, setUpdatedCv, onGenerate, loading, language, t, jobTitle, candidateName,
}: Props) {
  const handleCopy = () => navigator.clipboard.writeText(stripAddMarkers(updatedCv));
  const handleDownload = () => {
    const name = sanitizeForFilename(candidateName || jobTitle || "");
    const title = sanitizeForFilename(jobTitle || "");
    const fname = name && title ? `${name}-${title}-CV.pdf` : (name || title || "CV") + ".pdf";
    downloadAsPDF(stripAddMarkers(updatedCv), fname);
  };
  const highlighted = renderHighlighted(updatedCv);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          {t("الخطوة 1: تطوير السيرة الذاتية", "Step 1: Update Your CV")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("أدخل سيرتك الذاتية ونقاط الخبرة الجديدة لتوليد سيرة محدثة.", "Enter your CV and new experience points to generate an updated CV.")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("السيرة الذاتية الحالية", "Current CV")}
            </label>
            <textarea
              value={oldCv}
              onChange={(e) => setOldCv(e.target.value)}
              placeholder={t("الصق سيرتك الذاتية هنا أو ارفع PDF...", "Paste your CV here or upload a PDF...")}
              className="w-full h-48 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
            />
            <div className="mt-2">
              <PdfUploader onTextExtracted={setOldCv} language={language} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("نقاط الخبرة الجديدة", "New Experience Points")}
            </label>
            <textarea
              value={experiencePoints}
              onChange={(e) => setExperiencePoints(e.target.value)}
              placeholder={t("أضف خبراتك الجديدة هنا...", "Add new experience here...")}
              className="w-full h-48 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading || (!oldCv && !experiencePoints)}
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
        >
          {loading ? <><span className="animate-spin">⏳</span> {t("جارٍ التوليد...", "Generating...")}</>
            : <><span>✨</span> {t("توليد السيرة المحدثة", "Generate Updated CV")}</>}
        </button>
      </div>

      {updatedCv && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{t("السيرة المحدثة", "Updated CV")}</h3>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">📋 {t("نسخ", "Copy")}</button>
              <button onClick={handleDownload} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">⬇️ {t("تحميل", "Download")}</button>
              <button onClick={() => setUpdatedCv("")} className="px-3 py-1.5 text-sm rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">🗑️</button>
            </div>
          </div>

          {highlighted.some(p => p.isNew) && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4 whitespace-pre-wrap text-sm leading-relaxed">
              {highlighted.map((p, i) =>
                p.isNew ? (
                  <span key={i} className="text-green-600 dark:text-green-400 font-medium">{p.text}</span>
                ) : (
                  <span key={i} className="text-slate-700 dark:text-slate-300">{p.text}</span>
                )
              )}
            </div>
          )}

          <textarea
            value={stripAddMarkers(updatedCv)}
            onChange={(e) => setUpdatedCv(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
          />
        </div>
      )}
    </div>
  );
}
