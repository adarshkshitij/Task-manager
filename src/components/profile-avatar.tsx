"use client";

import { Camera } from "lucide-react";
import { toast } from "sonner";

interface ProfileAvatarProps {
  initials: string;
}

export function ProfileAvatar({ initials }: ProfileAvatarProps) {
  const handlePhotoChange = () => {
    toast.info("Image upload functionality is coming soon.");
  };

  return (
    <div className="relative group">
      <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-indigo-600 border-4 border-white/10 flex items-center justify-center text-white text-5xl md:text-6xl font-black shadow-2xl overflow-hidden relative">
        {initials}
        <div 
          onClick={handlePhotoChange}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        >
          <Camera className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-emerald-500 border-4 border-slate-950 flex items-center justify-center shadow-lg" title="Online">
        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
      </div>
    </div>
  );
}
