"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Play,
  RotateCcw,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  Volume2,
  Printer
} from "lucide-react";
import { Header } from "../../components/layout/Header";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

interface Question {
  id: number;
  text: string;
  category: string;
}

const SAMPLE_QUESTIONS: Record<string, Question[]> = {
  Operations: [
    { id: 1, text: "Tell me about yourself and your background in process and operations management.", category: "Introduction" },
    { id: 2, text: "Describe a time an operational bottleneck delayed shipments. How did you resolve it?", category: "Problem Solving" },
    { id: 3, text: "How do you handle a situation where a vendor fails to deliver on time?", category: "Situational" },
    { id: 4, text: "Walk me through how you track daily operational KPIs like throughput and error rates.", category: "Technical" },
    { id: 5, text: "Why do you want to join our organization, and what are your salary expectations?", category: "HR / Behavioral" }
  ],
  Logistics: [
    { id: 1, text: "Walk me through your experience managing freight forwarding and distribution operations.", category: "Introduction" },
    { id: 2, text: "Describe how you resolved a port customs clearance delay on ICEGATE.", category: "Documentation" },
    { id: 3, text: "How do you calculate safety stock and optimize warehouse inventory turnover?", category: "Inventory" },
    { id: 4, text: "Tell me about a time you audited freight bills and discovered billing discrepancies.", category: "Auditing" },
    { id: 5, text: "Where do you see your career in logistics and supply chain in the next three years?", category: "Behavioral" }
  ]
};

export default function MockInterviewPage() {
  const { profile } = useAuth();
  const { speak } = useSettings();

  const [role, setRole] = useState<string>("Operations");
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [thinkingSeconds, setThinkingSeconds] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [report, setReport] = useState<any>(null);

  const activeQuestions = SAMPLE_QUESTIONS[role] || SAMPLE_QUESTIONS["Operations"];

  // Answer timer
  useEffect(() => {
    let interval: any;
    if (inProgress && !isEvaluating) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
        if (thinkingSeconds > 0) {
          setThinkingSeconds((prev) => prev - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [inProgress, isEvaluating, thinkingSeconds]);

  const startInterview = () => {
    setInProgress(true);
    setCurrentIdx(0);
    setAnswers([]);
    setCurrentAnswer("");
    setTimerSeconds(0);
    setReport(null);
    speak(activeQuestions[0].text);
  };

  const handleNextQuestion = async () => {
    if (!currentAnswer.trim()) return;

    const updated = [
      ...answers,
      { question: activeQuestions[currentIdx].text, answer: currentAnswer }
    ];
    setAnswers(updated);
    setCurrentAnswer("");

    if (currentIdx + 1 < activeQuestions.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      speak(activeQuestions[nextIdx].text);
    } else {
      // Completed all questions! Evaluate!
      setIsEvaluating(true);
      try {
        const storedKey = typeof window !== "undefined" ? localStorage.getItem("speakup_gemini_key") || "" : "";
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "evaluate",
            role,
            answers: updated,
            apiKey: storedKey
          })
        });
        const data = await res.json();
        setReport(data);
      } catch (e) {
        console.error("Evaluation error:", e);
      } finally {
        setIsEvaluating(false);
        setInProgress(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Mock Interview Simulator"
        subtitle="In-character hiring manager interview with 7-dimension rubric evaluation"
      />

      <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Setup Screen */}
        {!inProgress && !report && (
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Briefcase size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Setup Mock Interview</h3>
                <p className="text-sm text-slate-400">Practice with realistic industry questions and receive an executive scorecard.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Target Domain
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Operations">Operations & Process Optimization</option>
                  <option value="Logistics">Logistics & Supply Chain Management</option>
                  <option value="ERP">ERP / CRM & Master Data Management</option>
                  <option value="Export">Export-Import & ICEGATE Documentation</option>
                  <option value="Finance">Finance & Accounts Support</option>
                  <option value="IT">Software / Data / IT Support</option>
                  <option value="Fresher">General / Fresher Career Starter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Simulation Format
                </label>
                <div className="px-4 py-3 bg-slate-800/60 rounded-xl border border-slate-700 text-sm text-slate-300">
                  5 Focused Competency Questions + Rubric Report
                </div>
              </div>
            </div>

            <button
              onClick={startInterview}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition text-sm"
            >
              <Play size={18} />
              <span>Begin Live Interview Simulation</span>
            </button>
          </div>
        )}

        {/* Active Interview HUD */}
        {inProgress && (
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Question {currentIdx + 1} of {activeQuestions.length}
                </span>
                <span className="text-xs text-slate-400">Interviewer: Vikram Verma</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  <Clock size={14} className="text-amber-400" />
                  <span className="font-mono">
                    {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <button
                  onClick={() => setThinkingSeconds(20)}
                  disabled={thinkingSeconds > 0}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  {thinkingSeconds > 0 ? `Thinking (${thinkingSeconds}s)` : "Think 20s"}
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  {activeQuestions[currentIdx].category} Question
                </span>
                <button
                  onClick={() => speak(activeQuestions[currentIdx].text)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition"
                >
                  <Volume2 size={14} />
                  <span>Hear Question</span>
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-100 leading-snug">
                "{activeQuestions[currentIdx].text}"
              </h3>
            </div>

            {/* Answer Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Your Spoken or Typed Response (Use STAR: Situation, Task, Action, Result)
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={5}
                placeholder="In my previous company, when we faced that challenge, I immediately took ownership..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">Answer thoroughly before moving to next question.</span>
              <button
                onClick={handleNextQuestion}
                disabled={!currentAnswer.trim() || isEvaluating}
                className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold flex items-center gap-2 shadow-lg transition text-sm"
              >
                <span>{currentIdx + 1 === activeQuestions.length ? "Finish & Evaluate" : "Submit Answer"}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Evaluation Loading */}
        {isEvaluating && (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
            <h4 className="text-lg font-bold text-white">Analyzing Your Interview Performance</h4>
            <p className="text-sm text-slate-400">Scoring relevance, STAR structure, specificity, grammar, and executive presence...</p>
          </div>
        )}

        {/* Complete Evaluator Report */}
        {report && (
          <div className="space-y-6">
            {/* Top Score Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Executive Interview Assessment
                </span>
                <h3 className="text-2xl font-black text-white">Overall Score: {report.overall_score} / 100</h3>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs text-slate-300">Hire Readiness:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {report.hire_readiness}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer size={15} />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={startInterview}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
                >
                  <RotateCcw size={15} />
                  <span>Practice Again</span>
                </button>
              </div>
            </div>

            {/* Strengths & Fixes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  <span>Top 3 Strengths</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {report.summary_strengths.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle size={16} />
                  <span>Key Improvement Areas</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {report.summary_fixes.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 7-Day Improvement Plan */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Calendar size={16} />
                <span>Your Personalized 7-Day Interview Action Plan</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {report.seven_day_plan.map((p: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                    <span className="font-bold text-indigo-300">Day {p.day}: {p.focus}</span>
                    <p className="text-slate-300">{p.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
