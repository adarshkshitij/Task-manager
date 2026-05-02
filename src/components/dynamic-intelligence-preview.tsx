"use client";

import { useEffect, useState } from "react";
import { LayoutList, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function DynamicIntelligencePreview() {
  const [velocity, setVelocity] = useState(72);
  const [activeInsight, setActiveInsight] = useState(0);
  const [isLive, setIsLive] = useState(false);

  const insights = [
    "Sprint efficiency up 12.4%",
    "4 active pull requests pending",
    "Deployment cycle: Stable",
    "Team bandwidth at 85%",
    "Zero critical blockers detected"
  ];

  useEffect(() => {
    setIsLive(true);
    const velocityInterval = setInterval(() => {
      setVelocity(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newVal = prev + change;
        return newVal > 95 ? 95 : newVal < 60 ? 60 : newVal;
      });
    }, 2000);

    const insightInterval = setInterval(() => {
      setActiveInsight(prev => (prev + 1) % insights.length);
    }, 4000);

    return () => {
      clearInterval(velocityInterval);
      clearInterval(insightInterval);
    };
  }, []);

  return (
    <div className="relative group/preview max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] -z-10 group-hover/preview:bg-indigo-500/20 transition-all duration-700" />
      
      {/* Main Card */}
      <div className="bg-[#121217]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transition-all duration-700 group-hover/preview:translate-y-[-4px] group-hover/preview:border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 relative">
              <LayoutList className="h-4 w-4 text-indigo-400" />
              {isLive && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 border-2 border-[#121217] animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-white uppercase tracking-wider">Project Intel</span>
                <span className="text-[8px] font-bold text-indigo-400/80 px-1.5 py-0.5 rounded bg-indigo-500/5 border border-indigo-500/10 uppercase tracking-widest">Live</span>
              </div>
              <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500/40 rounded-full animate-shimmer" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
          
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-6 w-6 rounded-full border-2 border-[#121217] bg-slate-800 ring-1 ring-white/5 flex items-center justify-center overflow-hidden">
                 <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Insight Ticker */}
        <div className="mb-6 px-1 h-8 flex items-center overflow-hidden">
           <div 
             key={activeInsight} 
             className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 animate-in slide-in-from-bottom-2 fade-in duration-500"
           >
              <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="truncate uppercase tracking-tight">{insights[activeInsight]}</span>
           </div>
        </div>

        {/* Dynamic Velocity Chart */}
        <div className="space-y-4">
           <div className="flex items-end gap-1.5 h-16 justify-between px-1">
              {[40, 65, 45, 90, 55, 75, 60, 85].map((h, i) => {
                // Calculate an animated height based on velocity
                const adjustedHeight = Math.min(100, Math.max(10, h * (velocity / 80)));
                return (
                  <div key={i} className="w-full mx-[1px] bg-indigo-500/10 rounded-t-sm relative group/bar cursor-default overflow-hidden">
                     <div 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm transition-all duration-1000 ease-in-out group-hover/bar:from-indigo-400 group-hover/bar:to-blue-400" 
                        style={{ height: `${adjustedHeight}%` }} 
                     />
                     <div className="absolute inset-0 opacity-0 group-hover/bar:opacity-100 bg-white/10 transition-opacity" />
                  </div>
                );
              })}
           </div>
           
           <div className="flex justify-between items-center text-[10px] font-black pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-slate-500 uppercase tracking-[0.2em]">
                <Zap className="h-3 w-3 text-amber-500" />
                <span>Velocity Index</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-[1000] tabular-nums tracking-wider">+{velocity}%</span>
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              </div>
           </div>
        </div>

        {/* AI Insight Overlay (Visible on Hover) */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[200px] opacity-0 group-hover/preview:opacity-100 group-hover/preview:-bottom-12 transition-all duration-500 pointer-events-none">
           <div className="bg-white rounded-lg p-2.5 shadow-2xl border border-slate-200 text-center">
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">AI Status: Peak Performance</p>
           </div>
        </div>
      </div>
    </div>
  );
}
