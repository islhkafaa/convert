import { Upload } from "lucide-react";
import { useState } from "react";
import type { ConversionType } from "./conversion-selector";

interface FileUploadZoneProps {
  conversionType: ConversionType;
  onFilesSelected: (files: File[]) => void;
  onError: (error: string) => void;
}

const acceptedFileTypes: Record<ConversionType, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
  document: ".pdf,.doc,.docx,.txt,.rtf",
  archive: ".zip,.rar,.7z,.tar,.gz",
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const validateFiles = (
  files: File[],
  conversionType: ConversionType,
): { valid: File[]; errors: string[] } => {
  const valid: File[] = [];
  const errors: string[] = [];

  files.forEach((file) => {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name} exceeds 100MB limit`);
      return;
    }

    const acceptedTypes = acceptedFileTypes[conversionType];
    if (acceptedTypes.includes("/*")) {
      const category = acceptedTypes.split("/")[0];
      if (!file.type.startsWith(category)) {
        errors.push(`${file.name} is not a valid ${conversionType} file`);
        return;
      }
    } else {
      const extensions = acceptedTypes.split(",");
      const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
      if (!extensions.includes(fileExt)) {
        errors.push(`${file.name} is not a supported format`);
        return;
      }
    }

    valid.push(file);
  });

  return { valid, errors };
};

export function FileUploadZone({
  conversionType,
  onFilesSelected,
  onError,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = "";
  };

  const processFiles = (files: File[]) => {
    if (files.length === 0) return;

    const { valid, errors } = validateFiles(files, conversionType);

    if (errors.length > 0) {
      onError(errors.join("; "));
    }

    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed transition-all
        min-h-[400px] flex flex-col items-center justify-center
        cursor-pointer
        ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-accent hover:bg-accent/50"
        }
      `}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        multiple
        accept={acceptedFileTypes[conversionType]}
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="text-center space-y-4 px-6">
        <div className="w-16 h-16 mx-auto border-2 border-border bg-muted flex items-center justify-center">
          <Upload className="size-8 text-foreground" />
        </div>

        <div>
          <p className="text-lg font-medium mb-2 uppercase tracking-wide">
            Drop {conversionType} files here
          </p>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            or click to browse
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground font-mono">
          MAX 100MB PER FILE
        </p>
      </div>
    </div>
  );
}
