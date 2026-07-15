"use client";

import { Envelope, LinkedinLogo } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-700 py-4 px-4 text-center text-xs text-slate-400">
      <span className="inline-flex items-center gap-3 flex-wrap justify-center">
        <span>تم التطوير بواسطة Haider Saad</span>
        <span className="hidden sm:inline">|</span>
        <a
          href="mailto:haidersaad1616@gmail.com"
          className="inline-flex items-center gap-1 hover:text-sky-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Envelope size={13} />
          haidersaad1616@gmail.com
        </a>
        <span className="hidden sm:inline">|</span>
        <a
          href="https://www.linkedin.com/in/haider-saad"
          className="inline-flex items-center gap-1 hover:text-sky-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedinLogo size={13} weight="fill" />
          LinkedIn
        </a>
      </span>
    </footer>
  );
}
