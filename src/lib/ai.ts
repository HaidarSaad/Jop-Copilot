"use client";

import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { sanitizePrompt } from "@/lib/utils";

const GROQ_MODEL = "llama-3.3-70b-versatile";

function createLLM(apiKey: string) {
  return new ChatGroq({ model: GROQ_MODEL, apiKey, temperature: 0.3, maxTokens: 2048 });
}

function createChain(apiKey: string) {
  const llm = createLLM(apiKey);
  const prompt = PromptTemplate.fromTemplate("{prompt}");
  return prompt.pipe(llm).pipe(new StringOutputParser());
}

export async function generateWithFallback(prompt: string, apiKey: string): Promise<string> {
  const clean = sanitizePrompt(prompt);
  const chain = createChain(apiKey);
  const result = await chain.invoke({ prompt: clean });
  if (result && typeof result === "string") return result.trim();
  throw new Error("Empty response");
}

export const PROMPTS = {
  updateCV: (oldCv: string, newPoints: string) => `
You are helping someone update their REAL CV with new experience points. You MUST keep all existing data intact and ONLY merge the new points.

REAL CV (this is the ONLY data you may use):
---START CV---
${oldCv || "NO CV PROVIDED"}
---END CV---

New experience to add:
${newPoints || "No new points provided"}

Rules:
1. PRESERVE all personal details from the REAL CV exactly as written (name, email, phone, etc.). NEVER use placeholders like "[Insert Name]".
2. Only merge the new points into the experience section. Do NOT add any other content that isn't in the REAL CV or the new points.
3. NEVER invent skills, tools, or achievements.
4. Keep the same overall structure.
5. Short, direct sentences. No "orchestrated", "spearheaded", "leveraged" or similar buzzwords.
6. Output a complete, finished CV — NOT a template with placeholders.

Critical: You MUST wrap ANY new or modified bullet with [ADD] and [/ADD] markers. Existing content kept as-is should NOT be wrapped.

Formatting (CRITICAL — follow exactly):
- Each section title MUST start with "## " followed by bold text. Example: ## **Experience**, ## **Education**, ## **Skills**
- After each section title, put "---" on its own line before the first bullet
- Use **bold** for company names and job titles as well
- Use a blank line before and after each "---" separator
- Start each bullet with "- "
- One bullet per line
- No tables, columns, special characters, or emojis
- Leave a blank line between sections

Output the entire updated CV in English only.
`,

  tailorCV: (cv: string, jobDescription: string) => `
You are given a real CV and a job description. Your ONLY job is to reword the EXISTING experience points in the CV to better match the job description. You MUST NOT create, add, or assume anything.

REAL CV (this is the ONLY data you may use):
---START CV---
${cv || "NO CV PROVIDED — STOP AND RETURN 'ERROR: No CV data provided'"}
---END CV---

Job Description:
${jobDescription || "No job description"}

STRICT RULES — YOU MUST FOLLOW EVERY ONE:

1. You MUST keep ALL personal details (name, email, phone, LinkedIn, address) EXACTLY as they appear in the REAL CV above. NEVER change them.
2. The Tailored CV MUST be a COMPLETE CV starting with the personal information header (name, email, phone, LinkedIn, address) exactly as in the REAL CV, followed by all sections.
3. You MUST NOT add any new sections, job titles, companies, education, skills, or experience that is not already in the REAL CV.
4. You MUST NOT use phrases like "assuming", "hypothetical", "based on the job requirements", "in a real-world scenario", or "if the candidate has".
5. You MUST NOT create placeholder text like "[Insert Name]", "[Date]", "[University]".
6. You MUST NOT add "hypothetical experience" or "sample experience".
7. You may ONLY reword existing bullet points to include relevant keywords from the job description — without changing facts, dates, or numbers.
8. If the REAL CV is empty or has no content, output "ERROR: The provided CV is empty. Go back to Step 1."

Output format:
---
## Missing Keywords
- List keywords from the job description that are genuinely missing from the CV (only if CV has content)

## **Tailored CV**
[Output the complete tailored CV here. START with the personal information header (name, email, phone, LinkedIn, address) exactly as in the REAL CV, then include ALL sections from the REAL CV. This must be a real, complete CV using ONLY data from the REAL CV section above.]
---

Formatting for Tailored CV (CRITICAL — follow exactly):
- Each section title MUST start with "## " followed by bold text. Example: ## **Experience**, ## **Education**, ## **Skills**
- After each section title, put "---" on its own line before the first bullet
- Use **bold** for company names and job titles as well
- Use a blank line before and after each "---" separator
- Start each bullet with "- "
- One bullet per line
- No tables, columns, special characters, or emojis
- Leave a blank line between sections

REMEMBER: You are working with a REAL CV provided above. Do not create a new one. Do not use templates.
`,

  applyATS: (cv: string, atsAnalysis: string) => `
Refine the REAL CV below to improve ATS compatibility. You MUST output a complete, finished CV — NOT a template.

REAL CV (use ONLY this data):
---START CV---
${cv || "NO CV PROVIDED"}
---END CV---

ATS Analysis:
${atsAnalysis || "No analysis"}

Required:
1. PRESERVE all personal details from the REAL CV exactly as written (name, email, phone, LinkedIn, address). NEVER use placeholders like "[Insert Name]".
2. The refined CV MUST start with the personal information header (name, email, phone, LinkedIn, address) exactly as in the REAL CV, followed by all sections.
3. Apply ATS suggestions (keywords, formatting) using ONLY content that exists in the REAL CV above.
4. Do NOT add any new sections, jobs, education, or skills.
5. Keep everything in English.

Formatting (CRITICAL — follow exactly):
- Each section title MUST start with "## " followed by bold text. Example: ## **Experience**, ## **Education**, ## **Skills**
- After each section title, put "---" on its own line before the first bullet
- Use **bold** for company names and job titles as well
- Use a blank line before and after each "---" separator
- Start each bullet with "- "
- One bullet per line
- No tables, columns, special characters, or emojis
- Leave a blank line between sections

Output the refined CV in English only.
`,

  coverLetter: (cv: string, jobDescription: string, tone: string) => `
Write a professional, persuasive cover letter. Be formal, confident, and convincing.

CV:
${cv || "No CV"}

Job Description:
${jobDescription || "No job description"}

Level: ${tone === "junior" ? "Entry-level" : tone === "executive" ? "Executive" : "Mid-level"}

Rules:
1. First person ("I").
2. Open with a strong statement mentioning the company and specific role.
3. In 2-3 paragraphs, connect your real experience to the job requirements with specific examples.
4. Do NOT exaggerate or invent — be truthful but compelling.
5. End with a confident closing and call to action.
6. Length: 200-300 words (not too short, not too long).
7. Professional tone — no clichés, no buzzwords, no casual language.

Output the cover letter in English only.
`,

  linkedinMessage: (jobDescription: string, cv: string) => `
Write a professional and persuasive LinkedIn message (or email) to a recruiter or hiring manager. Be formal, confident, and convincing.

Job Description:
${jobDescription || "No job description"}

CV:
${cv || "No CV"}

Rules:
1. Start with a professional greeting addressing the recipient.
2. Introduce yourself briefly and mention your interest in the specific role/company.
3. Highlight 1-2 relevant achievements from your CV that match the job requirements.
4. Express enthusiasm about contributing to the company's goals.
5. End with a clear call to action (e.g., request a brief call or meeting).
6. Length: 100-150 words — detailed enough to be persuasive, not too long.
7. Professional, formal tone — confident but not arrogant.

Output in English only.
`,

  interviewQuestions: (cv: string, jobDescription: string) => `
Based on the job description and CV, predict likely interview questions.

CV:
${cv || "No CV"}

Job Description:
${jobDescription || "No job description"}

Required:
1. List 5 realistic technical and behavioral questions.
2. For each, provide a suggested answer based ONLY on the CV content.
3. Do NOT invent experience or skills in the answers.

Format:
## Question 1: [Type]
**Question**: ...
**Suggested Answer**: ...

Output in English only.
`,

  analyzeATS: (cv: string, jobDescription: string) => `
Analyze how well the CV matches the job description for an ATS system.

CV:
${cv || "No CV"}

Job Description:
${jobDescription || "No job description"}

Required:
1. Calculate match percentage.
2. List matching keywords (from the CV).
3. List missing keywords (from the job description, not in CV).
4. Provide honest improvement tips — do NOT suggest fabricating skills.

Output format:
---
## ATS Compatibility Analysis
**Match Rate**: X%

### Matching Keywords
- ...

### Missing Keywords
- ...

### Improvement Tips
- ...
---

Output in English only.
`,
};

export type { Provider };