"use client";

const KEYS = {
  API_KEY: "jc_api_key",
  PROVIDER: "jc_provider",
  OLD_CV: "jc_old_cv",
  EXPERIENCE_POINTS: "jc_exp_points",
  UPDATED_CV: "jc_updated_cv",
  TAILORED_CV: "jc_tailored_cv",
  COVER_LETTER: "jc_cover_letter",
  LINKEDIN_MSG: "jc_linkedin_msg",
  INTERVIEW_Q: "jc_interview_q",
  JOB_DESC: "jc_job_desc",
  LANGUAGE: "jc_lang",
  DARK_MODE: "jc_dark_mode",
} as const;

function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch { return null; }
}

function setItem<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

function removeItem(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export const storage = {
  getApiKey: () => getItem<string>(KEYS.API_KEY) ?? "",
  setApiKey: (v: string) => setItem(KEYS.API_KEY, v),
  getProvider: () => {
    const saved = getItem<string>(KEYS.PROVIDER);
    // Only allow valid providers, default to groq
    if (saved === "groq" || saved === "openai") return saved;
    // If it's "gemini" or anything else, reset to groq
    if (saved) { setItem(KEYS.PROVIDER, "groq"); }
    return "groq";
  },
  setProvider: (v: string) => setItem(KEYS.PROVIDER, v),
  getOldCv: () => getItem<string>(KEYS.OLD_CV) ?? "",
  setOldCv: (v: string) => setItem(KEYS.OLD_CV, v),
  getExperiencePoints: () => getItem<string>(KEYS.EXPERIENCE_POINTS) ?? "",
  setExperiencePoints: (v: string) => setItem(KEYS.EXPERIENCE_POINTS, v),
  getUpdatedCv: () => getItem<string>(KEYS.UPDATED_CV) ?? "",
  setUpdatedCv: (v: string) => setItem(KEYS.UPDATED_CV, v),
  getTailoredCv: () => getItem<string>(KEYS.TAILORED_CV) ?? "",
  setTailoredCv: (v: string) => setItem(KEYS.TAILORED_CV, v),
  getCoverLetter: () => getItem<string>(KEYS.COVER_LETTER) ?? "",
  setCoverLetter: (v: string) => setItem(KEYS.COVER_LETTER, v),
  getLinkedinMessage: () => getItem<string>(KEYS.LINKEDIN_MSG) ?? "",
  setLinkedinMessage: (v: string) => setItem(KEYS.LINKEDIN_MSG, v),
  getInterviewQuestions: () => getItem<string>(KEYS.INTERVIEW_Q) ?? "",
  setInterviewQuestions: (v: string) => setItem(KEYS.INTERVIEW_Q, v),
  getJobDescription: () => getItem<string>(KEYS.JOB_DESC) ?? "",
  setJobDescription: (v: string) => setItem(KEYS.JOB_DESC, v),
  getLanguage: () => getItem<string>(KEYS.LANGUAGE) ?? "ar",
  setLanguage: (v: string) => setItem(KEYS.LANGUAGE, v),
  getDarkMode: () => getItem<boolean>(KEYS.DARK_MODE) ?? false,
  setDarkMode: (v: boolean) => setItem(KEYS.DARK_MODE, v),
  clearAll: () => { Object.values(KEYS).forEach(removeItem); },
};
