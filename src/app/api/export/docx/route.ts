import { NextResponse } from "next/server";
import generateAtsCV from "@/lib/generateAtsCV";

type ReqBody = {
  cv: string;
  filename?: string;
};

function parseCvToStructured(cv: string) {
  const lines = cv.split(/\r?\n/);
  const nonEmpty = lines.map(l => l.trim()).filter(Boolean);
  const name = nonEmpty[0] || "";
  const contactLine = nonEmpty[1] || "";

  const sections: { heading: string; items: { type: string; text: string }[] }[] = [];
  let current: any = null;
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const hMatch = line.match(/^##\s*(?:\*\*)?(.*?)(?:\*\*)?\s*$/);
    if (hMatch) {
      current = { heading: hMatch[1].toUpperCase(), items: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      // If no section yet, create a generic one
      current = { heading: "Summary", items: [] };
      sections.push(current);
    }
    if (line.startsWith("- ")) {
      current.items.push({ type: "bullet", text: line.replace(/^-\s*/, "") });
    } else {
      current.items.push({ type: "paragraph", text: line });
    }
  }

  return { name, contactLine, sections };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    const cvText = body.cv || "";
    const data = parseCvToStructured(cvText);
    const buffer = await generateAtsCV(data as any);
    const filename = body.filename || "CV.docx";
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
