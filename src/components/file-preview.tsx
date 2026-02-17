import { getFileMetadata, type FileMetadata } from "@/lib/metadata-extractor";
import { generateImageThumbnail } from "@/lib/thumbnail-generator";
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
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadPreview = async () => {
      if (conversionType === "image" && file.type.startsWith("image/")) {
        try {
          const thumb = await generateImageThumbnail(file, 48);
          if (isActive) setThumbnail(thumb);
        } catch (error) {
          console.error("Failed to generate thumbnail:", error);
        }
      }

      try {
        const meta = await getFileMetadata(file, conversionType);
        if (isActive) setMetadata(meta);
      } catch (error) {
        console.error("Failed to extract metadata:", error);
      }
    };

    loadPreview();

    return () => {
      isActive = false;
    };
  }, [file, conversionType]);

  const IconComponent = ICON_MAP[conversionType] || FileIcon;

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {thumbnail && conversionType === "image" ? (
        <div className="w-12 h-12 bg-muted flex items-center justify-center border-2 border-border group-hover:border-primary/30 transition-colors overflow-hidden shrink-0">
          <img
            src={thumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 bg-muted flex items-center justify-center border-2 border-border group-hover:border-primary/30 transition-colors shrink-0">
          <IconComponent className="size-6 text-primary" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold uppercase tracking-tight truncate">
          {file.name}
        </p>
        {metadata && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {metadata.dimensions && (
              <span className="text-xs font-mono text-muted-foreground">
                {metadata.dimensions}
              </span>
            )}
            {metadata.duration && (
              <span className="text-xs font-mono text-muted-foreground">
                {metadata.duration}
              </span>
            )}
            <span className="text-xs font-mono text-muted-foreground">
              {metadata.size}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
