import { Slider } from "@/components/ui/slider";

interface QualityControlsProps {
  quality: number;
  onQualityChange: (quality: number) => void;
  conversionType: string;
  outputFormat: string;
}

export function QualityControls({
  quality,
  onQualityChange,
  conversionType,
  outputFormat,
}: QualityControlsProps) {
  const supportsQuality =
    conversionType === "image" && ["jpeg", "webp"].includes(outputFormat);

  if (!supportsQuality) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Quality
        </label>
        <span className="text-sm font-mono font-semibold text-foreground px-2 py-1 bg-muted border border-border">
          {quality}%
        </span>
      </div>
      <Slider
        value={[quality]}
        onValueChange={(values) => onQualityChange(values[0])}
        min={1}
        max={100}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground font-mono font-medium">
        <span>LOW</span>
        <span>HIGH</span>
      </div>
    </div>
  );
}
