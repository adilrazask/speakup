"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  HelpCircle,
  Briefcase,
  Layers,
  Mic,
  BookOpen,
  Edit3,
  BarChart2,
  Settings,
  Sparkles,
  Menu,
  X,
  Volume2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { name: "Talk (Coach)", href: "/talk", icon: MessageSquare, badge: "Live" },
  { name: "Ask (Q&A)", href: "/ask", icon: HelpCircle },
  { name: "Mock Interview", href: "/interview", icon: Briefcase },
  { name: "Answer Builder", href: "/builder", icon: Layers },
  { name: "Pronunciation Lab", href: "/pronunciation", icon: Mic },
  { name: "Vocabulary & Cards", href: "/vocabulary", icon: BookOpen },
  { name: "Writing Corrector", href: "/writing", icon: Edit3 },
  { name: "Progress & Stats", href: "/progress", icon: BarChart2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white shadow-md border border-slate-700"
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-40 transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo and Brand */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Sparkles size={22} />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  SpeakUp
                  <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30">
                    AI
                  </span>
                </h1>
                <p className="text-xs text-slate-400">English & Interview Coach</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    active
                      ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={active ? "text-indigo-400" : "text-slate-400"} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Summary Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-indigo-400">
              {profile?.full_name ? profile.full_name[0] : "K"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {profile?.full_name || "Kiran Kumar"}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[11px] text-indigo-300 font-mono">
                  {profile?.current_cefr_level || "B1"}
                </span>
                <span className="truncate">{profile?.target_role || "Operations"}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
