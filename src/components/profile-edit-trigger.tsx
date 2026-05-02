"use client";

import { useState } from "react";
import { EditProfileForm } from "./edit-profile-form";

interface ProfileEditTriggerProps {
  user: {
    name: string;
    email: string;
  };
}

export function ProfileEditTrigger({ user }: ProfileEditTriggerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mt-12 pt-8 border-t border-slate-100">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-2xl bg-slate-950 px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 shadow-lg"
        >
          Edit Profile Information
        </button>
      </div>

      {isModalOpen && (
        <EditProfileForm 
          user={user} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
