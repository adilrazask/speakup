"use client";

import React, { useState } from "react";
import {
  Volume2,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  Languages,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Flag,
  BookOpen
} from "lucide-react";
import { CorrectionCardResponse, CorrectionItem } from "../../lib/types";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";
import { addFlashcard, reportFeedback } from "../../lib/api";

interface CorrectionCardProps {
  card: CorrectionCardResponse;
}

export const CorrectionCard: React.FC<CorrectionCardProps> = ({ card }) => {
  const { speak } = useSettings();
  const { profile } = useAuth();
  const [expandedWhy, setExpandedWhy] = useState<Record<number, boolean>>({});
  const [activeLang, setActiveLang] = useState<Record<number, "hi" | "te" | null>>({});
  const [flashcardSaved, setFlashcardSaved] = useState<Record<number, boolean>>({});
  const [feedbackSent, setFeedbackSent] = useState<Record<number, boolean>>({});

  const toggleWhy = (idx: number) => {
    setExpandedWhy((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleLang = (idx: number, lang: "hi" | "te") => {
    setActiveLang((prev) => ({
      ...prev,
      [idx]: prev[idx] === lang ? null : lang,
    }));
  };

  const handleSaveFlashcard = async (item: CorrectionItem, idx: number) => {
    if (!profile?.id) return;
    try {
      await addFlashcard({
        profile_id: profile.id,
        front_text: item.original,
        back_text: `${item.corrected}\n\nRule: ${item.rule}`,
        origin: "user_mistake",
      });
      setFlashcardSaved((prev) => ({ ...prev, [idx]: true }));
    } catch (e) {
      console.error("Failed to add flashcard:", e);
    }
  };

  const handleReport = async (idx: number) => {
    try {
      await reportFeedback({
        correction_id: `corr_feedback_${Date.now()}`,
        user_rating: "inaccurate",
        notes: "Reported from correction card UI",
      });
      setFeedbackSent((prev) => ({ ...prev, [idx]: true }));
    } catch (e) {
      console.error("Failed to report feedback:", e);
    }
  };

  return (
    <div className="mt-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden transition-all duration-200">
      {/* Top Header & Praise Bar */}
      <div className="bg-gradient-to-r from-indigo-950/70 to-slate-900 px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Coach Feedback & Real-Time Corrections
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Grammar: {card.scores.grammar}%
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Clarity: {card.scores.clarity}%
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Praise Message */}
        {card.praise && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-200">What you did well: </span>
              {card.praise}
            </div>
          </div>
        )}

        {/* Polished Better Version */}
        {card.better_version && (
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-indigo-400" />
                Polished Professional Version
              </span>
              <button
                onClick={() => speak(card.better_version)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                <Volume2 size={14} />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              "{card.better_version}"
            </p>
          </div>
        )}

        {/* Individual Corrections List */}
        {card.corrections.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Specific Corrections ({card.corrections.length})
            </h4>

            {card.corrections.map((item, idx) => {
              const isWhyOpen = expandedWhy[idx];
              const langState = activeLang[idx];

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5"
                >
                  {/* Original vs Corrected Diff */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          Original:
                        </span>
                        <span className="text-sm line-through decoration-rose-500 decoration-2 text-rose-300 font-medium">
                          {item.original}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Corrected:
                        </span>
                        <span className="text-sm text-emerald-300 font-semibold">
                          {item.corrected}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-700/80 text-slate-300">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar for this correction */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-700/40 text-xs">
                    {/* Collapsible Why Button */}
                    <button
                      onClick={() => toggleWhy(idx)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 transition"
                    >
                      <span>Why?</span>
                      {isWhyOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {/* TTS Button */}
                    <button
                      onClick={() => speak(item.corrected)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-indigo-300 transition"
                      title="Listen to pronunciation"
                    >
                      <Volume2 size={13} />
                      <span>Hear</span>
                    </button>

                    {/* Hindi Toggle */}
                    {item.explanation_hindi && (
                      <button
                        onClick={() => toggleLang(idx, "hi")}
                        className={`px-2 py-1 rounded-lg border transition ${
                          langState === "hi"
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold"
                            : "bg-slate-700/60 border-slate-600/40 text-slate-300"
                        }`}
                      >
                        हिन्दी
                      </button>
                    )}

                    {/* Telugu Toggle */}
                    {item.explanation_telugu && (
                      <button
                        onClick={() => toggleLang(idx, "te")}
                        className={`px-2 py-1 rounded-lg border transition ${
                          langState === "te"
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold"
                            : "bg-slate-700/60 border-slate-600/40 text-slate-300"
                        }`}
                      >
                        తెలుగు
                      </button>
                    )}

                    {/* Add to Flashcards */}
                    <button
                      onClick={() => handleSaveFlashcard(item, idx)}
                      disabled={flashcardSaved[idx]}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                        flashcardSaved[idx]
                          ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                          : "bg-slate-700/60 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      <BookmarkPlus size={13} />
                      <span>{flashcardSaved[idx] ? "Saved to Cards" : "Save Card"}</span>
                    </button>

                    {/* Report Feedback */}
                    <button
                      onClick={() => handleReport(idx)}
                      disabled={feedbackSent[idx]}
                      className="ml-auto text-slate-500 hover:text-slate-400 p-1 rounded"
                      title="Report inaccurate correction"
                    >
                      <Flag size={12} className={feedbackSent[idx] ? "text-amber-400" : ""} />
                    </button>
                  </div>

                  {/* Expanded Why Details */}
                  {isWhyOpen && (
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/80 space-y-1.5 text-xs text-slate-300">
                      <p>
                        <strong className="text-indigo-400">Rule:</strong> {item.rule}
                      </p>
                      <p>
                        <strong className="text-slate-400">Explanation:</strong>{" "}
                        {item.explanation_simple}
                      </p>
                    </div>
                  )}

                  {/* Optional Bilingual Explanation Panel */}
                  {langState === "hi" && item.explanation_hindi && (
                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-700/40 text-xs text-amber-200">
                      <strong className="text-amber-400 font-semibold">सरल हिन्दी व्याख्या: </strong>
                      {item.explanation_hindi}
                    </div>
                  )}
                  {langState === "te" && item.explanation_telugu && (
                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-700/40 text-xs text-amber-200">
                      <strong className="text-amber-400 font-semibold">తెలుగు వివరణ: </strong>
                      {item.explanation_telugu}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-800/40 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>Excellent sentence structure! No major grammatical errors detected.</span>
          </div>
        )}

        {/* Vocabulary Suggestions */}
        {card.vocabulary_suggestions && card.vocabulary_suggestions.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-400" />
              Recommended Workplace Vocabulary
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {card.vocabulary_suggestions.map((v, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="font-semibold text-indigo-300">{v.word}</div>
                  <div className="text-slate-400">{v.meaning}</div>
                  <div className="text-slate-300 italic">"{v.example}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Actionable Tip */}
        {card.next_tip && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-indigo-400 shrink-0" />
              <span>
                <strong className="text-indigo-200">Tip for next turn: </strong>
                {card.next_tip}
              </span>
            </div>
            {card.fluency_notes.wpm ? (
              <span className="font-mono text-[11px] text-slate-400">
                {card.fluency_notes.wpm} WPM
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
