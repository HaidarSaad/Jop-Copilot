"use client";

import { useState, useEffect } from "react";
import { X, Check, LockKey } from "@phosphor-icons/react";
import { storage } from "@/lib/storage";

interface Props {
  language: "ar" | "en";
  onClose: () => void;
  onClearAll?: () => void;
}

const t = (lang: "ar" | "en") => (ar: string, en: string) => lang === "ar" ? ar : en;

export default function Settings({ language, onClose }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [saved, setSaved] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const loc = t(language);

  useEffect(() => {
    setApiKey(storage.getApiKey());
    setProvider(storage.getProvider());
    requestAnimationFrame(() => setAnimIn(true));
  }, []);

  const handleSave = () => {
    storage.setApiKey(apiKey);
    storage.setProvider(provider);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    storage.clearAll();
    setApiKey("");
    setProvider("gemini");
    onClearAll?.();
  };

  const options = [
    { id: "gemini", label: "Gemini 2.0 Flash", desc: loc("مجاني (1500/يوم)", "Free (1500/day)") },
    { id: "groq", label: "Groq Llama 3", desc: loc("مجاني (30 طلب/دقيقة)", "Free (30 req/min)") },
    { id: "openai", label: "OpenAI GPT-4o-mini", desc: loc("مدفوع (رخيص جداً)", "Paid (very cheap)") },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${animIn ? "bg-black/50" : "bg-black/0"}`}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 transition-all duration-200 ${animIn ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        dir={language === "ar" ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{loc("الإعدادات", "Settings")}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{loc("مزود الخدمة", "Provider")}</label>
            <div className="grid gap-2">
              {options.map((o) => (
                <button key={o.id} onClick={() => setProvider(o.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${provider === o.id ? "border-primary bg-blue-50 dark:bg-blue-900/30" : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${provider === o.id ? "border-primary" : "border-slate-300"}`}>
                    {provider === o.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-white text-sm">{o.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{o.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{loc("مفتاح API", "API Key")}</label>
            <input type="text" value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "openai" ? "sk-..." : provider === "groq" ? "gsk_..." : loc("ألصق مفتاح API هنا", "Paste API key here")}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              dir="ltr"
            />
            <p className="text-xs text-slate-400 mt-1">
              {provider === "openai"
                ? loc("مفتاح OpenAI من platform.openai.com/api-keys", "OpenAI key from platform.openai.com/api-keys")
                : provider === "groq"
                  ? loc("مفتاح Groq مجاني من console.groq.com/keys", "Free Groq key from console.groq.com/keys")
                  : loc("مفتاح Gemini مجاني من aistudio.google.com", "Free Gemini key from aistudio.google.com")}
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave}
              className="inline-flex items-center justify-center gap-1.5 flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium text-sm">
              {saved ? <><Check size={16} weight="bold" /> {loc("تم الحفظ", "Saved")}</> : loc("حفظ", "Save")}
            </button>
            <button onClick={handleClear}
              className="px-6 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all font-medium text-sm">
              {loc("مسح الكل", "Clear All")}
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <p className="font-medium mb-1 flex items-center gap-1.5"><LockKey size={14} weight="duotone" /> {loc("الخصوصية والأمان", "Privacy & Security")}</p>
            <p>{loc("بياناتك لا تُخزن على الخوادم. تُرسل مباشرة لمزود الخدمة لتوليد النتائج.", "Your data is not stored on servers. Sent directly to the provider for generation only.")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
