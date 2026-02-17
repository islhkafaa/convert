import type { LucideIcon } from "lucide-react";
import { FileText, Image, Music, Video } from "lucide-react";

export type ConversionType = "image" | "video" | "audio" | "document";

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
];

export function ConversionSelector({
  value,
  onChange,
}: ConversionSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:flex gap-3 flex-wrap">
      {conversionTypes.map((type) => {
        const IconComponent = type.icon;
        const isActive = value === type.id;
        return (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`
              flex items-center justify-center gap-2 px-6 py-4 border-2 font-semibold transition-all duration-200 flex-1 sm:flex-none uppercase tracking-wide text-sm
              ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary scale-105"
                  : "bg-background text-foreground border-border hover:bg-muted hover:border-primary/30 hover:scale-105"
              }
            `}
          >
            <IconComponent
              className={`size-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
            />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
