"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SettingsToggleProps {
  field: string;
  title: string;
  description: string;
  icon: React.ElementType;
  initialValue: boolean;
}

export function SettingsToggle({ field, title, description, icon: Icon, initialValue }: SettingsToggleProps) {
  const [checked, setChecked] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    const newValue = !checked;
    setChecked(newValue);
    setIsUpdating(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!res.ok) throw new Error("Failed to update setting");
      
      toast.success(`${title} updated`);
    } catch (error) {
      setChecked(!newValue); // Revert on failure
      toast.error("Failed to save changes");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-6 rounded-3xl border border-slate-100 bg-slate-50/30 group hover:border-indigo-200 hover:bg-white transition-all duration-300">
      <div className="flex gap-5">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
          {isUpdating ? <Loader2 className="h-5 w-5 animate-spin text-indigo-600" /> : <Icon className="h-5 w-5" />}
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900">{title}</h4>
          <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={handleToggle}
          disabled={isUpdating}
          className="sr-only peer" 
        />
        <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-indigo-600"></div>
      </label>
    </div>
  );
}
