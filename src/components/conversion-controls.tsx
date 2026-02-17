import { Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface ConversionControlsProps {
  filesCount: number;
  isConverting: boolean;
  onConvert: () => void;
  onDownloadAll: () => void;
  hasConvertedFiles: boolean;
}

export function ConversionControls({
  filesCount,
  isConverting,
  onConvert,
  onDownloadAll,
  hasConvertedFiles,
}: ConversionControlsProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      <Button
        onClick={onConvert}
        disabled={filesCount === 0 || isConverting}
        className="uppercase tracking-wider"
      >
        {isConverting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Converting...
          </>
        ) : (
          `Convert ${filesCount > 0 ? `(${filesCount})` : ""}`
        )}
      </Button>

      {hasConvertedFiles && (
        <Button
          variant="outline"
          onClick={onDownloadAll}
          className="uppercase tracking-wider"
        >
          <Download className="size-4" />
          Download All
        </Button>
      )}
    </div>
  );
}
