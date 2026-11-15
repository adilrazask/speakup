"use client";

import React from "react";
import { Lightbulb } from "lucide-react";

interface TopicStartersProps {
  onSelect: (topic: string) => void;
}

const STARTERS = [
  "I have 3 years of experience in supply chain and logistics.",
  "How should I explain a 6-month career gap during an HR interview?",
  "Could you explain the difference between 'affect' and 'effect'?",
  "In my previous project, we faced a severe dispatch delay on ICEGATE.",
  "Can you teach me how to politely negotiate salary without sounding arrogant?",
  "I am having trouble with prepositions like 'discuss about' vs 'discuss'."
];

export const TopicStarters: React.FC<TopicStartersProps> = ({ onSelect }) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-4">
      <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Lightbulb size={14} className="text-amber-400" />
        <span>Quick Practice Starters</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {STARTERS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition text-left"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
