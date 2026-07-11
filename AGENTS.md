# Job Copilot — AGENTS.md

## Commands
- `npm run dev` / `npm run build` (both use `--webpack` for win32 SWC, set in package.json)
- `npm run start -- -p <port>`
- `npm run lint` — ESLint 9 (eslint.config.mjs)
- No tests configured

## Architecture & Conventions
- **Next.js 16.2.9** App Router, **React 19**, **TypeScript 5**, **Tailwind CSS 4** (`@import "tailwindcss"` + `@custom-variant dark` — NOT v3 tailwind.config.js)
- **No SSR**: `src/app/page.tsx` dynamically imports `Wizard` with `ssr: false`. Layout has `suppressHydrationWarning` on `<html>`/`<body>` (Grammarly extension).
- **5-step wizard** (Update CV → Tailor CV → Cover Letter → LinkedIn → Interview). Each step component receives props: `t` (translator fn), `language`, `jobTitle`, `candidateName`.
- **All AI calls direct from browser** — three callers in `Wizard.tsx` (`callGemini`, `callGroq`, `callOpenAI`). Server route at `src/app/api/generate/route.ts` is unused and lacks Groq.
- **All state in LocalStorage** (`jc_*` keys) — see `src/lib/storage.ts`. No `.env` files; API key in `jc_api_key`.
- **Design conventions**: `.opencode/skills/` has 7 skills (banner, brand, design-system, slides, ui-styling, ui-ux-pro-max) — check before making UI/styling changes.
- **Design system**: CSS variables in `globals.css` (`--color-primary: #1E3A5F`, `--color-accent: #059669`, mapped via `@theme inline` to Tailwind classes like `bg-primary`, `text-accent`). Dark mode reverses via `.dark` selector. **No emojis as structural icons** — use `@phosphor-icons/react` (Phosphor icons). Font: Plus Jakarta Sans (headings/body) + JetBrains Mono (code).
- **Page structure**: `Wizard.tsx` renders HeroSection + FeaturesGrid (landing) before showing the 5-step wizard. Wizard has a `ProgressBar` component replacing simple pill nav. `Footer.tsx` always rendered via layout.

## AI Providers
| Provider | Model | Status |
|----------|-------|--------|
| Gemini | `gemini-2.0-flash` | Quota exhausted (429) |
| Groq | `llama-3.3-70b-versatile` | Working (preferred) |
| OpenAI | `gpt-4o-mini` | Fallback |

- Storage default provider is `"groq"` — switch away only if Groq is unavailable
- `sanitizePrompt()` strips file paths and bare filenames before every API call (prevents Gemini "does not support input" errors)

## CV Format (enforced in all prompts)
```
## Section Title
---
**Company Name** - Job Title | Date
- Bullet point
```
- `[ADD]...[/ADD]` markers in Step 1 (green highlighting; stripped before download via `stripAddMarkers()`)
- `---START CV---` / `---END CV---` delimiters in prompts to reduce hallucination
- `tailorCV` prompt explicitly instructs AI to place personal info at the top of the Tailored CV section

## Download Filename
`{candidateName}-{jobTitle}-{suffix}.pdf`
- `sanitizeForFilename` preserves spaces and case (strips `<>:"/\\|?*`)
- Tailored CV download calls `extractTailoredCV()` at download time only (strips `## Tailored CV` header and bracketed description line; raw stored value retains both sections)

## Gotchas
1. Build uses `--webpack` — win32 SWC bindings missing
2. Dark mode: `jc_dark_mode` + inline `<script>` in layout.tsx before React hydrates
3. English UI default; Arabic toggle. All AI output in English only
4. Step 1 clears `oldCv` after generating `updCv`; subsequent steps use `updCv` or `tailCv`
5. PDF upload only works for text-based PDFs (uses pdfjs-dist with CDN worker, no OCR)
6. Prompts forbid placeholders, hypotheticals, and buzzwords
7. API keys shown in plain text (`type="text"`) to allow paste
8. `html2canvas` in `package.json` deps but never imported in source code
