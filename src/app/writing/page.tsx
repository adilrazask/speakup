"use client";

import React, { useState } from "react";
import { Edit3, Sparkles, CheckCircle2, Copy, Check } from "lucide-react";
import { Header } from "../../components/layout/Header";

export default function WritingCorrectorPage() {
  const [text, setText] = useState<string>("");
  const [docType, setDocType] = useState<string>("email");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [activeTone, setActiveTone] = useState<"formal" | "confident" | "friendly">("formal");
  const [copied, setCopied] = useState<boolean>(false);

  const handleCheck = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const storedKey = typeof window !== "undefined" ? localStorage.getItem("speakup_gemini_key") || "" : "";
      const res = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type: docType, apiKey: storedKey })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Writing Corrector & Tone Enhancer"
        subtitle="Elevate emails, cover letters, and resume summaries with tracked changes and executive tone rewrites"
      />

      <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Document Type</span>
            <div className="flex gap-2">
              {["email", "cover_letter", "resume_summary"].map((t) => (
                <button
                  key={t}
                  onClick={() => setDocType(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg capitalize transition ${
                    docType === t
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Paste your email or cover letter draft here... (e.g. 'Dear Sir, please revert back with the needful details at your earliest convenience.')"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <button
            onClick={handleCheck}
            disabled={loading || !text.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition text-sm"
          >
            <Sparkles size={16} />
            <span>{loading ? "Analyzing grammar & tone..." : "Optimize Writing & Score"}</span>
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Writing Score: {result.scores.overall} / 100
              </span>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Clarity: {result.scores.clarity}%</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Tone: {result.scores.tone}%</span>
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Choose Desired Tone</span>
              <div className="flex gap-2">
                {(["formal", "confident", "friendly"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTone(t)}
                    className={`text-xs px-4 py-2 rounded-xl capitalize font-semibold transition ${
                      activeTone === t
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t} Tone
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative">
                <p className="text-sm text-slate-100 pr-10 leading-relaxed">
                  {result.tone_variations[activeTone]}
                </p>
                <button
                  onClick={() => handleCopy(result.tone_variations[activeTone])}
                  className="absolute top-4 right-4 text-slate-400 hover:text-indigo-400 p-1"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Tracked Changes */}
            {result.changes && result.changes.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tracked Changes & Explanations</span>
                <div className="space-y-2">
                  {result.changes.map((c: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-400 line-through font-medium">{c.original}</span>
                        <span className="text-slate-400">➔</span>
                        <span className="text-emerald-300 font-semibold">{c.replacement}</span>
                      </div>
                      <p className="text-slate-400">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
