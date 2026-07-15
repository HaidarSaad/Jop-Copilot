"use client";

import { Check } from "@phosphor-icons/react";

interface Step {
  id: string;
  label: string;
}

interface Props {
  steps: Step[];
  currentId: string;
  language: "ar" | "en";
  onNavigate?: (id: string) => void;
}

export default function ProgressBar({ steps, currentId, language, onNavigate }: Props) {
  const idx = steps.findIndex((s) => s.id === currentId);
  const current = idx === -1 ? 0 : idx;
  const isRtl = language === "ar";

  return (
    <div className="w-full mb-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="relative flex justify-between mb-2">
        {steps.map((s, i) => {
          const isComplete = i < current;
          const isCurrent = i === current;
          const Tag = onNavigate ? "button" : "div";
          return (
            <Tag
              key={s.id}
              onClick={onNavigate ? () => onNavigate(s.id) : undefined}
              className="flex flex-col items-center group"
              style={{ width: `${100 / steps.length}%` }}
            >
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isComplete
                    ? "bg-accent text-white"
                    : isCurrent
                      ? "bg-primary dark:bg-secondary text-white ring-2 ring-accent dark:ring-secondary"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-600"
                }`}
              >
                {isComplete ? <Check size={16} weight="bold" /> : i + 1}
              </div>
              <span
                className={`text-[10px] mt-1.5 text-center leading-tight max-w-16 ${
                  isCurrent
                    ? "font-semibold text-primary dark:text-secondary"
                    : isComplete
                      ? "text-accent dark:text-emerald-400"
                      : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {s.label}
              </span>
            </Tag>
          );
        })}
        <div className="absolute top-4 inset-x-0 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-accent to-primary dark:from-emerald-400 dark:to-secondary rounded transition-all duration-500"
            style={{
              [isRtl ? "right" : "left"]: 0,
              width: `${(current / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
