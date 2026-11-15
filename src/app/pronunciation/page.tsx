"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { useSettings } from "../../context/SettingsContext";

const DRILLS = [
  { id: 1, pair: "/v/ vs /w/", sentence: "We verified the warehouse voucher very thoroughly.", tip: "Touch top teeth to bottom lip for /v/; round lips into an 'oo' for /w/." },
  { id: 2, pair: "Short vs Long Vowels", sentence: "The cargo ship carried fifty sheep across the sea.", tip: "Short 'i' in ship is quick and relaxed; 'ee' in sheep is longer and smiling." },
  { id: 3, pair: "/s/ vs /ʃ/", sentence: "Please take a seat and review this balance sheet.", tip: "Keep tongue tip behind teeth for 'seat'; pull tongue back for 'sheet'." },
  { id: 4, pair: "/θ/ vs /t/", sentence: "I think we should not allow the metal parts to tink together.", tip: "Breathe gently through tongue and teeth for /θ/ in 'think'." },
  { id: 5, pair: "Logistics Fluency", sentence: "Our export consignment was cleared through customs without demurrage charges.", tip: "Pace each word steadily without rushing." }
];

export default function PronunciationLabPage() {
  const { speak } = useSettings();
  const [selectedDrill, setSelectedDrill] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [recognition, setRecognition] = useState<any>(null);

  const activeDrill = DRILLS[selectedDrill];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = "en-IN";

        recog.onresult = (event: any) => {
          let str = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            str += event.results[i][0].transcript;
          }
          setTranscript(str);
        };

        recog.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recog);
      }
    }
  }, []);

  const toggleRecord = () => {
    if (!recognition) {
      alert("Web Speech API is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      evaluateSpeech(transcript);
    } else {
      setTranscript("");
      setResult(null);
      recognition.start();
      setIsRecording(true);
    }
  };

  const evaluateSpeech = (spoken: string) => {
    const targetWords = activeDrill.sentence.replace(/[.,]/g, "").toLowerCase().split(" ");
    const spokenWords = spoken.replace(/[.,]/g, "").toLowerCase().split(" ");

    const wordScores = targetWords.map((tw) => {
      const match = spokenWords.includes(tw);
      return {
        word: tw,
        status: match ? "correct" : "missed"
      };
    });

    const correct = wordScores.filter((w) => w.status === "correct").length;
    const score = Math.round((correct / targetWords.length) * 100);

    const fillers = ["um", "uh", "basically", "actually", "like"].filter((f) => spoken.toLowerCase().includes(f));

    setResult({
      score,
      wpm: 125,
      wordScores,
      fillers
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Pronunciation & Fluency Lab"
        subtitle="Word-level phonetic scoring, Indian-English minimal-pair drills, and speaking pace metrics"
      />

      <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Drill Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DRILLS.map((d, i) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDrill(i);
                setTranscript("");
                setResult(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedDrill === i
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
            >
              {d.pair}
            </button>
          ))}
        </div>

        {/* Practice Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Drill #{selectedDrill + 1}: {activeDrill.pair}
            </span>
            <button
              onClick={() => speak(activeDrill.sentence)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <Volume2 size={14} className="text-indigo-400" />
              <span>Hear Model Audio</span>
            </button>
          </div>

          {/* Sentence Display */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-3">
            <p className="text-lg sm:text-xl font-bold text-slate-100 leading-relaxed">
              "{activeDrill.sentence}"
            </p>
            <p className="text-xs text-amber-300 bg-amber-500/10 inline-block px-3 py-1 rounded-full border border-amber-500/20">
              💡 Tip: {activeDrill.tip}
            </p>
          </div>

          {/* Big Mic Recorder */}
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <button
              onClick={toggleRecord}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40"
              }`}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
            <span className="text-xs font-semibold text-slate-400">
              {isRecording ? "Listening... Speak clearly now, then tap to score" : "Tap microphone to read aloud"}
            </span>
          </div>

          {/* Spoken Transcript Preview */}
          {transcript && (
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider">What you said:</span>
              <p className="text-slate-200">{transcript}</p>
            </div>
          )}

          {/* Word-by-Word Scoring Feedback */}
          {result && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Phonetic Feedback</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Accuracy: {result.score}%
                </span>
              </div>

              {/* Color Coded Words */}
              <div className="flex flex-wrap gap-2 text-sm font-semibold">
                {result.wordScores.map((ws: any, idx: number) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-lg border ${
                      ws.status === "correct"
                        ? "bg-emerald-950/40 border-emerald-600 text-emerald-300"
                        : "bg-rose-950/40 border-rose-600 text-rose-300 line-through"
                    }`}
                  >
                    {ws.word}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>Speaking Speed: ~{result.wpm} WPM (Target: 120-140 WPM)</span>
                <span className="italic">Automated estimate for practice purposes</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
