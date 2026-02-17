import JSZip from "jszip";

export async function createZipFromFiles(
  files: { name: string; blob: Blob }[],
): Promise<Blob> {
  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.name, file.blob);
  });

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  return zipBlob;
}

export function downloadZip(zipBlob: Blob, filename: string) {
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateZipFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
  return `convert-${timestamp}.zip`;
}
