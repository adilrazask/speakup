"use client";

import React from "react";
import { Moon, Sun, Volume2, ShieldCheck, Globe } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { settings, toggleTheme, stopSpeaking, isSpeaking } = useSettings();
  const { profile } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="pl-10 md:pl-0">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Voice indicator */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 text-xs font-medium animate-pulse"
            title="Click to stop voice playback"
          >
            <Volume2 size={14} />
            <span>Speaking...</span>
          </button>
        )}

        {/* Target role pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Globe size={13} className="text-indigo-400" />
          <span>Role: {profile?.target_role || "Operations"}</span>
        </div>

        {/* Accent Tag */}
        <span className="hidden lg:inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          en-IN Accent
        </span>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          aria-label="Toggle theme"
        >
          {settings.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
