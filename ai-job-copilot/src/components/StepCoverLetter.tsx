"use client";

import { Clipboard, DownloadSimple, Trash, NotePencil, Spinner } from "@phosphor-icons/react";
import { downloadAsPDF } from "@/lib/pdfExport";
import { sanitizeForFilename } from "@/lib/utils";

interface Props {
  coverLetter: string; setCoverLetter: (v: string) => void;
  onGenerate: () => void; loading: boolean;
  tone: "junior" | "mid" | "executive"; setTone: (v: "junior" | "mid" | "executive") => void;
  language: "ar" | "en"; t: (ar: string, en: string) => string;
  jobTitle?: string;
  candidateName?: string;
}

export default function StepCoverLetter({
  coverLetter, setCoverLetter, onGenerate, loading, tone, setTone, language, t, jobTitle, candidateName,
}: Props) {
  const copy = () => navigator.clipboard.writeText(coverLetter);
  const download = () => {
    const n = sanitizeForFilename(candidateName || jobTitle || "");
    const t = sanitizeForFilename(jobTitle || "");
    const f = n && t ? `${n}-${t}-Cover Letter.pdf` : (n || t || "CV") + ".pdf";
    downloadAsPDF(coverLetter, f);
  };
  const btn = (v: typeof tone, ar: string, en: string) => (
    <button onClick={() => setTone(v)}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tone === v ? "bg-purple-600 text-white shadow-md" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
      {language === "ar" ? ar : en}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          {t("الخطوة 3: خطاب التقديم", "Step 3: Cover Letter")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("توليد خطاب تقديم مخصص.", "Generate a personalized cover letter.")}
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("الدرجة الوظيفية", "Job Level")}</label>
          <div className="flex gap-2">{btn("junior", "مبتدئ", "Junior")}{btn("mid", "متوسط", "Mid-Level")}{btn("executive", "قيادي", "Executive")}</div>
        </div>
        <button onClick={onGenerate} disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2">
          {loading ? <><Spinner size={18} className="animate-spin" /> {t("جارٍ التوليد...", "Generating...")}</>
            : <><NotePencil size={18} /> {t("توليد خطاب التقديم", "Generate Cover Letter")}</>}
        </button>
      </div>
      {coverLetter && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{t("خطاب التقديم", "Cover Letter")}</h3>
            <div className="flex gap-2">
              <button onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"><Clipboard size={14} />{t("نسخ", "Copy")}</button>
              <button onClick={download} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"><DownloadSimple size={14} />{t("تحميل", "Download")}</button>
              <button onClick={() => setCoverLetter("")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"><Trash size={14} /></button>
            </div>
          </div>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y bg-purple-50 dark:bg-purple-900/30 text-slate-700 dark:text-purple-300 leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
