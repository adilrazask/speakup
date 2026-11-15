"use client";

import React from "react";
import { Volume2, User, Bot } from "lucide-react";
import { ChatMessage } from "../../lib/types";
import { CorrectionCard } from "./CorrectionCard";
import { useSettings } from "../../context/SettingsContext";
import { formatTime } from "../../lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { speak } = useSettings();
  const isUser = message.sender === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-6`}>
      <div className={`flex items-start gap-3 max-w-[90%] sm:max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center shadow-md ${
            isUser
              ? "bg-slate-700 text-slate-200 border border-slate-600"
              : "bg-indigo-600 text-white shadow-indigo-600/30"
          }`}
        >
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* Message Content Bubble */}
        <div className="space-y-1">
          <div
            className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
              isUser
                ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Meta footer: time, WPM, and TTS button for agent */}
          <div className={`flex items-center gap-2 text-[11px] text-slate-400 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
            {message.created_at && <span>{formatTime(message.created_at)}</span>}
            {message.wpm ? <span className="font-mono">({message.wpm} WPM)</span> : null}
            {!isUser && (
              <button
                onClick={() => speak(message.content)}
                className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
                title="Speak reply"
              >
                <Volume2 size={13} />
                <span>Hear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Structured Correction Card attached to Agent Message if present */}
      {!isUser && message.structured_data && (
        <div className="w-full max-w-2xl pl-12">
          <CorrectionCard card={message.structured_data} />
        </div>
      )}
    </div>
  );
};
