// components/ui/mode-toggle.tsx - COMPLETELY FIXED VERSION
"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useSettings } from "@/lib/settings-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();
  const { settings } = useSettings();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render if dark mode is not enabled in settings
  if (!settings?.themeDarkMode || !mounted) {
    return null;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative h-9 w-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
        >
          {/* Sun icon for light mode */}
          <Sun
            className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
              resolvedTheme === "dark" 
                ? "scale-0 rotate-90 opacity-0 absolute" 
                : "scale-100 rotate-0 opacity-100"
            }`}
          />
          {/* Moon icon for dark mode */}
          <Moon
            className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
              resolvedTheme === "dark" 
                ? "scale-100 rotate-0 opacity-100" 
                : "scale-0 rotate-90 opacity-0 absolute"
            }`}
          />
          <span className="sr-only">Промени тему</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[140px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`cursor-pointer ${
            theme === "light" 
              ? "bg-gray-100 dark:bg-gray-700 text-primary-dynamic font-semibold" 
              : "hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Светла</span>
          {theme === "light" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary-dynamic" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`cursor-pointer ${
            theme === "dark" 
              ? "bg-gray-100 dark:bg-gray-700 text-primary-dynamic font-semibold" 
              : "hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Тамна</span>
          {theme === "dark" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary-dynamic" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`cursor-pointer ${
            theme === "system" 
              ? "bg-gray-100 dark:bg-gray-700 text-primary-dynamic font-semibold" 
              : "hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Систем</span>
          {theme === "system" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary-dynamic" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple toggle version (alternative)
export function SimpleToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { settings } = useSettings();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!settings?.themeDarkMode || !mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="relative h-9 w-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          resolvedTheme === "dark" 
            ? "scale-0 rotate-90 opacity-0 absolute" 
            : "scale-100 rotate-0 opacity-100"
        }`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          resolvedTheme === "dark" 
            ? "scale-100 rotate-0 opacity-100" 
            : "scale-0 rotate-90 opacity-0 absolute"
        }`}
      />
      <span className="sr-only">Промени тему</span>
    </Button>
  );
}