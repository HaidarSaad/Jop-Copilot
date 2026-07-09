"use client";

import { downloadAsPDF } from "@/lib/pdfExport";
import { sanitizeForFilename, extractTailoredCV } from "@/lib/utils";

interface Props {
  jobDescription: string; setJobDescription: (v: string) => void;
  tailoredCv: string; setTailoredCv: (v: string) => void;
  onGenerate: () => void; onAnalyzeATS: () => void; onApplyATS?: () => void;
  atsAnalysis: string; loading: boolean;
  updatedCv: string; oldCv: string; jobTitle?: string; candidateName?: string;
  language: "ar" | "en"; t: (ar: string, en: string) => string;
}

export default function StepTailorCV({
  jobDescription, setJobDescription, tailoredCv, setTailoredCv,
  onGenerate, onAnalyzeATS, onApplyATS, atsAnalysis, loading, updatedCv, oldCv, jobTitle, candidateName, t,
}: Props) {
  const copy = (s: string) => navigator.clipboard.writeText(s);
  const hasCv = !!(updatedCv || oldCv);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          {t("الخطوة 2: تعديل السيرة للوظيفة", "Step 2: Tailor CV to Job")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t("الصق الوصف الوظيفي لتعديل سيرتك الذاتية للوظيفة.", "Paste the job description to tailor your CV.")}
        </p>
        {!hasCv && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl text-amber-700 dark:text-amber-300 text-sm">
            {t("⚠️ لم تقم بتوليد سيرة محدثة بعد.", "⚠️ No updated CV yet. Go back to Step 1.")}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("الوصف الوظيفي", "Job Description")}</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={t("الصق الوصف الوظيفي هنا...", "Paste job description here...")}
            className="w-full h-48 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
          />
        </div>
        <button onClick={onGenerate} disabled={loading || !jobDescription || !hasCv}
          className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2">
          {loading ? <><span className="animate-spin">⏳</span> {t("جارٍ التوليد...", "Generating...")}</>
            : <><span>🎯</span> {t("تعديل السيرة للوظيفة", "Tailor CV for Job")}</>}
        </button>
      </div>

      {tailoredCv && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{t("السيرة المعدلة", "Tailored CV")}</h3>
            <div className="flex gap-2">
              <button onClick={() => copy(tailoredCv)} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">📋 {t("نسخ", "Copy")}</button>
              <button onClick={() => {
                const n = sanitizeForFilename(candidateName || jobTitle || "");
                const t = sanitizeForFilename(jobTitle || "");
                const f = n && t ? `${n}-${t}-Tailored CV.pdf` : (n || t || "CV") + ".pdf";
                downloadAsPDF(extractTailoredCV(tailoredCv), f);
              }} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">⬇️ PDF</button>
              <button onClick={() => setTailoredCv("")} className="px-3 py-1.5 text-sm rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">🗑️</button>
            </div>
          </div>
          <textarea
            value={tailoredCv}
            onChange={(e) => setTailoredCv(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
          />
        </div>
      )}

      {tailoredCv && jobDescription && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{t("تحليل توافق ATS", "ATS Analysis")}</h3>
            <button onClick={onAnalyzeATS} disabled={loading}
              className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all font-medium">
              {loading ? "⏳" : "📊"} {t("تحليل", "Analyze")}
            </button>
          </div>
          {atsAnalysis && (
            <div>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-purple-300 mb-3">{atsAnalysis}</div>
              {onApplyATS && (
                <button onClick={onApplyATS} disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all font-medium text-sm">
                  {t("تطبيق تحسينات ATS على السيرة", "Apply ATS Improvements to CV")}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
