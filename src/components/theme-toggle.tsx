import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "system";

function applyTheme(t: Theme) {
  const dark =
    t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  useEffect(() => {
    const stored = (localStorage.getItem("uvu.theme") as Theme | null) ?? "system";
    setThemeState(stored);
    applyTheme(stored);
  }, []);
  const setTheme = (t: Theme) => {
    localStorage.setItem("uvu.theme", t);
    setThemeState(t);
    applyTheme(t);
  };
  return { theme, setTheme };
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark =
    mounted &&
    (theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches));
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4 opacity-0" aria-hidden />
      )}
    </Button>
  );
}

