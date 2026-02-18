import { convertDocument } from "./document-converter";
import { processImage, type ImageOptions } from "./image-processor";
import { convertVideo } from "./video-converter";

export interface ConversionProgress {
  fileName: string;
  progress: number;
  status: "pending" | "converting" | "completed" | "error";
  error?: string;
}

export async function convertImage(
  file: File,
  outputFormat: string,
  quality: number = 0.92,
  options?: ImageOptions,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  if (onProgress) onProgress(10);
  const mimeType = `image/${outputFormat === "jpg" ? "jpeg" : outputFormat}`;

  if (options && Object.keys(options).length > 0) {
    const blob = await processImage(file, options, mimeType, quality);
    if (onProgress) onProgress(100);
    return blob;
  }

  const imgBitmap = await createImageBitmap(file);
  if (onProgress) onProgress(30);

  const { width, height } = imgBitmap;
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let ctx: CanvasRenderingContext2D | OffscreenRenderingContext | null;

  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext("2d");
  } else {
    const htmlCanvas = document.createElement("canvas");
    htmlCanvas.width = width;
    htmlCanvas.height = height;
    canvas = htmlCanvas;
    ctx = htmlCanvas.getContext("2d");
  }

  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.drawImage(imgBitmap, 0, 0);
  imgBitmap.close();
  if (onProgress) onProgress(50);

  let blob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: mimeType, quality });
  } else {
    blob = await new Promise((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to convert image"))),
        mimeType,
        quality,
      );
    });
  }

  if (onProgress) onProgress(100);
  return blob;
}

export async function convertAudio(
  file: File,
  _outputFormat: string,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  if (onProgress) onProgress(0);
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass =
    (globalThis as unknown as { AudioContext: typeof AudioContext })
      .AudioContext ||
    (globalThis as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) throw new Error("AudioContext is not supported");
  const audioContext = new AudioContextClass();
  if (onProgress) onProgress(10);
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch {
    audioBuffer = await new Promise((res, rej) =>
      audioContext.decodeAudioData(arrayBuffer, res, rej),
    );
  }
  if (onProgress) onProgress(40);
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  if (onProgress) onProgress(50);
  const wavBuffer = encodeWAV(
    audioBuffer,
    numberOfChannels,
    sampleRate,
    length,
    (progress) => {
      if (onProgress) onProgress(50 + progress * 0.45);
    },
  );
  if (onProgress) onProgress(100);
  const blob = new Blob([wavBuffer], { type: "audio/wav" });
  if (audioContext.close) await audioContext.close();
  return blob;
}

function encodeWAV(
  audioBuffer: AudioBuffer,
  numberOfChannels: number,
  sampleRate: number,
  length: number,
  onProgress?: (progress: number) => void,
): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++)
      view.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length * numberOfChannels * 2, true);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    if (onProgress && i % 10000 === 0) onProgress(i / length);
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(
        -1,
        Math.min(1, audioBuffer.getChannelData(channel)[i]),
      );
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true,
      );
      offset += 2;
    }
  }
  if (onProgress) onProgress(1);
  return buffer;
}

export async function convertFile(
  file: File,
  conversionType: string,
  outputFormat: string,
  quality: number = 0.92,
  onProgress?: (progress: number) => void,
  options?: ImageOptions,
): Promise<Blob> {
  if (onProgress) onProgress(0);
  switch (conversionType) {
    case "image":
      return convertImage(file, outputFormat, quality, options, onProgress);
    case "audio":
      return convertAudio(file, outputFormat, onProgress);
    case "video": {
      const videoQuality =
        quality >= 0.8 ? "high" : quality >= 0.5 ? "medium" : "low";
      return convertVideo(file, outputFormat, videoQuality, onProgress);
    }
    case "document":
      return convertDocument(file, outputFormat, onProgress);
    default:
      throw new Error(`Conversion not supported for ${conversionType}`);
  }
}
