import type { ConversionProgress } from "@/lib/converter";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, GripVertical, Trash2, X } from "lucide-react";
import { FilePreview } from "./file-preview";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface DraggableFileItemProps {
  file: File & { id: string };
  index: number;
  conversionType: string;
  progress?: ConversionProgress;
  onRemove: (index: number) => void;
}

export function DraggableFileItem({
  file,
  index,
  conversionType,
  progress,
  onRemove,
}: DraggableFileItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 group hover:bg-muted/50 transition-colors border-l-2 border-transparent hover:border-primary/30"
    >
      <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
        <button
          {...attributes}
          {...listeners}
          className="hidden sm:flex cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-5" />
        </button>

        <FilePreview file={file} conversionType={conversionType} />

        {progress && progress.status !== "pending" && (
          <div className="mt-2 text-[10px] font-mono">
            {progress.status === "converting" && (
              <div className="space-y-1">
                <Progress value={progress.progress} className="h-1" />
                <p className="text-muted-foreground">
                  {Math.round(progress.progress)}%
                </p>
              </div>
            )}
            {progress.status === "completed" && (
              <div className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="size-3" />
                <p>COMPLETED</p>
              </div>
            )}
            {progress.status === "error" && (
              <div className="flex items-center gap-1 text-destructive">
                <X className="size-3" />
                <p className="uppercase">{progress.error || "Error"}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        className="shrink-0"
        disabled={progress?.status === "converting"}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
