import { formatBytes } from "@/lib/utils";
import { AlertCircle, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  ConversionSelector,
  type ConversionType,
} from "./components/conversion-selector";
import { FilePreview } from "./components/file-preview";
import { FileUploadZone } from "./components/file-upload-zone";
import { Header } from "./components/header";
import { Button } from "./components/ui/button";

export default function App() {
  const [conversionType, setConversionType] = useState<ConversionType>("image");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
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
              onChange={setConversionType}
            />
          </div>

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
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 group hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <FilePreview
                          file={file}
                          conversionType={conversionType}
                        />
                        <div>
                          <p className="text-sm font-bold uppercase tracking-tight">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 border-2 border-transparent hover:border-destructive hover:text-destructive transition-all"
                      >
                        <Trash2 className="size-4" />
                      </button>
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
