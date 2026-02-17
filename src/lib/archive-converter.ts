import JSZip from "jszip";

export interface ExtractedFile {
  name: string;
  blob: Blob;
  size: number;
}

export async function extractArchive(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<ExtractedFile[]> {
  if (onProgress) onProgress(10);

  const zip = new JSZip();
  const contents = await zip.loadAsync(file);

  if (onProgress) onProgress(30);

  const files: ExtractedFile[] = [];
  const fileNames = Object.keys(contents.files);
  let processed = 0;

  for (const fileName of fileNames) {
    const zipEntry = contents.files[fileName];

    if (zipEntry.dir) {
      processed++;
      continue;
    }

    const blob = await zipEntry.async("blob");
    files.push({
      name: fileName,
      blob: blob,
      size: blob.size,
    });

    processed++;
    if (onProgress) {
      onProgress(30 + (processed / fileNames.length) * 60);
    }
  }

  if (onProgress) onProgress(100);

  return files;
}

export async function createArchive(
  files: ExtractedFile[],
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  if (onProgress) onProgress(10);

  const zip = new JSZip();

  files.forEach((file, index) => {
    zip.file(file.name, file.blob);
    if (onProgress) {
      onProgress(10 + ((index + 1) / files.length) * 70);
    }
  });

  if (onProgress) onProgress(80);

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  if (onProgress) onProgress(100);

  return zipBlob;
}

export async function convertArchive(
  file: File,
  outputFormat: string,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const inputFormat = getFileExtension(file.name).toLowerCase();

  if (inputFormat === "zip" && outputFormat === "extract") {
    const extractedFiles = await extractArchive(file, (progress) => {
      if (onProgress) onProgress(progress * 0.8);
    });

    const repackedZip = await createArchive(extractedFiles, (progress) => {
      if (onProgress) onProgress(80 + progress * 0.2);
    });

    return repackedZip;
  }

  if (inputFormat === "zip" && outputFormat === "zip") {
    const extractedFiles = await extractArchive(file, (progress) => {
      if (onProgress) onProgress(progress * 0.5);
    });

    const repackedZip = await createArchive(extractedFiles, (progress) => {
      if (onProgress) onProgress(50 + progress * 0.5);
    });

    return repackedZip;
  }

  throw new Error(
    `Conversion from ${inputFormat} to ${outputFormat} is not supported`,
  );
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}
