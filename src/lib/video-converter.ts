import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let isLoaded = false;

export async function loadFFmpeg(
  onProgress?: (progress: number) => void,
): Promise<void> {
  if (isLoaded && ffmpeg) return;

  ffmpeg = new FFmpeg();

  ffmpeg.on("log", ({ message }) => {
    console.log("FFmpeg Log:", message);
  });

  ffmpeg.on("progress", ({ progress }) => {
    if (onProgress) {
      onProgress(Math.round(progress * 100));
    }
  });

  const baseURL = "ffmpeg";

  try {
    const coreURL = new URL(`${baseURL}/ffmpeg-core.js`, location.origin).href;
    const wasmURL = new URL(`${baseURL}/ffmpeg-core.wasm`, location.origin)
      .href;

    await ffmpeg.load({
      coreURL: await toBlobURL(coreURL, "text/javascript"),
      wasmURL: await toBlobURL(wasmURL, "application/wasm"),
    });
    isLoaded = true;
  } catch (error) {
    console.error("FFmpeg Load Error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error);

    throw new Error(`Failed to load FFmpeg: ${errorMessage}`);
  }
}

export async function convertVideo(
  file: File,
  outputFormat: string,
  quality: "low" | "medium" | "high" = "medium",
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  if (!ffmpeg || !isLoaded) {
    await loadFFmpeg(onProgress);
  }

  if (!ffmpeg) {
    throw new Error("FFmpeg failed to initialize");
  }

  const progressHandler = ({ progress }: { progress: number }) => {
    if (onProgress) onProgress(Math.round(progress * 100));
  };
  ffmpeg.on("progress", progressHandler);

  const inputName = "input" + getFileExtension(file.name);
  const outputName = `output.${outputFormat}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const qualityArgs = getQualityArgs(outputFormat, quality);

  try {
    const result = await ffmpeg.exec([
      "-i",
      inputName,
      ...qualityArgs,
      outputName,
    ]);

    if (result !== 0) {
      throw new Error(
        `FFmpeg execution failed with exit code ${result}. Check console for details.`,
      );
    }

    const data = await ffmpeg.readFile(outputName);

    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    const mimeType = getMimeType(outputFormat);

    let uint8Data: Uint8Array;
    if (typeof data === "string") {
      uint8Data = new TextEncoder().encode(data);
    } else {
      const isShared =
        typeof SharedArrayBuffer !== "undefined" &&
        data.buffer instanceof SharedArrayBuffer;
      uint8Data = isShared
        ? new Uint8Array(data).slice()
        : new Uint8Array(data);
    }

    return new Blob([uint8Data as unknown as BlobPart], { type: mimeType });
  } catch (error) {
    try {
      if (ffmpeg) {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      }
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  } finally {
    if (ffmpeg) {
      ffmpeg.off("progress", progressHandler);
    }
  }
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
}

function getQualityArgs(
  format: string,
  quality: "low" | "medium" | "high",
): string[] {
  const qualityMap = {
    low: { crf: "28", preset: "fast" },
    medium: { crf: "23", preset: "medium" },
    high: { crf: "18", preset: "slow" },
  };

  const { crf, preset } = qualityMap[quality];

  if (format === "mp4") {
    return ["-c:v", "libx264", "-crf", crf, "-preset", preset, "-c:a", "aac"];
  } else if (format === "webm") {
    return ["-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0", "-c:a", "libopus"];
  } else if (format === "avi") {
    return [
      "-c:v",
      "mpeg4",
      "-q:v",
      quality === "high" ? "2" : quality === "medium" ? "5" : "8",
    ];
  }

  return [];
}

function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    avi: "video/x-msvideo",
  };
  return mimeTypes[format] || "video/mp4";
}
