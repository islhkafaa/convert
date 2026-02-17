import type { LucideIcon } from "lucide-react";
import {
  Archive,
  FileIcon,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";

interface FilePreviewProps {
  file: File;
  conversionType: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  archive: Archive,
};

export function FilePreview({ file, conversionType }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    let isActive = true;

    if (conversionType === "image" && file.type.startsWith("image/")) {
      url = URL.createObjectURL(file);
    }

    queueMicrotask(() => {
      if (isActive) {
        setPreview(url);
      }
    });

    return () => {
      isActive = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file, conversionType]);

  const IconComponent = ICON_MAP[conversionType] || FileIcon;

  if (preview && conversionType === "image") {
    return (
      <div className="w-10 h-10 bg-muted flex items-center justify-center border border-border group-hover:bg-primary/10 transition-colors overflow-hidden">
        <img
          src={preview}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 bg-muted flex items-center justify-center border border-border group-hover:bg-primary/10 transition-colors">
      <IconComponent className="size-5 text-primary" />
    </div>
  );
}
