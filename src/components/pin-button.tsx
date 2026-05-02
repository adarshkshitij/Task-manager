"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface PinButtonProps {
  projectId: string;
  initialPinned: boolean;
}

export function PinButton({ projectId, initialPinned }: PinButtonProps) {
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/pin`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsPinned(data.pinned);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "p-2 rounded-xl transition-all duration-300",
        isPinned 
          ? "text-amber-500 bg-amber-50 hover:bg-amber-100" 
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
      )}
      title={isPinned ? "Unpin from Quick Access" : "Pin to Quick Access"}
    >
      <Star 
        className={cn(
          "h-5 w-5 transition-transform duration-300",
          isPinned ? "fill-amber-500 scale-110" : "scale-100",
          isLoading && "animate-pulse"
        )} 
      />
    </button>
  );
}
