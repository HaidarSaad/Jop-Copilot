import { NextRequest, NextResponse } from "next/server";
import { sanitizePrompt } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, prompt } = await req.json();
    if (!apiKey) return NextResponse.json({ error: "API key is required" }, { status: 400 });
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const cleanPrompt = sanitizePrompt(prompt);
    return await handleGroq(apiKey, cleanPrompt);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Error: ${msg}` }, { status: 500 });
  }
}

async function handleGroq(apiKey: string, prompt: string) {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errMsg = data?.error?.message || JSON.stringify(data);
    return NextResponse.json({ error: `Groq: ${errMsg}` }, { status: 500 });
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) return NextResponse.json({ error: "No result returned" }, { status: 500 });
  return NextResponse.json({ result: text });
}