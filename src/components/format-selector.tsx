import type { ConversionType } from "./conversion-selector";

interface FormatSelectorProps {
  conversionType: ConversionType;
  selectedFormat: string;
  onFormatChange: (format: string) => void;
}

const outputFormats: Record<
  ConversionType,
  { value: string; label: string }[]
> = {
  image: [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPEG" },
    { value: "webp", label: "WebP" },
    { value: "gif", label: "GIF" },
  ],
  video: [
    { value: "mp4", label: "MP4" },
    { value: "webm", label: "WebM" },
    { value: "avi", label: "AVI" },
  ],
  audio: [
    { value: "mp3", label: "MP3" },
    { value: "wav", label: "WAV" },
    { value: "ogg", label: "OGG" },
  ],
  document: [
    { value: "txt", label: "TXT" },
    { value: "pdf", label: "PDF" },
    { value: "html", label: "HTML" },
  ],
};

export function FormatSelector({
  conversionType,
  selectedFormat,
  onFormatChange,
}: FormatSelectorProps) {
  const formats = outputFormats[conversionType];

  return (
    <div className="space-y-4">
      <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Output Format
      </label>
      <div className="flex gap-2 flex-wrap">
        {formats.map((format) => {
          const isActive = selectedFormat === format.value;
          return (
            <button
              key={format.value}
              onClick={() => onFormatChange(format.value)}
              className={`
                px-5 py-2.5 border-2 font-semibold text-sm transition-all duration-200 uppercase tracking-wider flex-1 sm:flex-none
                ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted hover:border-primary/30"
                }
              `}
            >
              {format.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
