import { HelpCircle, Book, MessageSquare, Zap, ChevronRight, Search, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HelpPage() {
  const categories = [
    { title: "Core Fundamentals", icon: Book, description: "Master the basic architecture of TeamOps workspace.", count: 12 },
    { title: "Workflow Acceleration", icon: Zap, description: "Advanced patterns for high-velocity project management.", count: 8 },
    { title: "Collaborative Protocols", icon: MessageSquare, description: "Managing team dimensions and communication flows.", count: 5 },
  ];

  const faqs = [
    { q: "How do I calibrate task priority?", a: "Priority is determined by the intersection of deadline velocity and strategic impact. Use the priority matrix in the task creation panel." },
    { q: "Can I automate operational logs?", a: "Yes, operational logs are automatically generated for every dimensional modification within the workspace." },
    { q: "How are notifications dispatched?", a: "Dispatches are synchronized across email, desktop, and system channels based on your sync settings." },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-6">
        <div className="h-20 w-20 rounded-[32px] bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200">
          <HelpCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Intelligence Base</h1>
          <p className="text-slate-500 text-xl font-medium">Navigational support for the TeamOps ecosystem.</p>
        </div>
        <div className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search intelligence..." 
            className="w-full pl-16 pr-8 py-6 rounded-[32px] bg-white border border-slate-200 text-lg font-bold shadow-sm focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.title} className="group rounded-[48px] border border-slate-200/60 bg-white p-10 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
            <div className="h-14 w-14 rounded-[24px] bg-slate-50 text-indigo-600 flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
              <cat.icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{cat.title}</h3>
            <p className="text-slate-500 text-sm font-medium mt-3 leading-relaxed">{cat.description}</p>
            <div className="flex items-center justify-between mt-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.count} Artifacts</span>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[56px] bg-slate-900 p-12 lg:p-20 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <PlayCircle className="h-96 w-96" />
        </div>
        <div className="relative z-10 grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tight leading-tight">Fast-Track Your Workspace Integration</h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">Watch our sophisticated sequence on mastering the TeamOps interface in under 180 seconds.</p>
            <button className="flex items-center gap-4 px-10 py-5 rounded-[24px] bg-white text-slate-900 text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
              <PlayCircle className="h-5 w-5" />
              Launch Sequence
            </button>
          </div>
          <div className="rounded-[40px] bg-white/5 border border-white/10 p-10 backdrop-blur-xl space-y-8">
            <h3 className="text-xl font-black tracking-tight border-b border-white/10 pb-6">Common Protocols</h3>
            {faqs.map((faq) => (
              <div key={faq.q} className="space-y-2">
                <p className="font-bold text-white text-sm">{faq.q}</p>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
