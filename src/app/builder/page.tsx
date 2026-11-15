"use client";

import React, { useState, useEffect } from "react";
import { Layers, Sparkles, BookmarkPlus, Check, Volume2, ArrowRight } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { useSettings } from "../../context/SettingsContext";

export default function AnswerBuilderPage() {
  const { speak } = useSettings();
  const [story, setStory] = useState<string>("");
  const [competency, setCompetency] = useState<string>("Process Optimization");
  const [loading, setLoading] = useState<boolean>(false);
  const [starResult, setStarResult] = useState<any>(null);
  const [saved, setSaved] = useState<boolean>(false);
  const [bank, setBank] = useState<any[]>([]);

  useEffect(() => {
    // Load local answer bank
    const localBank = localStorage.getItem("speakup_answer_bank");
    if (localBank) {
      try {
        setBank(JSON.parse(localBank));
      } catch (e) {}
    }
  }, []);

  const handleBuild = async () => {
    if (!story.trim() || loading) return;
    setLoading(true);
    setStarResult(null);
    setSaved(false);

    try {
      const storedKey = typeof window !== "undefined" ? localStorage.getItem("speakup_gemini_key") || "" : "";
      const res = await fetch("/api/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, competency, apiKey: storedKey })
      });
      const data = await res.json();
      setStarResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToBank = () => {
    if (!starResult) return;
    const updated = [starResult, ...bank];
    setBank(updated);
    localStorage.setItem("speakup_answer_bank", JSON.stringify(updated));
    setSaved(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Answer Builder (STAR Method)"
        subtitle="Turn rough workplace anecdotes into crisp Situation, Task, Action, Result interview answers"
      />

      <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Target Competency
              </label>
              <select
                value={competency}
                onChange={(e) => setCompetency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Process Optimization">Process Optimization / Efficiency</option>
                <option value="Conflict Resolution">Conflict Resolution & Teamwork</option>
                <option value="Crisis Management">Crisis Handling / Under Pressure</option>
                <option value="Leadership & Ownership">Leadership & Taking Initiative</option>
                <option value="Customer Escalation">Handling Client Escalations</option>
              </select>
            </div>
            <div className="flex items-center text-xs text-slate-400 p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
              SpeakUp retains all your facts, tools, and roles without fabricating achievements.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Paste Your Rough Experience / Raw Story
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={5}
              placeholder="e.g. In my previous warehouse job, during festival sale we had a huge dispatch backlog because two workers were absent and systems were slow. I reorganized the shift, grouped orders by pin code, and cleared everything in 24 hours without delay..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleBuild}
            disabled={loading || !story.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition text-sm"
          >
            <Sparkles size={16} />
            <span>{loading ? "Restructuring into STAR Method..." : "Restructure into STAR Format"}</span>
          </button>
        </div>

        {/* Structured STAR Output */}
        {starResult && (
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                STAR Breakdown: {starResult.question_title}
              </span>
              <button
                onClick={handleSaveToBank}
                disabled={saved}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  saved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                {saved ? <Check size={14} /> : <BookmarkPlus size={14} />}
                <span>{saved ? "Saved to Answer Bank" : "Save to Bank"}</span>
              </button>
            </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">S - Situation</span>
                <p className="text-slate-300">{starResult.situation}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">T - Task</span>
                <p className="text-slate-300">{starResult.task}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">A - Action</span>
                <p className="text-slate-300">{starResult.action}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">R - Result</span>
                <p className="text-slate-300">{starResult.result}</p>
              </div>
            </div>

            {/* Spoken-Friendly Version */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Spoken-Friendly Version (Shorter sentences for speech delivery)
                </span>
                <button
                  onClick={() => speak(starResult.spoken_friendly_version)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  <Volume2 size={14} />
                  <span>Hear</span>
                </button>
              </div>
              <p className="text-sm font-medium text-slate-100 leading-relaxed italic">
                "{starResult.spoken_friendly_version}"
              </p>
            </div>
          </div>
        )}

        {/* Answer Bank Section */}
        {bank.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              My Saved Answer Bank ({bank.length})
            </h4>
            <div className="space-y-3">
              {bank.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">{item.question_title}</span>
                    <button onClick={() => speak(item.spoken_friendly_version)} className="text-slate-400 hover:text-indigo-400 p-1">
                      <Volume2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{item.spoken_friendly_version}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
