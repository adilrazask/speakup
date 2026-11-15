"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, RotateCw, Volume2, Plus, Sparkles, Check } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { useSettings } from "../../context/SettingsContext";

interface Card {
  id: number;
  front: string;
  back: string;
  category: string;
  example: string;
  reps: number;
  interval: number;
}

const SEED_CARDS: Card[] = [
  { id: 1, front: "Streamline", back: "To make a process or workflow more efficient and simpler.", category: "Operations", example: "We introduced batching to streamline warehouse dispatch.", reps: 0, interval: 1 },
  { id: 2, front: "I have experience (NOT 'am having')", back: "Stative verbs of possession take simple present ('I have'), never continuous.", category: "Grammar Mistake", example: "I have 3 years of experience in supply chain.", reps: 1, interval: 3 },
  { id: 3, front: "Bottleneck", back: "A point of congestion that holds up the whole process.", category: "Logistics", example: "Customs clearance on ICEGATE was our main bottleneck.", reps: 2, interval: 6 },
  { id: 4, front: "Discuss (NOT 'discuss about')", back: "'Discuss' is transitive and does not need the preposition 'about'.", category: "Grammar Mistake", example: "Let's discuss the delivery timeline.", reps: 1, interval: 2 },
  { id: 5, front: "Proactive", back: "Taking action by causing change rather than merely reacting.", category: "Interview", example: "Taking a proactive approach prevented container detention fees.", reps: 3, interval: 10 }
];

export default function VocabularyPage() {
  const { speak } = useSettings();
  const [cards, setCards] = useState<Card[]>(SEED_CARDS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newFront, setNewFront] = useState<string>("");
  const [newBack, setNewBack] = useState<string>("");

  useEffect(() => {
    const local = localStorage.getItem("speakup_flashcards");
    if (local) {
      try {
        setCards(JSON.parse(local));
      } catch (e) {}
    }
  }, []);

  const currentCard = cards[currentIndex] || cards[0];

  const handleSM2Rating = (rating: "again" | "hard" | "good" | "easy") => {
    let daysToAdd = 1;
    if (rating === "hard") daysToAdd = 2;
    if (rating === "good") daysToAdd = 4;
    if (rating === "easy") daysToAdd = 7;

    const updated = cards.map((c, i) => {
      if (i === currentIndex) {
        return {
          ...c,
          reps: rating === "again" ? 0 : c.reps + 1,
          interval: rating === "again" ? 1 : c.interval + daysToAdd
        };
      }
      return c;
    });

    setCards(updated);
    localStorage.setItem("speakup_flashcards", JSON.stringify(updated));
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handleAddCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;
    const newCard: Card = {
      id: Date.now(),
      front: newFront,
      back: newBack,
      category: "Personal Note",
      example: "Added from practice session.",
      reps: 0,
      interval: 1
    };
    const updated = [newCard, ...cards];
    setCards(updated);
    localStorage.setItem("speakup_flashcards", JSON.stringify(updated));
    setNewFront("");
    setNewBack("");
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Vocabulary & Spaced Repetition Cards"
        subtitle="Daily workplace terms, collocations, and auto-converted grammar mistakes (SM-2)"
      />

      <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus size={14} />
            <span>Add Custom Card</span>
          </button>
        </div>

        {/* 3D Flip Card */}
        <div
          onClick={() => setFlipped(!flipped)}
          className="cursor-pointer min-h-[280px] p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-indigo-500/50 relative overflow-hidden"
        >
          <span className="absolute top-4 left-4 text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
            {currentCard.category}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              speak(flipped ? currentCard.back : currentCard.front);
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-indigo-400 p-2"
            title="Hear word"
          >
            <Volume2 size={18} />
          </button>

          {!flipped ? (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-black text-white">{currentCard.front}</h3>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <RotateCw size={12} />
                <span>Tap anywhere to flip & see meaning</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-lg">
              <p className="text-lg font-bold text-emerald-400">{currentCard.back}</p>
              {currentCard.example && (
                <p className="text-xs text-slate-300 italic bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  "{currentCard.example}"
                </p>
              )}
              <span className="text-xs text-slate-500">Tap to flip back</span>
            </div>
          )}
        </div>

        {/* SM-2 Recall Rating Buttons */}
        {flipped && (
          <div className="space-y-2">
            <span className="block text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
              How well did you remember this?
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleSM2Rating("again")}
                className="py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 text-xs font-bold transition"
              >
                Again (1 day)
              </button>
              <button
                onClick={() => handleSM2Rating("hard")}
                className="py-3 px-4 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-amber-300 text-xs font-bold transition"
              >
                Hard (2 days)
              </button>
              <button
                onClick={() => handleSM2Rating("good")}
                className="py-3 px-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/60 text-indigo-300 text-xs font-bold transition"
              >
                Good (4 days)
              </button>
              <button
                onClick={() => handleSM2Rating("easy")}
                className="py-3 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 text-xs font-bold transition"
              >
                Easy (7 days)
              </button>
            </div>
          </div>
        )}

        {/* Add Card Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
              <h4 className="text-base font-bold text-white">Add New Flashcard</h4>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Front (Word or Mistake)</label>
                <input
                  type="text"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. Expedite"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Back (Meaning & Example)</label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. To speed up a process..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCard}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md"
                >
                  Save Card
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
