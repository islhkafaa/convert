import { convertFile, type ConversionProgress } from "@/lib/converter";
import { formatBytes } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Download, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ConversionControls } from "./components/conversion-controls";
import {
  ConversionSelector,
  type ConversionType,
} from "./components/conversion-selector";
import { FilePreview } from "./components/file-preview";
import { FileUploadZone } from "./components/file-upload-zone";
import { FormatSelector } from "./components/format-selector";
import { Header } from "./components/header";
import { QualityControls } from "./components/quality-controls";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";

interface ConvertedFile {
  originalFile: File;
  convertedBlob: Blob;
  outputFormat: string;
}

export default function App() {
  const [conversionType, setConversionType] = useState<ConversionType>("image");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>("png");
  const [quality, setQuality] = useState<number>(92);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<
    Map<string, ConversionProgress>
  >(new Map());
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setConvertedFiles([]);
    setConversionProgress(new Map());
    setError(null);
  };

  const handleConversionTypeChange = (type: ConversionType) => {
    setConversionType(type);
    setOutputFormat(
      type === "image" ? "png" : type === "audio" ? "mp3" : "mp4",
    );
    setSelectedFiles([]);
    setConvertedFiles([]);
    setConversionProgress(new Map());
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;

    setIsConverting(true);
    setConvertedFiles([]);
    const progressMap = new Map<string, ConversionProgress>();

    selectedFiles.forEach((file) => {
      progressMap.set(file.name, {
        fileName: file.name,
        progress: 0,
        status: "pending",
      });
    });
    setConversionProgress(new Map(progressMap));

    const converted: ConvertedFile[] = [];

    for (const file of selectedFiles) {
      try {
        progressMap.set(file.name, {
          fileName: file.name,
          progress: 0,
          status: "converting",
        });
        setConversionProgress(new Map(progressMap));

        const blob = await convertFile(
          file,
          conversionType,
          outputFormat,
          quality / 100,
          (progress) => {
            progressMap.set(file.name, {
              fileName: file.name,
              progress,
              status: "converting",
            });
            setConversionProgress(new Map(progressMap));
          },
        );

        converted.push({
          originalFile: file,
          convertedBlob: blob,
          outputFormat,
        });

        progressMap.set(file.name, {
          fileName: file.name,
          progress: 100,
          status: "completed",
        });
        setConversionProgress(new Map(progressMap));
      } catch (err) {
        progressMap.set(file.name, {
          fileName: file.name,
          progress: 0,
          status: "error",
          error: err instanceof Error ? err.message : "Conversion failed",
        });
        setConversionProgress(new Map(progressMap));
      }
    }

    setConvertedFiles(converted);
    setIsConverting(false);
  };

  const downloadFile = (convertedFile: ConvertedFile) => {
    const url = URL.createObjectURL(convertedFile.convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    const originalName = convertedFile.originalFile.name
      .split(".")
      .slice(0, -1)
      .join(".");
    a.download = `${originalName}.${convertedFile.outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    convertedFiles.forEach((file) => downloadFile(file));
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {error && (
            <div className="border-2 border-destructive bg-destructive/10 p-4 flex items-start gap-3">
              <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold uppercase tracking-tight text-destructive mb-1">
                  Upload Error
                </p>
                <p className="text-xs text-destructive/90">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-destructive/20 transition-colors"
              >
                <X className="size-4 text-destructive" />
              </button>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Select Category
            </h2>
            <ConversionSelector
              value={conversionType}
              onChange={handleConversionTypeChange}
            />
          </div>

          <div className="space-y-6">
            <FormatSelector
              conversionType={conversionType}
              selectedFormat={outputFormat}
              onFormatChange={setOutputFormat}
            />
          </div>

          <QualityControls
            quality={quality}
            onQualityChange={setQuality}
            conversionType={conversionType}
            outputFormat={outputFormat}
          />

          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Source Files
            </h2>
            <FileUploadZone
              conversionType={conversionType}
              onFilesSelected={handleFilesSelected}
              onError={handleError}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Queue ({selectedFiles.length})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="uppercase tracking-wider text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="border-2 border-border bg-background">
                <div className="divide-y-2 divide-border">
                  {selectedFiles.map((file, index) => {
                    const progress = conversionProgress.get(file.name);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 group hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <FilePreview
                            file={file}
                            conversionType={conversionType}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-bold uppercase tracking-tight">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {formatBytes(file.size)}
                            </p>
                            {progress && progress.status !== "pending" && (
                              <div className="mt-2">
                                {progress.status === "converting" && (
                                  <div className="space-y-1">
                                    <Progress
                                      value={progress.progress}
                                      className="h-1"
                                    />
                                    <p className="text-[10px] text-muted-foreground font-mono">
                                      {Math.round(progress.progress)}%
                                    </p>
                                  </div>
                                )}
                                {progress.status === "completed" && (
                                  <div className="flex items-center gap-1 text-primary">
                                    <CheckCircle2 className="size-3" />
                                    <p className="text-[10px] font-mono">
                                      COMPLETED
                                    </p>
                                  </div>
                                )}
                                {progress.status === "error" && (
                                  <p className="text-[10px] text-destructive font-mono">
                                    ERROR: {progress.error}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          disabled={isConverting}
                          className="p-2 border-2 border-transparent hover:border-destructive hover:text-destructive transition-all disabled:opacity-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <ConversionControls
                filesCount={selectedFiles.length}
                isConverting={isConverting}
                onConvert={handleConvert}
                onDownloadAll={downloadAll}
                hasConvertedFiles={convertedFiles.length > 0}
              />
            </div>
          )}

          {convertedFiles.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Converted Files ({convertedFiles.length})
              </h2>
              <div className="border-2 border-border bg-background">
                <div className="divide-y-2 divide-border">
                  {convertedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 group hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center border border-primary">
                          <CheckCircle2 className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase tracking-tight">
                            {file.originalFile.name
                              .split(".")
                              .slice(0, -1)
                              .join(".")}
                            .{file.outputFormat}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {formatBytes(file.convertedBlob.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(file)}
                        className="uppercase tracking-wider text-xs"
                      >
                        <Download className="size-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
