"use client";

import React, { useState, useEffect } from "react";
import { BarChart2, Flame, Clock, Award, TrendingUp, AlertTriangle } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { useAuth } from "../../context/AuthContext";

export default function ProgressPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    streak_days: 5,
    practice_minutes_total: 45,
    sessions_completed: 6,
    words_learned: 14,
    average_interview_score: 82,
    current_cefr: profile?.current_cefr_level || "B1",
    category_breakdown: {
      tense: 7,
      preposition: 4,
      collocation: 5,
      fluency: 3
    },
    top_mistakes: [
      { signature: "am having (instead of have)", category: "tense", count: 6 },
      { signature: "discuss about (instead of discuss)", category: "preposition", count: 4 },
      { signature: "revert back (instead of reply)", category: "collocation", count: 3 }
    ]
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Progress & Learning Analytics"
        subtitle="Track your practice streak, CEFR trajectory, recurring error categories, and interview scores"
      />

      <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-semibold text-slate-400 uppercase">Streak</span>
              <Flame size={18} />
            </div>
            <p className="text-2xl font-black text-white">{stats.streak_days} Days</p>
            <span className="text-[11px] text-emerald-400">🔥 Daily goal reached</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs font-semibold text-slate-400 uppercase">Spoken Minutes</span>
              <Clock size={18} />
            </div>
            <p className="text-2xl font-black text-white">{stats.practice_minutes_total}m</p>
            <span className="text-[11px] text-slate-400">{stats.sessions_completed} sessions</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-semibold text-slate-400 uppercase">CEFR Level</span>
              <TrendingUp size={18} />
            </div>
            <p className="text-2xl font-black text-white">{stats.current_cefr}</p>
            <span className="text-[11px] text-indigo-300">Target: B2 / C1</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
            <div className="flex items-center justify-between text-sky-400">
              <span className="text-xs font-semibold text-slate-400 uppercase">Interview Avg</span>
              <Award size={18} />
            </div>
            <p className="text-2xl font-black text-white">{stats.average_interview_score}%</p>
            <span className="text-[11px] text-emerald-400">Readiness: Good</span>
          </div>
        </div>

        {/* Mistakes by Category Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Mistakes by Category (Focus Areas)
          </h4>
          <div className="space-y-3">
            {Object.entries(stats.category_breakdown).map(([cat, count]) => {
              const max = 10;
              const pct = Math.min(100, (count / max) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize font-semibold text-slate-200">{cat} errors</span>
                    <span className="text-slate-400 font-mono">{count} occurrences</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Recurring Mistakes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-400" />
            <span>Top Recurring Indian-English Habits Detected</span>
          </h4>
          <div className="space-y-2">
            {stats.top_mistakes.map((m, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200">{m.signature}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                  {m.count} times
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
