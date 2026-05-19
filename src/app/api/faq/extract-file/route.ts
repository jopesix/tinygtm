// POST /api/extract-file (multipart/form-data, field name "file")
// Accepts .pdf, .docx, .md, .txt, .markdown. Returns clean text for the
// supporting-context textarea. Skips .pptx for v1.

import { NextResponse, type NextRequest } from "next/server";
import { MAX_PASTE } from "@/lib/schemas/generate";
import { captureError, track } from "@/lib/observability";

export const maxDuration = 30;
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // pdfjs/unpdf + mammoth both need Node, not Edge.

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

type Ext = "pdf" | "docx" | "md" | "txt";

function detectExt(filename: string): Ext | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "md";
  if (lower.endsWith(".txt")) return "txt";
  return null;
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n\n") : text;
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function extractPlain(buffer: Buffer): string {
  return buffer.toString("utf8");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();

  let file: File | null = null;
  try {
    const form = await req.formData();
    const v = form.get("file");
    if (v instanceof File) file = v;
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "Couldn't read the upload." },
      { status: 400 },
    );
  }

  if (!file) {
    return NextResponse.json(
      { error: "no_file", message: "Attach a file under the `file` field." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "empty_file", message: "That file is empty." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      {
        error: "too_large",
        message: `File is over 10MB. Try splitting it or pasting the relevant section.`,
      },
      { status: 413 },
    );
  }

  const ext = detectExt(file.name);
  if (!ext) {
    return NextResponse.json(
      {
        error: "unsupported_type",
        message: "Unsupported file type. Use .pdf, .docx, .md, or .txt.",
      },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let extracted = "";
  try {
    if (ext === "pdf") extracted = await extractPdf(buffer);
    else if (ext === "docx") extracted = await extractDocx(buffer);
    else extracted = extractPlain(buffer);
  } catch (err) {
    captureError(err, { where: "extract-file", ext, filename: file.name });
    return NextResponse.json(
      {
        error: "extract_failed",
        message:
          "Couldn't extract text from that file. It may be scanned, password-protected, or corrupt.",
      },
      { status: 502 },
    );
  }

  extracted = extracted.trim();
  if (!extracted) {
    return NextResponse.json(
      {
        error: "no_content",
        message:
          "The file extracted to empty text. If it's a scanned PDF, you'll need to OCR it first.",
      },
      { status: 502 },
    );
  }

  const truncated = extracted.length > MAX_PASTE;
  const out = truncated ? extracted.slice(0, MAX_PASTE) : extracted;

  // Map file extension to the closest resource_type the form already knows.
  const resourceTypeHint =
    ext === "pdf" ? "prd" : ext === "docx" ? "prd" : "help_doc"; // crude default

  track("extract_file_completed", {
    ext,
    filename: file.name,
    char_count: out.length,
    truncated,
    duration_ms: Date.now() - startedAt,
  });

  return NextResponse.json({
    filename: file.name,
    ext,
    markdown: out,
    char_count: out.length,
    truncated,
    resource_type_hint: resourceTypeHint,
  });
}
