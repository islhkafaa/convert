import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function convertDocument(
  file: File,
  outputFormat: string,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const inputFormat = getFileExtension(file.name).toLowerCase();

  if (onProgress) onProgress(10);

  if (inputFormat === "pdf") {
    if (outputFormat === "txt") {
      return await pdfToText(file, onProgress);
    } else if (outputFormat === "html") {
      return await pdfToHtml(file, onProgress);
    }
  }

  if (outputFormat === "pdf") {
    if (inputFormat === "txt") {
      return await textToPdf(file, onProgress);
    } else if (inputFormat === "html" || inputFormat === "htm") {
      return await htmlToPdf(file, onProgress);
    }
  }

  if (inputFormat === "txt" && outputFormat === "html") {
    return await textToHtml(file, onProgress);
  }
  if (
    (inputFormat === "html" || inputFormat === "htm") &&
    outputFormat === "txt"
  ) {
    return await htmlToText(file, onProgress);
  }

  throw new Error(
    `Conversion from ${inputFormat} to ${outputFormat} is not supported`,
  );
}

async function pdfToText(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  if (onProgress) onProgress(30);

  const numPages = pdf.numPages;
  const textParts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    textParts.push(pageText);

    if (onProgress) {
      onProgress(30 + (i / numPages) * 60);
    }
  }

  if (onProgress) onProgress(100);

  const fullText = textParts.join("\n\n");
  return new Blob([fullText], { type: "text/plain" });
}

async function pdfToHtml(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  if (onProgress) onProgress(30);

  const numPages = pdf.numPages;
  const htmlParts: string[] = [
    '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>Converted Document</title>\n</head>\n<body>\n',
  ];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    htmlParts.push(
      `<div class="page">\n<p>${escapeHtml(pageText)}</p>\n</div>\n`,
    );

    if (onProgress) {
      onProgress(30 + (i / numPages) * 60);
    }
  }

  htmlParts.push("</body>\n</html>");

  if (onProgress) onProgress(100);

  const fullHtml = htmlParts.join("");
  return new Blob([fullHtml], { type: "text/html" });
}

async function textToPdf(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const text = await file.text();

  if (onProgress) onProgress(30);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 7;

  const lines = doc.splitTextToSize(text, maxWidth);
  let y = margin;

  if (onProgress) onProgress(60);

  for (let i = 0; i < lines.length; i++) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines[i], margin, y);
    y += lineHeight;
  }

  if (onProgress) onProgress(90);

  const pdfBlob = doc.output("blob");

  if (onProgress) onProgress(100);

  return pdfBlob;
}

async function htmlToPdf(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const html = await file.text();

  if (onProgress) onProgress(30);

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(html, "text/html");
  const text = htmlDoc.body.textContent || "";

  if (onProgress) onProgress(60);

  const textFile = new File([text], "temp.txt", { type: "text/plain" });
  return await textToPdf(textFile, (progress) => {
    if (onProgress) onProgress(60 + progress * 0.4);
  });
}

async function textToHtml(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const text = await file.text();

  if (onProgress) onProgress(50);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Converted Document</title>
<style>
body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
pre { white-space: pre-wrap; word-wrap: break-word; }
</style>
</head>
<body>
<pre>${escapeHtml(text)}</pre>
</body>
</html>`;

  if (onProgress) onProgress(100);

  return new Blob([html], { type: "text/html" });
}

async function htmlToText(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const html = await file.text();

  if (onProgress) onProgress(50);

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(html, "text/html");
  const text = htmlDoc.body.textContent || "";

  if (onProgress) onProgress(100);

  return new Blob([text], { type: "text/plain" });
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
