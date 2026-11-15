"use client";

import React, { useState } from "react";
import { HelpCircle, Send, Sparkles, CheckCircle2, BookOpen, Volume2 } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { useSettings } from "../../context/SettingsContext";

export default function AskQAPage() {
  const { speak } = useSettings();
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [answer, setAnswer] = useState<any>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);

  const handleAsk = async (qText?: string) => {
    const q = (qText || question).trim();
    if (!q || loading) return;

    setLoading(true);
    setAnswer(null);
    setSelectedQuizOption(null);

    try {
      const storedKey = typeof window !== "undefined" ? localStorage.getItem("speakup_gemini_key") || "" : "";
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, apiKey: storedKey })
      });
      const data = await res.json();
      setAnswer(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sampleDoubtQuestions = [
    "Difference between 'affect' and 'effect' in corporate emails",
    "Why shouldn't I say 'I am having 3 years experience'?",
    "How to politely decline an unrealistic deadline from my manager?",
    "When to use 'discuss' instead of 'discuss about'?",
    "What is the difference between 'revert' and 'reply'?"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Ask Me Anything (Q&A)"
        subtitle="Grammar rules, word nuances, email phrasing, and interview etiquette"
      />

      <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Search Bar */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ask any English or interview doubt
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="e.g. When should I use 'since' vs 'for'? Or how do I answer salary questions?"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold flex items-center gap-2 transition"
            >
              <span>Ask</span>
              <Send size={16} />
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 pt-2">
            {sampleDoubtQuestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(s);
                  handleAsk(s);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Consulting linguistic rulebooks & corporate examples...</p>
          </div>
        )}

        {/* Answer Display */}
        {answer && (
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            {/* Short Answer */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Direct Answer</span>
              <p className="text-base font-semibold text-slate-100">{answer.short_answer}</p>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Explanation</span>
              <p className="text-sm text-slate-300 leading-relaxed">{answer.detailed_explanation}</p>
            </div>

            {/* Bilingual Explanations */}
            {(answer.explanation_hindi || answer.explanation_telugu) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {answer.explanation_hindi && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-700/40 text-amber-200">
                    <strong className="text-amber-400">सरल हिन्दी व्याख्या: </strong>
                    {answer.explanation_hindi}
                  </div>
                )}
                {answer.explanation_telugu && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-700/40 text-amber-200">
                    <strong className="text-amber-400">తెలుగు వివరణ: </strong>
                    {answer.explanation_telugu}
                  </div>
                )}
              </div>
            )}

            {/* Examples */}
            {answer.examples && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-400" />
                  Real Workplace Examples
                </span>
                <div className="space-y-2">
                  {answer.examples.map((ex: string, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 flex items-center justify-between">
                      <span>{ex}</span>
                      <button
                        onClick={() => speak(ex)}
                        className="text-slate-400 hover:text-indigo-400 p-1"
                        title="Listen"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mini Quiz */}
            {answer.mini_quiz && (
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Quick Practice Quiz</span>
                <p className="text-sm font-medium text-slate-200">{answer.mini_quiz.question}</p>
                <div className="space-y-2">
                  {answer.mini_quiz.options.map((opt: string, idx: number) => {
                    const isSelected = selectedQuizOption === idx;
                    const isCorrect = idx === answer.mini_quiz.correct_index;
                    let style = "bg-slate-900 border-slate-700 text-slate-300";
                    if (selectedQuizOption !== null) {
                      if (isCorrect) style = "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold";
                      else if (isSelected) style = "bg-rose-950/50 border-rose-500 text-rose-300";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedQuizOption(idx)}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition ${style}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedQuizOption !== null && (
                  <p className="text-xs text-slate-400 pt-1">
                    <strong>Note: </strong>{answer.mini_quiz.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
