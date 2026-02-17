import { RefreshCw } from "lucide-react";

export function Header() {
  return (
    <header className="border-b-2 border-border bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <RefreshCw className="size-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">CONVERT</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
