import { convertArchive } from "./archive-converter";
import { convertDocument } from "./document-converter";
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
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        if (onProgress) onProgress(50);

        const mimeType = `image/${outputFormat === "jpg" ? "jpeg" : outputFormat}`;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (onProgress) onProgress(100);
              resolve(blob);
            } else {
              reject(new Error("Failed to convert image"));
            }
          },
          mimeType,
          quality,
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

export async function convertAudio(
  file: File,
  _outputFormat: string,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      let audioContext: AudioContext | null = null;
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const AudioContextClass = (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext) as typeof AudioContext;
        audioContext = new AudioContextClass();

        if (onProgress) onProgress(10);

        let audioBuffer: AudioBuffer;
        try {
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        } catch {
          audioBuffer = await new Promise((res, rej) => {
            audioContext!.decodeAudioData(arrayBuffer, res, rej);
          });
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
        resolve(blob);
      } catch (error) {
        reject(error);
      } finally {
        if (audioContext) {
          audioContext.close();
        }
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read audio file"));
    };

    reader.readAsArrayBuffer(file);
  });
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
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
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
    if (onProgress && i % 10000 === 0) {
      onProgress(i / length);
    }

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
): Promise<Blob> {
  if (onProgress) onProgress(0);

  switch (conversionType) {
    case "image":
      return convertImage(file, outputFormat, quality, onProgress);
    case "audio":
      return convertAudio(file, outputFormat, onProgress);
    case "video": {
      const videoQuality =
        quality >= 0.8 ? "high" : quality >= 0.5 ? "medium" : "low";
      return convertVideo(file, outputFormat, videoQuality, onProgress);
    }
    case "document":
      return convertDocument(file, outputFormat, onProgress);
    case "archive":
      return convertArchive(file, outputFormat, onProgress);
    default:
      throw new Error(`Conversion not supported for ${conversionType}`);
  }
}
