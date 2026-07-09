# Job Copilot — AGENTS.md

## Commands
- `npm run dev -- --webpack` — Dev server (win32: must use `--webpack`)
- `npm run build` — Production build (uses `--webpack` in package.json)
- `npm run start -- -p <port>` — Run built app
- `npm run lint` — ESLint 9
- **No tests configured**

## Architecture
- **Next.js 16.2.9** (App Router), **React 19**, **TypeScript 5**, **Tailwind CSS 4**
- SPA: `src/app/page.tsx` → dynamically imports `Wizard` (no SSR)
- 5-step wizard: Update CV → Tailor CV → Cover Letter → LinkedIn Message → Interview Questions
- AI calls go **directly from browser** (unused server route at `src/app/api/generate/route.ts`)
- All state persists via **LocalStorage** (`jc_*` keys) — see `src/lib/storage.ts`

## Key Files
| File | Role |
|------|------|
| `src/components/Wizard.tsx` | Orchestrator + `callGemini`/`callGroq`/`callOpenAI` |
| `src/lib/prompts.ts` | All AI prompts with anti-fabrication rules |
| `src/lib/pdfExport.ts` | jspdf PDF with inline `**bold**` rendering |
| `src/lib/utils.ts` | `sanitizePrompt`, `extractJobTitle`, `extractCandidateName`, `extractTailoredCV`, `sanitizeForFilename` |
| `src/lib/storage.ts` | LocalStorage getters/setters |

## AI Providers
| Provider | Model | Function |
|----------|-------|----------|
| Gemini | `gemini-2.0-flash` | `callGemini` (direct REST, no SDK) |
| Groq | `llama-3.3-70b-versatile` | `callGroq` |
| OpenAI | `gpt-4o-mini` | `callOpenAI` |

- API key in `jc_api_key`, provider in `jc_provider` (default `"gemini"`)
- `sanitizePrompt()` strips file paths and bare filenames (`.png`, `.pdf`, etc.) before every API call

## CV Format (used in ALL prompts)
```
## Section Title
---
**Company Name** - Job Title | Date
- Bullet point
```
- `[ADD]...[/ADD]` markers in Step 1 for green highlighting
- `---START CV---` / `---END CV---` delimiters

## Download Filename
`{candidateName}-{jobTitle}-{suffix}.pdf`
- `sanitizeForFilename` preserves spaces and case (only strips `<>:"/\\|?*`)
- Tailored CV PDF uses `extractTailoredCV()` to strip `## Missing Keywords` section

## Gotchas
1. Build must use `--webpack` (win32 SWC bindings missing; already set in package.json scripts)
2. `suppressHydrationWarning` on `<html>`/`<body>` — Grammarly extension injects attributes
3. Dark mode via `jc_dark_mode` + inline `<script>` in `layout.tsx` before React hydrates
4. English default UI; Arabic toggle. All AI output must be in English only
5. Step 1 clears `oldCv` after generating `updCv`; subsequent steps use `updCv` or `tailCv`
6. PDF upload only works for text-based PDFs (uses pdfjs-dist with CDN worker)
7. All prompts forbid placeholders, hypotheticals, and buzzwords
8. API keys shown in plain text (`type="text"`) to allow paste
