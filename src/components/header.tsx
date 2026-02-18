import { RefreshCw } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 md:px-6 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center transition-transform hover:rotate-180 duration-500">
              <RefreshCw className="size-6 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">CONVERT</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
