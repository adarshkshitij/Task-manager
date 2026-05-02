"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CreateTaskForm } from "./create-task-form";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/projects");
          if (res.ok) {
            const data = await res.json();
            setProjects(data);
          }
        } catch (error) {
          console.error("Failed to fetch projects:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[40px] bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-300 ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <div className="absolute top-0 right-0 p-6 z-20">
          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50/50 text-slate-400 backdrop-blur-sm transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-2 scrollbar-hide">
          <div className="p-6 pt-10">
            <CreateTaskForm 
              projects={projects} 
              onSuccess={() => {
                setTimeout(() => {
                  onClose();
                }, 1000);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
