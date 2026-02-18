import type { ImageOptions } from "@/lib/image-processor";
import {
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface AdvancedImageOptionsProps {
  options: ImageOptions;
  onChange: (options: ImageOptions) => void;
}

export function AdvancedImageOptions({
  options,
  onChange,
}: AdvancedImageOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateOptions = (updates: Partial<ImageOptions>) => {
    onChange({ ...options, ...updates });
  };

  const handleRotate = () => {
    const currentRotation = options.rotate || 0;
    const newRotation = ((currentRotation + 90) % 360) as 0 | 90 | 180 | 270;
    updateOptions({ rotate: newRotation });
  };

  const handleFlipHorizontal = () => {
    updateOptions({
      flip: {
        ...options.flip,
        horizontal: !options.flip?.horizontal,
      },
    });
  };

  const handleFlipVertical = () => {
    updateOptions({
      flip: {
        ...options.flip,
        vertical: !options.flip?.vertical,
      },
    });
  };

  const handleReset = () => {
    onChange({});
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-2 uppercase tracking-widest text-xs h-12 border-2"
      >
        <Settings2 className="size-4" />
        Advanced Settings
      </Button>
    );
  }

  return (
    <div className="border-2 border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-muted/50 border-b-2 border-border">
        <div className="flex items-center gap-2">
          <Settings2 className="size-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            Advanced Controls
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-[10px] uppercase tracking-wider h-8 px-2"
          >
            <RotateCcw className="size-3 mr-1" />
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-[10px] uppercase tracking-wider h-8 px-2"
          >
            Collapse
          </Button>
        </div>
      </div>

      <Accordion type="multiple" className="px-4">
        <AccordionItem
          value="resize"
          className="border-b-2 border-border/50 last:border-0"
        >
          <AccordionTrigger className="text-[10px] font-black uppercase tracking-widest hover:no-underline py-4">
            Dimensions
          </AccordionTrigger>
          <AccordionContent className="pb-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">
                  Width (px)
                </Label>
                <Input
                  type="number"
                  value={options.resize?.width || ""}
                  onChange={(e) =>
                    updateOptions({
                      resize: {
                        ...options.resize,
                        width: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  className="h-10 border-2 font-mono text-xs focus-visible:ring-primary"
                  placeholder="Auto"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">
                  Height (px)
                </Label>
                <Input
                  type="number"
                  value={options.resize?.height || ""}
                  onChange={(e) =>
                    updateOptions({
                      resize: {
                        ...options.resize,
                        height: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  className="h-10 border-2 font-mono text-xs focus-visible:ring-primary"
                  placeholder="Auto"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="aspect-ratio"
                checked={options.resize?.maintainRatio ?? true}
                onCheckedChange={(checked) =>
                  updateOptions({
                    resize: {
                      ...options.resize,
                      maintainRatio: !!checked,
                    },
                  })
                }
                className="border-2"
              />
              <Label
                htmlFor="aspect-ratio"
                className="text-[10px] uppercase font-bold cursor-pointer"
              >
                Lock Aspect Ratio
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="transform"
          className="border-b-2 border-border/50 last:border-0"
        >
          <AccordionTrigger className="text-[10px] font-black uppercase tracking-widest hover:no-underline py-4">
            Orientation
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="flex flex-col gap-1.5 h-auto py-3 border-2 hover:bg-primary/5 hover:border-primary/50 group"
              >
                <RotateCw className="size-4 group-active:rotate-90 transition-transform" />
                <span className="text-[9px] font-bold uppercase">Rotate</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFlipHorizontal}
                className={`flex flex-col gap-1.5 h-auto py-3 border-2 transition-all ${
                  options.flip?.horizontal
                    ? "bg-primary/10 border-primary text-primary"
                    : "hover:bg-primary/5 hover:border-primary/50"
                }`}
              >
                <FlipHorizontal className="size-4" />
                <span className="text-[9px] font-bold uppercase">Flip H</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFlipVertical}
                className={`flex flex-col gap-1.5 h-auto py-3 border-2 transition-all ${
                  options.flip?.vertical
                    ? "bg-primary/10 border-primary text-primary"
                    : "hover:bg-primary/5 hover:border-primary/50"
                }`}
              >
                <FlipVertical className="size-4" />
                <span className="text-[9px] font-bold uppercase">Flip V</span>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="filters"
          className="border-b-2 border-border/50 last:border-0 font-bold uppercase"
        >
          <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest hover:no-underline py-4">
            Adjustments
          </AccordionTrigger>
          <AccordionContent className="pb-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="grayscale"
                  checked={options.filters?.grayscale || false}
                  onCheckedChange={(checked) =>
                    updateOptions({
                      filters: {
                        ...options.filters,
                        grayscale: !!checked,
                      },
                    })
                  }
                  className="border-2"
                />
                <Label
                  htmlFor="grayscale"
                  className="text-[10px] uppercase font-bold cursor-pointer"
                >
                  Grayscale
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sepia"
                  checked={options.filters?.sepia || false}
                  onCheckedChange={(checked) =>
                    updateOptions({
                      filters: {
                        ...options.filters,
                        sepia: !!checked,
                      },
                    })
                  }
                  className="border-2"
                />
                <Label
                  htmlFor="sepia"
                  className="text-[10px] uppercase font-bold cursor-pointer"
                >
                  Sepia
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">
                    Brightness
                  </Label>
                  <span className="text-[10px] font-mono font-bold text-primary">
                    {options.filters?.brightness || 0}%
                  </span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[options.filters?.brightness || 0]}
                  onValueChange={([val]) =>
                    updateOptions({
                      filters: {
                        ...options.filters,
                        brightness: val,
                      },
                    })
                  }
                  className="py-1"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">
                    Contrast
                  </Label>
                  <span className="text-[10px] font-mono font-bold text-primary">
                    {options.filters?.contrast || 0}%
                  </span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[options.filters?.contrast || 0]}
                  onValueChange={([val]) =>
                    updateOptions({
                      filters: {
                        ...options.filters,
                        contrast: val,
                      },
                    })
                  }
                  className="py-1"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">
                    Blur
                  </Label>
                  <span className="text-[10px] font-mono font-bold text-primary">
                    {options.filters?.blur || 0}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[options.filters?.blur || 0]}
                  onValueChange={([val]) =>
                    updateOptions({
                      filters: {
                        ...options.filters,
                        blur: val,
                      },
                    })
                  }
                  className="py-1"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
