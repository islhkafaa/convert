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

export function FilePreview({ file, conversionType }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (conversionType === "image" && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [file, conversionType]);

  const getIcon = () => {
    switch (conversionType) {
      case "image":
        return ImageIcon;
      case "video":
        return Video;
      case "audio":
        return Music;
      case "document":
        return FileText;
      case "archive":
        return Archive;
      default:
        return FileIcon;
    }
  };

  const Icon = getIcon();

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
      <Icon className="size-5 text-primary" />
    </div>
  );
}
