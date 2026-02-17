import { convertFile, type ConversionProgress } from "@/lib/converter";
import { WorkerPool } from "@/lib/worker-pool";
import {
  createZipFromFiles,
  downloadZip,
  generateZipFilename,
} from "@/lib/zip-utils";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AlertCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConversionControls } from "./components/conversion-controls";
import {
  ConversionSelector,
  type ConversionType,
} from "./components/conversion-selector";
import { ConvertedFileItem } from "./components/converted-file-item";
import { DraggableFileItem } from "./components/draggable-file-item";
import { FileUploadZone } from "./components/file-upload-zone";
import { FormatSelector } from "./components/format-selector";
import { Header } from "./components/header";
import { InstallPrompt } from "./components/install-prompt";
import { OfflineIndicator } from "./components/offline-indicator";
import { QualityControls } from "./components/quality-controls";
import { Button } from "./components/ui/button";

interface ConvertedFile {
  originalFile: FileWithId;
  convertedBlob: Blob;
  outputFormat: string;
}

type FileWithId = File & { id: string };

const USE_WORKERS = true;

export default function App() {
  const [conversionType, setConversionType] = useState<ConversionType>("image");
  const [selectedFiles, setSelectedFiles] = useState<FileWithId[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>("png");
  const [quality, setQuality] = useState<number>(92);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<
    Map<string, ConversionProgress>
  >(new Map());
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerPoolRef = useRef<WorkerPool | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: isMobile ? { distance: 9999 } : undefined,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.matchMedia("(max-width: 640px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (USE_WORKERS) {
      workerPoolRef.current = new WorkerPool({ maxWorkers: 3 });
    }
    return () => {
      workerPoolRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        fileInputRef.current?.click();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (selectedFiles.length > 0 && !isConverting) {
          document.getElementById("convert-button")?.click();
        }
      }

      if (e.key === "Escape") {
        if (selectedFiles.length > 0 || convertedFiles.length > 0) {
          setSelectedFiles([]);
          setConvertedFiles([]);
          setConversionProgress(new Map());
          setError(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFiles, convertedFiles, isConverting]);

  const handleFilesSelected = (files: File[]) => {
    const filesWithIds = files.map((file) =>
      Object.assign(file, { id: crypto.randomUUID() }),
    ) as FileWithId[];
    setSelectedFiles((prev) => [...prev, ...filesWithIds]);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
      type === "image"
        ? "png"
        : type === "audio"
          ? "mp3"
          : type === "video"
            ? "mp4"
            : type === "document"
              ? "pdf"
              : "zip",
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

    try {
      const converted: ConvertedFile[] = [];

      if (USE_WORKERS && workerPoolRef.current) {
        const conversionPromises = selectedFiles.map(async (file, index) => {
          try {
            progressMap.set(file.name, {
              fileName: file.name,
              progress: 0,
              status: "converting",
            });
            setConversionProgress(new Map(progressMap));

            const blob = await workerPoolRef.current!.convert(
              {
                id: `${file.name}-${file.size}-${Date.now()}-${index}`,
                file,
                outputFormat,
                quality: quality / 100,
                conversionType,
              },
              (progress) => {
                progressMap.set(file.name, {
                  fileName: file.name,
                  progress,
                  status: "converting",
                });
                setConversionProgress(new Map(progressMap));
              },
            );

            progressMap.set(file.name, {
              fileName: file.name,
              progress: 100,
              status: "completed",
            });
            setConversionProgress(new Map(progressMap));

            return { originalFile: file, convertedBlob: blob, outputFormat };
          } catch (err) {
            progressMap.set(file.name, {
              fileName: file.name,
              progress: 0,
              status: "error",
              error: err instanceof Error ? err.message : "Conversion failed",
            });
            setConversionProgress(new Map(progressMap));
            console.error(`Error converting ${file.name}:`, err);
            return null;
          }
        });

        const results = await Promise.all(conversionPromises);
        converted.push(
          ...results.filter((r): r is ConvertedFile => r !== null),
        );
      } else {
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
      }

      setConvertedFiles(converted);
    } catch (err) {
      console.error("Batch conversion error:", err);
      setError("An unexpected error occurred during batch conversion.");
    } finally {
      setIsConverting(false);
    }
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

  const downloadAll = async () => {
    const files = convertedFiles.map((file) => {
      const originalName = file.originalFile.name
        .split(".")
        .slice(0, -1)
        .join(".");
      return {
        name: `${originalName}.${file.outputFormat}`,
        blob: file.convertedBlob,
      };
    });

    const zipBlob = await createZipFromFiles(files);
    downloadZip(zipBlob, generateZipFilename());
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <OfflineIndicator />
      <InstallPrompt />
      <Header />

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-16">
        <div className="max-w-5xl mx-auto space-y-10 md:space-y-16">
          {error && (
            <div className="border-2 border-destructive bg-destructive/10 p-5 flex items-start gap-4 animate-slideDown">
              <AlertCircle className="size-6 text-destructive shrink-0 mt-0.5" />
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

          <div className="space-y-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Select Category
            </h2>
            <ConversionSelector
              value={conversionType}
              onChange={handleConversionTypeChange}
            />
          </div>

          <div className="space-y-8">
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

          <div className="space-y-8">
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
            <div className="space-y-8">
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedFiles.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="divide-y-2 divide-border">
                      {selectedFiles.map((file, index) => {
                        const progress = conversionProgress.get(file.name);
                        return (
                          <DraggableFileItem
                            key={file.id}
                            file={file}
                            index={index}
                            conversionType={conversionType}
                            progress={progress}
                            onRemove={removeFile}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
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
            <div className="space-y-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Converted Files ({convertedFiles.length})
              </h2>
              <div className="border-2 border-border bg-background">
                <div className="divide-y-2 divide-border">
                  {convertedFiles.map((file, index) => (
                    <ConvertedFileItem
                      key={index}
                      originalFile={file.originalFile}
                      convertedBlob={file.convertedBlob}
                      outputFormat={file.outputFormat}
                      onDownload={() => downloadFile(file)}
                    />
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
