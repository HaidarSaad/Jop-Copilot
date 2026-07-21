# Job Copilot — AGENTS.md

This repository is a client-side Next.js 16 app for generating tailored CVs, cover letters, LinkedIn messages, and interview prep content from a five-step wizard.

## Working commands
- Run the app with `npm run dev`.
- Build and verify with `npm run build` and `npm run lint`.
- No automated tests are configured; use lint and build as the main verification steps.
- On Windows, the scripts use `--webpack` by design; keep that behavior intact when changing package scripts.

## Architecture at a glance
- The main experience lives in `src/components/Wizard.tsx` and the step components under `src/components/`.
- The wizard is client-only. If a new UI piece needs browser-only behavior, prefer `next/dynamic` with `ssr: false` rather than introducing server assumptions.
- State is persisted in `localStorage` through `src/lib/storage.ts` using the `jc_*` keys. Do not move this to a server API unless explicitly requested.
- AI calls are made directly from the browser in `src/components/Wizard.tsx` using Groq only. The API key is stored in local storage as `jc_api_key`.
- Prompt templates and CV formatting rules live in `src/lib/prompts.ts` and `src/lib/utils.ts`.

## Conventions to follow
- Keep UI changes aligned with the design system in [docs/brand-guidelines.md](docs/brand-guidelines.md) and the CSS variables in `src/app/globals.css`.
- Prefer `@phosphor-icons/react` over emoji for structural icons.
- Preserve the existing English-only AI output behavior and the prompt sanitization logic that strips file paths and filenames before API calls.
- Follow the CV structure expected by the prompts: section headings, separators, bullet points, and the add-marker convention used in step 1.
- When adding a new wizard step, keep the prop shape consistent with the current steps: `t`, `language`, `jobTitle`, and `candidateName`.

## Important gotchas
- The wizard flow is not SSR-friendly; avoid server-only assumptions in new components.
- PDF upload is text-based only and does not perform OCR.
- Do not introduce placeholders or buzzwords into generated content; the prompts already enforce this.

## Where to look first
- [README.md](README.md) for setup details.
- [docs/brand-guidelines.md](docs/brand-guidelines.md) for visual and copy conventions.
- `src/lib/prompts.ts` and `src/lib/utils.ts` for prompt and formatting logic.
- `src/lib/storage.ts` for persistence behavior.
