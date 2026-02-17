import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Convert</h1>
          <p className="text-muted-foreground">
            Browser-native file conversion utility
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-3">Button Variants</h2>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Button Sizes</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 bg-background border-2 border-border"></div>
                <p className="text-sm">Background</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-primary"></div>
                <p className="text-sm">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-secondary"></div>
                <p className="text-sm">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-muted"></div>
                <p className="text-sm">Muted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
