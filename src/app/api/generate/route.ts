import { NextRequest, NextResponse } from "next/server";
import { sanitizePrompt } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, prompt, provider } = await req.json();
    if (!apiKey) return NextResponse.json({ error: "API key is required" }, { status: 400 });
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const cleanPrompt = sanitizePrompt(prompt);

    if (provider === "openai") {
      return await handleOpenAI(apiKey, cleanPrompt);
    }
    return await handleGemini(apiKey, cleanPrompt);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Error: ${msg}` }, { status: 500 });
  }
}

async function handleGemini(apiKey: string, prompt: string) {
  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errMsg = data?.error?.message || JSON.stringify(data);
    return NextResponse.json({ error: `Gemini: ${errMsg}` }, { status: 500 });
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return NextResponse.json({ error: "No result returned" }, { status: 500 });
  return NextResponse.json({ result: text });
}

async function handleOpenAI(apiKey: string, prompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errMsg = data?.error?.message || JSON.stringify(data);
    return NextResponse.json({ error: `OpenAI: ${errMsg}` }, { status: 500 });
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) return NextResponse.json({ error: "No result returned" }, { status: 500 });
  return NextResponse.json({ result: text });
}