import { formatBytes } from "@/lib/utils";
import { CheckCircle2, Download, TrendingDown } from "lucide-react";
import { Button } from "./ui/button";

interface ConvertedFileItemProps {
  originalFile: File;
  convertedBlob: Blob;
  outputFormat: string;
  onDownload: () => void;
}

export function ConvertedFileItem({
  originalFile,
  convertedBlob,
  outputFormat,
  onDownload,
}: ConvertedFileItemProps) {
  const originalSize = originalFile.size;
  const convertedSize = convertedBlob.size;
  const sizeDiff = originalSize - convertedSize;
  const percentChange = ((sizeDiff / originalSize) * 100).toFixed(1);
  const isSmaller = sizeDiff > 0;

  return (
    <div className="flex items-center justify-between p-4 group hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center border border-primary">
          <CheckCircle2 className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-tight">
            {originalFile.name.split(".").slice(0, -1).join(".")}.{outputFormat}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[10px] text-muted-foreground font-mono">
              {formatBytes(originalSize)} → {formatBytes(convertedSize)}
            </p>
            {isSmaller && (
              <div className="flex items-center gap-1 text-primary">
                <TrendingDown className="size-3" />
                <p className="text-[10px] font-mono">-{percentChange}%</p>
              </div>
            )}
            {!isSmaller && sizeDiff < 0 && (
              <p className="text-[10px] text-muted-foreground font-mono">
                +{Math.abs(parseFloat(percentChange))}%
              </p>
            )}
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
        className="uppercase tracking-wider text-xs"
      >
        <Download className="size-4" />
        Download
      </Button>
    </div>
  );
}
