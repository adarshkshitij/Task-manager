"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { UpdatePasswordForm } from "./update-password-form";
import { toast } from "sonner";

export function SecuritySettings() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handle2FA = () => {
    toast.info("Two-Factor Authentication is a premium feature coming soon.");
  };

  return (
    <>
      <section className="rounded-[40px] border border-slate-200/60 bg-white p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4 mb-8">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Integrity Check</h2>
        </div>
        
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Password Security</p>
            <p className="text-xs font-bold text-slate-600 leading-relaxed mb-4">Protect your account by rotating your secret key regularly.</p>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full py-3 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-sm"
            >
              Update Password
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Two-Factor Auth</p>
            <button 
              onClick={handle2FA}
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100"
            >
              Enable Security
            </button>
          </div>
        </div>
      </section>

      {isPasswordModalOpen && (
        <UpdatePasswordForm onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </>
  );
}
