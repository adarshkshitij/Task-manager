"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ThemeOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

interface ThemeSelectorProps {
  options: ThemeOption[];
  initialTheme: string;
}

export function ThemeSelector({ options, initialTheme }: ThemeSelectorProps) {
  const [activeTheme, setActiveTheme] = useState(initialTheme);

  const handleThemeChange = async (themeId: string) => {
    if (themeId === activeTheme) return;
    
    const prevTheme = activeTheme;
    setActiveTheme(themeId);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: themeId }),
      });

      if (!res.ok) throw new Error("Failed to update theme");
      
      toast.success(`Theme switched to ${themeId}`);
      // In a real app, we might also update a cookie or a local state to trigger CSS changes
    } catch (error) {
      setActiveTheme(prevTheme);
      toast.error("Failed to update theme preference");
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = activeTheme === option.id;
        
        return (
          <div 
            key={option.id}
            onClick={() => handleThemeChange(option.id)}
            className={cn(
              "p-6 rounded-3xl border transition-all duration-500 cursor-pointer relative overflow-hidden",
              isActive 
                ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10" 
                : "bg-slate-50/30 border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-1"
            )}
          >
            {option.badge && (
              <span className="absolute top-4 right-4 text-[8px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full tracking-widest">
                {option.badge}
              </span>
            )}
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm",
              isActive ? "bg-indigo-600 text-white" : "bg-white text-slate-400"
            )}>
              <Icon className="h-6 w-6" />
            </div>
            <h4 className={cn("text-sm font-black uppercase tracking-tight mb-2", isActive ? "text-indigo-900" : "text-slate-900")}>
              {option.title}
            </h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">{option.description}</p>
          </div>
        );
      })}
    </div>
  );
}
