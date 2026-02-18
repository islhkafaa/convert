import { useTheme } from "@/contexts/theme-context";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="size-5 transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="size-5 transition-transform duration-300 rotate-0 scale-100" />
      )}
    </Button>
  );
}
