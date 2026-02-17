export interface FileMetadata {
  size: string;
  dimensions?: string;
  duration?: string;
  format: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export async function getImageMetadata(file: File): Promise<FileMetadata> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          size: formatFileSize(file.size),
          dimensions: `${img.width}×${img.height}`,
          format: file.type.split("/")[1].toUpperCase(),
        });
      };

      img.onerror = () => {
        resolve({
          size: formatFileSize(file.size),
          format: file.type.split("/")[1].toUpperCase(),
        });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({
        size: formatFileSize(file.size),
        format: file.type.split("/")[1].toUpperCase(),
      });
    };

    reader.readAsDataURL(file);
  });
}

export async function getVideoMetadata(file: File): Promise<FileMetadata> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      resolve({
        size: formatFileSize(file.size),
        dimensions: `${video.videoWidth}×${video.videoHeight}`,
        duration: formatDuration(video.duration),
        format: file.type.split("/")[1].toUpperCase(),
      });
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      resolve({
        size: formatFileSize(file.size),
        format: file.type.split("/")[1].toUpperCase(),
      });
      URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);
  });
}

export async function getAudioMetadata(file: File): Promise<FileMetadata> {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";

    audio.onloadedmetadata = () => {
      resolve({
        size: formatFileSize(file.size),
        duration: formatDuration(audio.duration),
        format: file.type.split("/")[1].toUpperCase(),
      });
      URL.revokeObjectURL(audio.src);
    };

    audio.onerror = () => {
      resolve({
        size: formatFileSize(file.size),
        format: file.type.split("/")[1].toUpperCase(),
      });
      URL.revokeObjectURL(audio.src);
    };

    audio.src = URL.createObjectURL(file);
  });
}

export async function getDocumentMetadata(file: File): Promise<FileMetadata> {
  return Promise.resolve({
    size: formatFileSize(file.size),
    format: file.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
  });
}

export async function getFileMetadata(
  file: File,
  conversionType: string,
): Promise<FileMetadata> {
  switch (conversionType) {
    case "image":
      return getImageMetadata(file);
    case "video":
      return getVideoMetadata(file);
    case "audio":
      return getAudioMetadata(file);
    case "document":
      return getDocumentMetadata(file);
    default:
      return {
        size: formatFileSize(file.size),
        format: "UNKNOWN",
      };
  }
}
