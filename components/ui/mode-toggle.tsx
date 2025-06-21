"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isSpinning, setIsSpinning] = React.useState(false);

  // Čeka da se komponenta mount-uje da bi izbegao hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handler koji toggluje light/dark sa spinning icon animacijom
  const toggleTheme = () => {
    // INSTANT tema change - bez delay-a
    setTheme(theme === "dark" ? "light" : "dark");
    
    // Pokreće spinning animaciju
    setIsSpinning(true);
    
    // Završava spinning - kraća animacija
    setTimeout(() => {
      setIsSpinning(false);
    }, 400); // Skraćeno sa 600ms na 400ms
  };

  // Loading state da izbegne hydration issues
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="relative">
        <div className="h-[1.2rem] w-[1.2rem] bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
        <span className="sr-only">Loading theme toggle</span>
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      disabled={isSpinning}
      className={cn(
        "relative overflow-hidden transition-all duration-200 ease-in-out transform",
        "hover:scale-110 active:scale-95 disabled:scale-100",
        "border-2 shadow-sm hover:shadow-lg",
        "group focus:outline-none focus:ring-2 focus:ring-offset-2",
        isSpinning && "cursor-wait",
        isDark 
          ? "bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-slate-500 focus:ring-slate-400" 
          : "bg-white border-gray-300 hover:bg-yellow-50 hover:border-yellow-300 focus:ring-yellow-400"
      )}
      suppressHydrationWarning
    >
      {/* Background glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-md transition-all duration-300 ease-in-out opacity-50",
          isDark 
            ? "bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-slate-800/30" 
            : "bg-gradient-to-br from-yellow-200/40 via-orange-200/40 to-amber-200/40"
        )}
      />
      
      {/* Icon Container - perfectly centered */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun ikonica za light mode */}
        <Sun
          className={cn(
            "h-[1.2rem] w-[1.2rem] text-yellow-600 transition-all duration-300 ease-in-out",
            "drop-shadow-sm absolute",
            // Show/hide based on theme
            isDark ? "opacity-0 scale-0" : "opacity-100 scale-100",
            // Spinning animation
            isSpinning && !isDark && "animate-icon-spin",
            // Hover animation when not spinning
            !isSpinning && !isDark && "group-hover:animate-sun-rotate"
          )}
          style={{
            filter: !isDark && !isSpinning ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))" : undefined,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Moon ikonica za dark mode */}
        <Moon
          className={cn(
            "h-[1.2rem] w-[1.2rem] text-blue-300 transition-all duration-300 ease-in-out",
            "drop-shadow-sm absolute",
            // Show/hide based on theme
            !isDark ? "opacity-0 scale-0" : "opacity-100 scale-100",
            // Spinning animation
            isSpinning && isDark && "animate-icon-spin",
            // Hover animation when not spinning
            !isSpinning && isDark && "group-hover:animate-moon-rotate"
          )}
          style={{
            filter: isDark && !isSpinning ? "drop-shadow(0 0 8px rgba(147, 197, 253, 0.6))" : undefined,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>

      {/* Orbital particles tokom spinning-a */}
      {isSpinning && (
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 h-1 rounded-full animate-orbit",
                isDark ? "bg-blue-300" : "bg-yellow-500"
              )}
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-14px)`,
                animationDelay: `${i * 150}ms`,
                animationDuration: '600ms'
              }}
            />
          ))}
        </div>
      )}

      {/* Static floating particles kada nije spinning */}
      {mounted && !isSpinning && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md">
          {isDark ? (
            // Zvezde za dark mode
            <>
              <div 
                className="absolute w-0.5 h-0.5 bg-blue-200 rounded-full opacity-60 animate-twinkle"
                style={{ 
                  top: '20%', 
                  left: '25%', 
                  animationDelay: '0s',
                  animationDuration: '2s'
                }}
              />
              <div 
                className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-80 animate-twinkle"
                style={{ 
                  top: '70%', 
                  right: '20%', 
                  animationDelay: '1s',
                  animationDuration: '3s'
                }}
              />
              <div 
                className="absolute w-0.5 h-0.5 bg-blue-100 rounded-full opacity-40 animate-twinkle"
                style={{ 
                  bottom: '30%', 
                  left: '70%', 
                  animationDelay: '0.5s',
                  animationDuration: '2.5s'
                }}
              />
            </>
          ) : (
            // Sunčevi zraci za light mode
            <>
              <div 
                className="absolute w-3 h-3 bg-yellow-200 rounded-full opacity-30 animate-pulse"
                style={{ 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  animationDuration: '2s'
                }}
              />
            </>
          )}
        </div>
      )}

      <span className="sr-only">
        {isSpinning 
          ? "Menjam temu..." 
          : isDark 
            ? "Prebaci na svetlu temu" 
            : "Prebaci na tamnu temu"
        }
      </span>
    </Button>
  );
}

// Alternativna verzija sa još dramatičnijom spinning animacijom
export function ModeToggleSpinIcon() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isSpinning, setIsSpinning] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // INSTANT tema change - bez delay-a
    setTheme(theme === "dark" ? "light" : "dark");
    
    // Pokreće spinning animaciju
    setIsSpinning(true);
    
    // Završava spinning - kraća animacija
    setTimeout(() => {
      setIsSpinning(false);
    }, 500); // Skraćeno sa 1000ms na 500ms
  };

  if (!mounted) {
    return (
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      disabled={isSpinning}
      className={cn(
        "relative w-12 h-12 rounded-full transition-all duration-200 ease-in-out transform",
        "hover:scale-110 active:scale-95 disabled:scale-100",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "shadow-lg hover:shadow-xl border-2",
        isSpinning && "cursor-wait",
        isDark 
          ? "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600" 
          : "bg-gradient-to-br from-yellow-300 to-orange-400 border-yellow-300"
      )}
      suppressHydrationWarning
    >
      {/* Main rotating icon - perfectly centered with explicit positioning */}
      <div className="relative w-full h-full">
        {isDark ? (
          <Moon
            className={cn(
              "h-7 w-7 text-blue-300 transition-all duration-300 ease-in-out absolute",
              isSpinning 
                ? "animate-moon-spin-dramatic" 
                : "group-hover:animate-moon-wobble"
            )}
            style={{
              filter: !isSpinning ? "drop-shadow(0 0 10px rgba(147, 197, 253, 0.7))" : undefined,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ) : (
          <Sun
            className={cn(
              "h-7 w-7 text-yellow-800 transition-all duration-300 ease-in-out absolute",
              isSpinning 
                ? "animate-sun-spin-dramatic" 
                : "group-hover:animate-sun-wobble"
            )}
            style={{
              filter: !isSpinning ? "drop-shadow(0 0 10px rgba(251, 191, 36, 0.7))" : undefined,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </div>

      {/* Spinning trail effect */}
      {isSpinning && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 h-1 rounded-full opacity-60",
                isDark ? "bg-blue-400" : "bg-yellow-600"
              )}
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-18px)`,
                animation: `trail-${i} 1000ms ease-out`,
                animationDelay: `${i * 50}ms`
              }}
            />
          ))}
        </div>
      )}

      <span className="sr-only">
        {isSpinning 
          ? "Menjam temu..." 
          : isDark 
            ? "Prebaci na svetlu temu" 
            : "Prebaci na tamnu temu"
        }
      </span>
    </button>
  );
}

// Export default kao glavnu komponentu
export default ModeToggle;