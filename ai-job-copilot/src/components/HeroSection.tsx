"use client";

import { Sparkle } from "@phosphor-icons/react";

interface Props {
  language: "ar" | "en";
  onStart: () => void;
}

const t = (lang: "ar" | "en") => (ar: string, en: string) => lang === "ar" ? ar : en;

export default function HeroSection({ language, onStart }: Props) {
  const loc = t(language);
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#0F172A] text-white py-20 px-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm mb-6 backdrop-blur-sm border border-white/10">
          <Sparkle size={16} weight="fill" className="text-emerald-400" />
          {loc("مدعوم بالذكاء الاصطناعي", "AI-Powered")}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
          {loc("مساعد التقديم الذكي", "Job Copilot")}
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
          {loc(
            "قم بتحديث سيرتك الذاتية، تعديلها للوظائف، إنشاء خطابات التقديم، رسائل LinkedIn، والتحضير للمقابلات — كل ذلك بالذكاء الاصطناعي.",
            "Update your CV, tailor it for jobs, generate cover letters, LinkedIn messages, and prepare for interviews — all with AI."
          )}
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Sparkle size={20} weight="fill" />
          {loc("ابدأ الآن", "Get Started")}
        </button>
      </div>
    </section>
  );
}
