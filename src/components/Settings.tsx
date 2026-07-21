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

export default function Settings({ language, onClose, onClearAll }: Props) {
  const [apiKey, setApiKey] = useState(() => storage.getApiKey());
  const [saved, setSaved] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const loc = t(language);

  useEffect(() => {
    requestAnimationFrame(() => setAnimIn(true));
  }, []);

  const handleSave = () => {
    storage.setApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    storage.clearAll();
    setApiKey("");
    onClearAll?.();
  };

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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{loc("مفتاح Groq API", "Groq API Key")}</label>
            <input type="text" value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              dir="ltr"
            />
            <p className="text-xs text-slate-400 mt-1">
              {loc("مفتاح Groq مجاني من console.groq.com/keys", "Free Groq key from console.groq.com/keys")}
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
