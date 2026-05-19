// Client-side exporters. Lazy-imports the heavy formats (docx, jspdf) so the
// initial bundle stays small for users who only ever Copy or download Markdown.

import { getCategoryLabel } from "@/lib/faq-categories";

export type ExportFaq = {
  category: string;
  question: string;
  answer: string;
};

type Group = { category: string; rows: ExportFaq[] };

export function groupByCategory(faqs: ExportFaq[]): Group[] {
  const map = new Map<string, ExportFaq[]>();
  for (const faq of faqs) {
    const arr = map.get(faq.category) ?? [];
    arr.push(faq);
    map.set(faq.category, arr);
  }
  return Array.from(map.entries()).map(([category, rows]) => ({ category, rows }));
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Small delay before revoke so Safari doesn't choke.
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function downloadMarkdown(faqs: ExportFaq[], filename = "faqs.md") {
  const groups = groupByCategory(faqs);
  const lines: string[] = ["# FAQ", ""];
  for (const g of groups) {
    lines.push(`## ${getCategoryLabel(g.category)}`, "");
    for (const f of g.rows) {
      lines.push(`**${f.question}**`, "", f.answer, "");
    }
  }
  const text = lines.join("\n").trim() + "\n";
  triggerDownload(new Blob([text], { type: "text/markdown;charset=utf-8" }), filename);
}

// CSV — RFC 4180-ish: wrap every field in quotes, escape inner quotes by doubling them.
// One row per FAQ. No category grouping — flat tabular.
function csvEscape(s: string): string {
  return `"${s.replace(/"/g, '""')}"`;
}

export function downloadCsv(faqs: ExportFaq[], filename = "faqs.csv") {
  const rows: string[] = ["Category,Question,Answer"];
  for (const f of faqs) {
    rows.push(
      [csvEscape(getCategoryLabel(f.category)), csvEscape(f.question), csvEscape(f.answer)].join(","),
    );
  }
  const text = rows.join("\r\n") + "\r\n";
  triggerDownload(new Blob([text], { type: "text/csv;charset=utf-8" }), filename);
}

export async function downloadDocx(faqs: ExportFaq[], filename = "faqs.docx") {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import("docx");
  const groups = groupByCategory(faqs);

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ text: "FAQ", heading: HeadingLevel.HEADING_1 }),
  ];

  for (const g of groups) {
    children.push(
      new Paragraph({
        text: getCategoryLabel(g.category),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      }),
    );
    for (const f of g.rows) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: f.question, bold: true })],
          spacing: { before: 120, after: 60 },
        }),
      );
      for (const para of f.answer.split(/\n\n+/)) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: para })],
            spacing: { after: 120 },
          }),
        );
      }
    }
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, filename);
}

export async function downloadPdf(faqs: ExportFaq[], filename = "faqs.pdf") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 56;
  const marginY = 64;
  const contentWidth = pageWidth - marginX * 2;
  let y = marginY;

  function ensureRoom(needed: number) {
    if (y + needed > pageHeight - marginY) {
      doc.addPage();
      y = marginY;
    }
  }

  function writeBlock(text: string, opts: { size: number; bold?: boolean; spacingAfter: number; color?: [number, number, number] }) {
    const { size, bold, spacingAfter, color = [20, 30, 50] } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    const lineHeight = size * 1.35;
    ensureRoom(lines.length * lineHeight + spacingAfter);
    for (const line of lines) {
      doc.text(line, marginX, y);
      y += lineHeight;
    }
    y += spacingAfter;
  }

  writeBlock("FAQ", { size: 22, bold: true, spacingAfter: 18 });

  const groups = groupByCategory(faqs);
  for (const g of groups) {
    writeBlock(getCategoryLabel(g.category).toUpperCase(), {
      size: 10,
      bold: true,
      spacingAfter: 10,
      color: [140, 140, 150],
    });
    for (const f of g.rows) {
      writeBlock(f.question, { size: 12, bold: true, spacingAfter: 6 });
      writeBlock(f.answer, { size: 11, spacingAfter: 14 });
    }
  }

  doc.save(filename);
}
