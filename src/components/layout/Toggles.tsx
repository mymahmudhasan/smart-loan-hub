import { useTheme } from "@/context/theme";
import { useLanguage } from "@/context/language";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Languages } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();
  return (
    <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-1.5 font-semibold">
      <Languages className="h-4 w-4" />
      {lang === "en" ? "বাংলা" : "EN"}
    </Button>
  );
}
