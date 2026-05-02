import { CheckCircle2, LayoutList } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DynamicIntelligencePreview } from "@/components/dynamic-intelligence-preview";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-full bg-white relative overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="flex h-full w-full flex-col lg:flex-row">
        
        {/* LEFT SIDE (60%): Dark Branding & Features */}
        <div className="relative hidden w-[60%] flex-col justify-between bg-[#0B0B0F] p-16 lg:flex overflow-hidden border-r border-white/5">
          {/* Animated Mesh/Grid Background */}
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]" />
             <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h32v32H0V0zm1 1h30v30H1V1z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")", backgroundSize: "32px 32px" }} />
             <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" />
             <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:rotate-1">
                <LayoutList className="h-5.5 w-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white leading-none">TeamOps</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em] mt-1.5">Enterprise Control</span>
              </div>
            </Link>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-bold text-indigo-300 uppercase tracking-[0.15em] mb-8">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              v2.4.0 • Now with AI Insights
            </div>
            <h1 className="text-7xl font-[900] tracking-tighter text-white leading-[0.95] mb-6">
              Manage Tasks.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-500">Ship Faster.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-md mb-12">
              The high-velocity command center for modern engineering teams.
            </p>

            {/* Premium Project Intelligence Preview */}
            <DynamicIntelligencePreview />
          </div>

          <div className="relative z-10 flex items-center gap-10">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-[#0B0B0F] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-xl ring-1 ring-white/10 overflow-hidden relative">
                    <Image 
                      src={`https://i.pravatar.cc/100?img=${i + 20}`} 
                      alt="User Avatar" 
                      fill
                      className="object-cover transition-all duration-500 hover:scale-110"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-black text-white tracking-tight">Trusted by 500+ teams</p>
                <div className="flex items-center gap-1 mt-0.5">
                   {[1, 2, 3, 4, 5].map((i) => (
                     <svg key={i} className="h-2.5 w-2.5 text-indigo-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (40%): Auth Card */}
        <div className="flex flex-1 flex-col bg-[#F8F9FB] relative overflow-hidden h-full">
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[80px]" />
          </div>

          <div className="flex flex-col h-full z-10">
            {/* Header / Nav */}
            <div className="p-8 lg:p-12 flex items-center justify-between lg:justify-end">
              <Link href="/" className="flex items-center gap-2.5 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                  <LayoutList className="h-4.5 w-4.5" />
                </div>
                <span className="text-lg font-black tracking-tighter text-slate-900 leading-none">TeamOps</span>
              </Link>
              <div className="flex items-center gap-6">
                <Link href="#" className="text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Docs</Link>
                <Link href="#" className="text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Support</Link>
              </div>
            </div>

            {/* Main Center */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-8">
              <div className="w-full max-w-[440px]">
                {children}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 lg:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-[10px] font-bold text-slate-400 tracking-tight text-center sm:text-left">
                © 2025 TeamOps Platform. Engineering Excellence.
              </p>
              <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shortcut:</span>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-0.5 rounded-md border border-slate-300 bg-slate-50 text-[10px] font-black text-slate-600 shadow-[0_1px_0_rgba(0,0,0,0.1)]">Enter</kbd>
                  <span className="text-[9px] font-bold text-slate-400">to continue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
