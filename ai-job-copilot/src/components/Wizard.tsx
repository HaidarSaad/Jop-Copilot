"use client";

import { useState, useEffect, useCallback } from "react";
import { storage } from "@/lib/storage";
import { PROMPTS } from "@/lib/prompts";
import { extractJobTitle, extractCandidateName, sanitizeForFilename, sanitizePrompt } from "@/lib/utils";
import Settings from "./Settings";
import StepUpdateCV from "./StepUpdateCV";
import StepTailorCV from "./StepTailorCV";
import StepCoverLetter from "./StepCoverLetter";
import StepLinkedIn from "./StepLinkedIn";
import StepInterview from "./StepInterview";
const STEPS: { id: string; label: string }[] = [
  { id: "update-cv", label: "Update CV" },
  { id: "tailor-cv", label: "Tailor CV" },
  { id: "cover-letter", label: "Cover Letter" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "interview", label: "Interview" },
];

async function callGemini(apiKey: string, prompt: string) {
  const clean = sanitizePrompt(prompt);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: clean }] }] }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    if (res.status === 429) throw new Error("Gemini API quota exhausted. Use Groq or OpenAI in Settings.");
    if (msg.includes("does not support") && msg.includes("input")) {
      throw new Error("Gemini thinks your text contains a file path. Please remove any local file paths (e.g., C:\\...) from your input and try again, or switch to Groq.");
    }
    throw new Error(`Gemini: ${msg}`);
  }
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(apiKey: string, prompt: string) {
  const clean = sanitizePrompt(prompt);
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: clean }],
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Groq error");
  return data?.choices?.[0]?.message?.content || "";
}

async function callOpenAI(apiKey: string, prompt: string) {
  const clean = sanitizePrompt(prompt);
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: clean }], max_tokens: 2048 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "OpenAI error");
  return data?.choices?.[0]?.message?.content || "";
}

export default function Wizard() {
  const [cs, setCs] = useState<string>("update-cv");
  const [lang, setLang] = useState<"ar" | "en">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [dark, setDark] = useState(false);

  const [oldCv, setOldCv] = useState("");
  const [expPts, setExpPts] = useState("");
  const [updCv, setUpdCv] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tailCv, setTailCv] = useState("");
  const [covLtr, setCovLtr] = useState("");
  const [lnMsg, setLnMsg] = useState("");
  const [intQ, setIntQ] = useState("");
  const [ats, setAts] = useState("");
  const [tone, setTone] = useState<"junior" | "mid" | "executive">("mid");
  const jobTitle = extractJobTitle(jobDesc);
  const cvForName = updCv || oldCv;
  const candidateName = extractCandidateName(cvForName) || "";
  const t = useCallback((ar: string, en: string) => lang === "ar" ? ar : en, [lang]);

  useEffect(() => {
    setOldCv(storage.getOldCv());
    setExpPts(storage.getExperiencePoints());
    setUpdCv(storage.getUpdatedCv());
    setJobDesc(storage.getJobDescription());
    setTailCv(storage.getTailoredCv());
    setCovLtr(storage.getCoverLetter());
    setLnMsg(storage.getLinkedinMessage());
    setIntQ(storage.getInterviewQuestions());
    const l = storage.getLanguage();
    if (l === "ar" || l === "en") setLang(l);
    const d = storage.getDarkMode();
    setDark(d);
    if (d) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    storage.setDarkMode(next);
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const gen = useCallback(async (prompt: string) => {
    setLoading(true);
    setError("");
    try {
      const key = storage.getApiKey();
      const prov = storage.getProvider();
      if (!key) { setShowSettings(true); throw new Error("Add API key in Settings first"); }
      return prov === "openai" ? await callOpenAI(key, prompt) : prov === "groq" ? await callGroq(key, prompt) : await callGemini(key, prompt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      return null;
    } finally { setLoading(false); }
  }, []);

  const h = (fn: () => Promise<string | null>, setter: (v: string) => void) => async () => {
    const r = await fn();
    if (r) { setter(r); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t("مساعد التقديم الذكي", "Job Copilot")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { const next = lang === "ar" ? "en" : "ar"; setLang(next); storage.setLanguage(next); }} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">{lang === "ar" ? "English" : "العربية"}</button>
            <button onClick={toggleDark} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">{dark ? "☀️" : "🌙"}</button>
            <button onClick={() => setShowSettings(true)} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">⚙️</button>
          </div>
        </div>
      </header>

      {showSettings && <Settings language={lang} onClose={() => setShowSettings(false)} />}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-2">
            <span>⚠️</span><span className="flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        <nav className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => setCs(s.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${cs === s.id ? "bg-blue-600 text-white shadow-md" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-current">{i + 1}</span>
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        <div>
          {cs === "update-cv" && (
            <StepUpdateCV oldCv={oldCv} setOldCv={(v) => { setOldCv(v); storage.setOldCv(v); }}
              experiencePoints={expPts} setExperiencePoints={(v) => { setExpPts(v); storage.setExperiencePoints(v); }}
              updatedCv={updCv} setUpdatedCv={(v) => { setUpdCv(v); storage.setUpdatedCv(v); }}
              onGenerate={async () => {
                const r = await gen(PROMPTS.updateCV(oldCv, expPts));
                if (r) { setUpdCv(r); storage.setUpdatedCv(r); setOldCv(""); storage.setOldCv(""); }
              }}
              loading={loading} language={lang} t={t} jobTitle={jobTitle} candidateName={candidateName} />
          )}
          {cs === "tailor-cv" && (
            <StepTailorCV jobDescription={jobDesc} setJobDescription={(v) => { setJobDesc(v); storage.setJobDescription(v); }}
              tailoredCv={tailCv} setTailoredCv={(v) => { setTailCv(v); storage.setTailoredCv(v); }}
              onGenerate={h(() => gen(PROMPTS.tailorCV(updCv, jobDesc)), setTailCv)}
              onAnalyzeATS={h(() => gen(PROMPTS.analyzeATS(tailCv || updCv, jobDesc)), setAts)}
              onApplyATS={h(() => gen(PROMPTS.applyATS(tailCv || updCv, ats)), setTailCv)}
              atsAnalysis={ats} loading={loading} updatedCv={updCv} oldCv={oldCv} language={lang} t={t} jobTitle={jobTitle} candidateName={candidateName} />
          )}
          {cs === "cover-letter" && (
            <StepCoverLetter coverLetter={covLtr} setCoverLetter={(v) => { setCovLtr(v); storage.setCoverLetter(v); }}
              onGenerate={h(() => gen(PROMPTS.coverLetter(tailCv || updCv, jobDesc, tone)), setCovLtr)}
              loading={loading} tone={tone} setTone={setTone} language={lang} t={t} jobTitle={jobTitle} candidateName={candidateName} />
          )}
          {cs === "linkedin" && (
            <StepLinkedIn linkedinMessage={lnMsg} setLinkedinMessage={(v) => { setLnMsg(v); storage.setLinkedinMessage(v); }}
              onGenerate={h(() => gen(PROMPTS.linkedinMessage(jobDesc, tailCv || updCv)), setLnMsg)}
              loading={loading} language={lang} t={t} jobTitle={jobTitle} candidateName={candidateName} />
          )}
          {cs === "interview" && (
            <StepInterview interviewQuestions={intQ} setInterviewQuestions={(v) => { setIntQ(v); storage.setInterviewQuestions(v); }}
              onGenerate={h(() => gen(PROMPTS.interviewQuestions(tailCv || updCv, jobDesc)), setIntQ)}
              loading={loading} language={lang} t={t} jobTitle={jobTitle} candidateName={candidateName} />
          )}
        </div>
      </div>
    </div>
  );
}
