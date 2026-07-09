"use client";

import { Clipboard, DownloadSimple, Trash, Microphone, Spinner } from "@phosphor-icons/react";
import { downloadAsPDF } from "@/lib/pdfExport";
import { sanitizeForFilename } from "@/lib/utils";

interface Props {
  interviewQuestions: string; setInterviewQuestions: (v: string) => void;
  onGenerate: () => void; loading: boolean;
  language: "ar" | "en"; t: (ar: string, en: string) => string;
  jobTitle?: string;
  candidateName?: string;
}

export default function StepInterview({
  interviewQuestions, setInterviewQuestions, onGenerate, loading, t, jobTitle, candidateName,
}: Props) {
  const copy = () => navigator.clipboard.writeText(interviewQuestions);
  const download = () => {
    const n = sanitizeForFilename(candidateName || jobTitle || "");
    const t = sanitizeForFilename(jobTitle || "");
    const f = n && t ? `${n}-${t}-Interview Questions.pdf` : (n || t || "CV") + ".pdf";
    downloadAsPDF(interviewQuestions, f);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          {t("الخطوة 5: أسئلة المقابلة", "Step 5: Interview Questions")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("توليد أسئلة مقابلة متوقعة مع إجابات.", "Generate expected interview questions with answers.")}
        </p>
        <button onClick={onGenerate} disabled={loading}
          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-xl hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2">
          {loading ? <><Spinner size={18} className="animate-spin" /> {t("جارٍ التوليد...", "Generating...")}</>
            : <><Microphone size={18} /> {t("توليد أسئلة المقابلة", "Generate Interview Questions")}</>}
        </button>
      </div>
      {interviewQuestions && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{t("أسئلة المقابلة", "Interview Questions")}</h3>
            <div className="flex gap-2">
              <button onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"><Clipboard size={14} />{t("نسخ", "Copy")}</button>
              <button onClick={download} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"><DownloadSimple size={14} />{t("تحميل", "Download")}</button>
              <button onClick={() => setInterviewQuestions("")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"><Trash size={14} /></button>
            </div>
          </div>
          <textarea
            value={interviewQuestions}
            onChange={(e) => setInterviewQuestions(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y bg-rose-50 dark:bg-rose-900/30 text-slate-700 dark:text-rose-300"
          />
        </div>
      )}
    </div>
  );
}
