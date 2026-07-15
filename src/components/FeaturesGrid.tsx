"use client";

import { FileArrowUp, FileText, Envelope, LinkedinLogo, Microphone, Checks } from "@phosphor-icons/react";

interface Feature {
  icon: typeof FileArrowUp;
  title: string;
  desc: string;
}

const featuresEn: Feature[] = [
  { icon: FileArrowUp, title: "Update CV", desc: "Merge new experience into your existing CV with AI." },
  { icon: FileText, title: "Tailor CV", desc: "Rewrite your CV to match any job description." },
  { icon: Envelope, title: "Cover Letter", desc: "Generate personalized cover letters in seconds." },
  { icon: LinkedinLogo, title: "LinkedIn Message", desc: "Craft outreach messages that get replies." },
  { icon: Microphone, title: "Interview Prep", desc: "Predict questions and practice your answers." },
  { icon: Checks, title: "ATS Optimizer", desc: "Analyze and improve your CV for ATS systems." },
];

const featuresAr: Feature[] = [
  { icon: FileArrowUp, title: "تحديث السيرة", desc: "دمج الخبرات الجديدة في سيرتك الحالية." },
  { icon: FileText, title: "تعديل السيرة", desc: "إعادة صياغة سيرتك لتتناسب مع أي وظيفة." },
  { icon: Envelope, title: "خطاب التقديم", desc: "إنشاء خطابات تقديم مخصصة في ثوانٍ." },
  { icon: LinkedinLogo, title: "رسالة LinkedIn", desc: "صياغة رسائل احترافية تجذب الانتباه." },
  { icon: Microphone, title: "التحضير للمقابلة", desc: "توقع الأسئلة وتدرب على إجاباتك." },
  { icon: Checks, title: "تحسين ATS", desc: "تحليل وتحسين سيرتك لأنظمة التتبع." },
];

interface Props {
  language: "ar" | "en";
}

export default function FeaturesGrid({ language }: Props) {
  const features = language === "ar" ? featuresAr : featuresEn;
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 dark:text-white mb-3">
        {language === "ar" ? "كل ما تحتاجه في مكان واحد" : "Everything you need in one place"}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-10 max-w-xl mx-auto">
        {language === "ar"
          ? "خمس أدوات ذكية لتسريع رحلة تقديمك للوظائف"
          : "Five smart tools to accelerate your job application journey"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <div key={i} className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition-colors">
              <f.icon size={20} className="text-emerald-700 dark:text-emerald-400" weight="duotone" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
