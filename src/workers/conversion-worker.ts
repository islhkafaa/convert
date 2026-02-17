import { convertFile } from "../lib/converter";

self.onmessage = async (e: MessageEvent) => {
  const { type, jobId, file, outputFormat, quality, conversionType } = e.data;

  if (type === "convert") {
    try {
      const blob = await convertFile(
        file,
        conversionType,
        outputFormat,
        quality,
        (progress) => {
          self.postMessage({
            type: "progress",
            jobId,
            progress,
          });
        },
      );

      self.postMessage({
        type: "complete",
        jobId,
        result: blob,
      });
    } catch (error) {
      self.postMessage({
        type: "error",
        jobId,
        error: error instanceof Error ? error.message : "Conversion failed",
      });
    }
  }
};
