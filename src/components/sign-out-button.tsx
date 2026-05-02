"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function SignOutButton({ 
  className,
  showLabel = true 
}: { 
  className?: string;
  showLabel?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          void signOut({ callbackUrl: "/login" });
        });
      }}
      className={cn(
        "w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
      {showLabel && (isPending ? "Exiting..." : "Sign Out")}
    </button>
  );
}
