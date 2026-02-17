import type { LucideIcon } from "lucide-react";
import { Archive, FileText, Image, Music, Video } from "lucide-react";

export type ConversionType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "archive";

interface ConversionSelectorProps {
  value: ConversionType;
  onChange: (type: ConversionType) => void;
}

const conversionTypes: {
  id: ConversionType;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "image", label: "Image", icon: Image },
  { id: "video", label: "Video", icon: Video },
  { id: "audio", label: "Audio", icon: Music },
  { id: "document", label: "Document", icon: FileText },
  { id: "archive", label: "Archive", icon: Archive },
];

export function ConversionSelector({
  value,
  onChange,
}: ConversionSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {conversionTypes.map((type) => {
        const IconComponent = type.icon;
        return (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`
              flex items-center gap-2 px-6 py-3 border-2 font-medium transition-all
              ${
                value === type.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-accent hover:border-accent"
              }
            `}
          >
            <IconComponent className="size-5" />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
