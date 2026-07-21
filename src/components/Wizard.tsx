"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { storage } from "@/lib/storage";
import { PROMPTS, generateWithFallback } from "@/lib/ai";
import { ensureIndex, retrieveContext, clearIndex, type RagSource } from "@/lib/rag";
import { extractJobTitle, extractCandidateName } from "@/lib/utils";
import { Gear, Sun, Moon, Robot, Translate, Database } from "@phosphor-icons/react";
import Settings from "./Settings";
import HeroSection from "./HeroSection";
import FeaturesGrid from "./FeaturesGrid";
import ProgressBar from "./ProgressBar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/Toaster";

const STEPS: { id: string; label: string }[] = [
  { id: "update-cv", label: "Update CV" },
  { id: "tailor-cv", label: "Tailor CV" },
  { id: "cover-letter", label: "Cover Letter" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "interview", label: "Interview" },
];

const StepUpdateCV = dynamic(() => import("./StepUpdateCV"), { ssr: false });
const StepTailorCV = dynamic(() => import("./StepTailorCV"), { ssr: false });
const StepCoverLetter = dynamic(() => import("./StepCoverLetter"), { ssr: false });
const StepLinkedIn = dynamic(() => import("./StepLinkedIn"), { ssr: false });
const StepInterview = dynamic(() => import("./StepInterview"), { ssr: false });

export default function Wizard() {
  const [cs, setCs] = useState<string>("update-cv");
  const [lang, setLang] = useState<"ar" | "en">(() => {
    const l = storage.getLanguage();
    return l === "ar" || l === "en" ? l : "en";
  });
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dark, setDark] = useState(() => storage.getDarkMode());
  const [showHero, setShowHero] = useState(true);

  const [oldCv, setOldCv] = useState(() => storage.getOldCv());
  const [expPts, setExpPts] = useState(() => storage.getExperiencePoints());
  const [updCv, setUpdCv] = useState(() => storage.getUpdatedCv());
  const [jobDesc, setJobDesc] = useState(() => storage.getJobDescription());
  const [tailCv, setTailCv] = useState(() => storage.getTailoredCv());
  const [covLtr, setCovLtr] = useState(() => storage.getCoverLetter());
  const [lnMsg, setLnMsg] = useState(() => storage.getLinkedinMessage());
  const [intQ, setIntQ] = useState(() => storage.getInterviewQuestions());
  const [ats, setAts] = useState("");
  const [tone, setTone] = useState<"junior" | "mid" | "executive">("mid");
  const [ragActive, setRagActive] = useState(false);
  const jobTitle = extractJobTitle(jobDesc);
  const cvForName = updCv || oldCv;
  const candidateName = extractCandidateName(cvForName) || "";
  const t = useCallback((ar: string, en: string) => lang === "ar" ? ar : en, [lang]);
  const { toast } = useToast();

  const ragSources: RagSource[] = [
    { id: "old-cv", label: "Original CV", text: oldCv },
    { id: "updated-cv", label: "Updated CV", text: updCv },
    { id: "experience-notes", label: "Experience Notes", text: expPts },
    { id: "job-description", label: "Job Description", text: jobDesc },
  ].filter(source => source.text.trim().length > 0);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    storage.setDarkMode(next);
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const gen = useCallback(async (prompt: string) => {
    setLoading(true);
    try {
      const key = storage.getApiKey();
      if (!key) { setShowSettings(true); throw new Error("Add API key in Settings first"); }
      let finalPrompt = prompt;
      let indexedCount = 0;
      if (ragSources.length > 0) {
        indexedCount = await ensureIndex(ragSources, "groq", key);
      }
      setRagActive(indexedCount > 0);
      if (indexedCount > 0) {
        const context = await retrieveContext(prompt, 4, "groq", key);
        if (context) {
          finalPrompt = `Relevant context from your documents:\n${context}\n\n---\n\n${prompt}`;
        }
      }
      return await generateWithFallback(finalPrompt, key);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: "Error", description: msg, variant: "destructive" });
      return null;
    } finally { setLoading(false); }
  }, [toast, ragSources]);

  const h = (fn: () => Promise<string | null>, setter: (v: string) => void) => async () => {
    const r = await fn();
    if (r) { setter(r); }
  };

  const handleGenerateSuccess = (message: string) => {
    toast({ title: "Success", description: message, variant: "success" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Robot size={24} className="text-primary dark:text-secondary" weight="fill" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t("مساعد التقديم الذكي", "Job Copilot")}</h1>
            {ragActive && (
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database size={12} />RAG
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { const next = lang === "ar" ? "en" : "ar"; setLang(next); storage.setLanguage(next); }} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5">
              <Translate size={16} />{lang === "ar" ? "English" : "العربية"}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDark} className="p-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="p-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">
              <Gear size={18} />
            </Button>
          </div>
        </div>
      </header>

      {showSettings && <Settings language={lang} onClose={() => setShowSettings(false)} onClearAll={() => { clearIndex(); setLang("en"); setDark(false); setRagActive(false); storage.setLanguage("en"); storage.setDarkMode(false); document.documentElement.classList.remove("dark"); }} />}

      {showHero ? (
        <>
          <HeroSection language={lang} onStart={() => setShowHero(false)} />
          <FeaturesGrid language={lang} />
        </>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ProgressBar steps={STEPS} currentId={cs} language={lang} onNavigate={setCs} />

          <div>
            {cs === "update-cv" && (
              <StepUpdateCV oldCv={oldCv} setOldCv={(v) => { setOldCv(v); storage.setOldCv(v); }}
                experiencePoints={expPts} setExperiencePoints={(v) => { setExpPts(v); storage.setExperiencePoints(v); }}
                updatedCv={updCv} setUpdatedCv={(v) => { setUpdCv(v); storage.setUpdatedCv(v); }}
                onGenerate={async () => {
                  const r = await gen(PROMPTS.updateCV(oldCv, expPts));
                  if (r) { setUpdCv(r); storage.setUpdatedCv(r); setOldCv(""); storage.setOldCv(""); handleGenerateSuccess("CV updated successfully"); }
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
      )}
      <Toaster />
    </div>
  );
}