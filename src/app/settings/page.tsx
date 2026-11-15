"use client";

import React, { useState, useEffect } from "react";
import { Settings, Key, Volume2, Globe, Shield, Trash2, Check, Download } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { profile } = useAuth();

  const [apiKey, setApiKey] = useState<string>("");
  const [savedKey, setSavedKey] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(settings.tts_speed || 1.0);
  const [slowMode, setSlowMode] = useState<boolean>(settings.slow_mode || false);
  const [role, setRole] = useState<string>(profile?.target_role || "Operations");
  const [corrStyle, setCorrStyle] = useState<string>(profile?.correction_style || "after_speaking");

  useEffect(() => {
    const key = localStorage.getItem("speakup_gemini_key") || "";
    setApiKey(key);
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("speakup_gemini_key", apiKey.trim());
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 2500);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    updateSettings({ tts_speed: newSpeed });
  };

  const handleSlowModeToggle = () => {
    const next = !slowMode;
    setSlowMode(next);
    updateSettings({ slow_mode: next });
  };

  const handleExportData = () => {
    const data = {
      profile,
      settings,
      flashcards: localStorage.getItem("speakup_flashcards"),
      answerBank: localStorage.getItem("speakup_answer_bank"),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `speakup_learning_data_${Date.now()}.json`;
    a.click();
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to reset all local practice data?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Settings & AI Configuration"
        subtitle="Configure your AI engine, voice speed, speech accent, and data privacy"
      />

      <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Gemini API Key Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
              <Key size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Google Gemini API Key (Live Intelligent Agent)</h3>
              <p className="text-xs text-slate-400">
                Paste your Gemini API key to activate full real-time reasoning for interview evaluations, coach turns, and Q&A.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (Get free key at aistudio.google.com)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition"
            >
              {savedKey ? <Check size={16} /> : <Key size={14} />}
              <span>{savedKey ? "Saved!" : "Save Key"}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            🔒 Your API key is stored securely in your browser's private storage and is never shared.
          </p>
        </div>

        {/* Speech & Voice Controls */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Volume2 size={16} className="text-indigo-400" />
            <span>Voice & Audio Playback</span>
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Speaking Pace: {speed}x</span>
              <span className="text-slate-500 font-mono">0.7x (Slow) - 1.3x (Fast)</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <span className="text-sm font-semibold text-slate-200">Slow Mode for Beginners</span>
              <p className="text-xs text-slate-400">Agent speaks at 0.8x with simpler vocabulary.</p>
            </div>
            <input
              type="checkbox"
              checked={slowMode}
              onChange={handleSlowModeToggle}
              className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Globe size={16} className="text-indigo-400" />
            <span>Learning & Role Preferences</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200"
              >
                <option value="Operations">Operations & Process Optimization</option>
                <option value="Logistics">Logistics & Supply Chain</option>
                <option value="ERP">ERP / CRM & Master Data</option>
                <option value="Export">Export-Import Documentation</option>
                <option value="Finance">Finance & Accounts Support</option>
                <option value="IT">Software / Data / IT Support</option>
                <option value="Fresher">Fresher / General Career Starter</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Correction Timing
              </label>
              <select
                value={corrStyle}
                onChange={(e) => setCorrStyle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200"
              >
                <option value="after_speaking">Correct after I finish speaking (Default)</option>
                <option value="immediate">Correct every mistake immediately</option>
                <option value="major_only">Only flag major grammatical mistakes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management & Privacy */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Shield size={16} className="text-indigo-400" />
            <span>Data Management</span>
          </h4>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
            >
              <Download size={14} />
              <span>Export Learning History (JSON)</span>
            </button>
            <button
              onClick={handleClearData}
              className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-800/60 transition"
            >
              <Trash2 size={14} />
              <span>Reset Practice Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
