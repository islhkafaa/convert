import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive border-b-2 border-destructive">
      <div className="container mx-auto px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <WifiOff className="size-5 text-destructive-foreground" />
          <div>
            <p className="text-sm font-bold uppercase tracking-tight text-destructive-foreground">
              Offline Mode
            </p>
            <p className="text-xs text-destructive-foreground/90">
              You can still convert files locally
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
