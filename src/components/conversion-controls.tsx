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
    <div className="flex flex-col sm:flex-row gap-4">
      <Button
        id="convert-button"
        onClick={onConvert}
        disabled={filesCount === 0 || isConverting}
        className="uppercase tracking-wider w-full sm:w-auto text-base font-semibold px-8 py-6"
        size="lg"
      >
        {isConverting ? (
          <>
            <Loader2 className="size-5 animate-spin" />
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
          className="uppercase tracking-wider w-full sm:w-auto text-base font-semibold px-8 py-6"
          size="lg"
        >
          <Download className="size-5" />
          Download All
        </Button>
      )}
    </div>
  );
}
