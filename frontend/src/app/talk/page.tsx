"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { MessageBubble } from "../../components/chat/MessageBubble";
import { TopicStarters } from "../../components/chat/TopicStarters";
import { ChatMessage, CorrectionCardResponse } from "../../lib/types";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { createSession, sendChatMessage } from "../../lib/api";

export default function TalkPage() {
  const { profile } = useAuth();
  const { speak, settings } = useSettings();

  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Session
  useEffect(() => {
    if (profile?.id && !sessionId) {
      createSession(profile.id, "coach", "Free English Practice")
        .then((s) => {
          setSessionId(s.session_id);
          // Add welcoming greeting
          setMessages([
            {
              id: "intro_msg",
              sender: "agent",
              content: `Namaste ${profile.full_name.split(" ")[0]}! I'm Coach Priya, your dedicated English and interview partner. Speak or type freely—I'll guide your grammar, vocabulary, and answer structure naturally. What are you working on today?`,
              created_at: new Date().toISOString(),
            },
          ]);
        })
        .catch((err) => console.error("Session creation error:", err));
    }
  }, [profile?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isThinking]);

  // Web Speech API initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = "en-IN"; // Indian English accent tuning

        recog.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };

        recog.onend = () => {
          setIsRecording(false);
        };

        recog.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e);
          setIsRecording(false);
        };

        setRecognition(recog);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      alert("Web Speech API is not supported in this browser. Please use Google Chrome or type your message.");
      return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setInput("");
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isThinking || !sessionId || !profile?.id) return;

    setInput("");
    if (isRecording && recognition) {
      recognition.stop();
      setIsRecording(false);
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Send turn to backend
      const cardResponse = await sendChatMessage({
        session_id: sessionId,
        profile_id: profile.id,
        content: text,
      });

      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: "agent",
        content: cardResponse.reply,
        structured_data: cardResponse,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Automatically speak reply if enabled in settings
      if (settings.auto_speak_replies) {
        speak(cardResponse.reply);
      }
    } catch (e) {
      console.error("Error communicating with coach:", e);
      // Friendly fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "agent",
          content: "I had a brief glitch communicating with the server, but let me know what else you'd like to practice!",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        title="Free Conversation Coach"
        subtitle="Real-time speaking practice with instant, encouraging grammatical corrections"
      />

      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl w-full mx-auto">
        <TopicStarters onSelect={(topic) => handleSendMessage(topic)} />

        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Thinking / Streaming Skeleton */}
          {isThinking && (
            <div className="flex items-start gap-3 pl-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/80 text-white flex items-center justify-center animate-pulse">
                <Sparkles size={18} />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-400" />
                <span>Coach Priya is evaluating your sentence & preparing feedback...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Dock */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* Big Mic Button */}
          <button
            onClick={toggleRecording}
            className={`p-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center ${
              isRecording
                ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title={isRecording ? "Stop listening" : "Tap to speak (en-IN)"}
            aria-label="Toggle voice input"
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Text Input Field */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isRecording
                  ? "Listening to your spoken English..."
                  : "Type a sentence or tap mic to speak (e.g. 'I am having 3 years experience')..."
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isThinking}
            className={`p-3.5 rounded-2xl font-semibold flex items-center justify-center transition shadow-lg ${
              input.trim() && !isThinking
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
