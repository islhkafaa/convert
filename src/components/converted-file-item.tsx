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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 group hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center border border-primary shrink-0">
          <CheckCircle2 className="size-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold uppercase tracking-tight truncate">
            {originalFile.name.split(".").slice(0, -1).join(".")}.{outputFormat}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
            <p className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
              {formatBytes(originalSize)} → {formatBytes(convertedSize)}
            </p>
            {isSmaller && (
              <div className="flex items-center gap-1 text-primary whitespace-nowrap">
                <TrendingDown className="size-3" />
                <p className="text-[10px] font-mono">-{percentChange}%</p>
              </div>
            )}
            {!isSmaller && sizeDiff < 0 && (
              <p className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
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
        className="uppercase tracking-wider text-xs w-full sm:w-auto mt-2 sm:mt-0"
      >
        <Download className="size-4" />
        Download
      </Button>
    </div>
  );
}
