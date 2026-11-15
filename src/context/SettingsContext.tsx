"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSettings } from "../lib/types";
import { fetchProfileSettings, updateProfileSettings } from "../lib/api";
import { useAuth } from "./AuthContext";

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  toggleTheme: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const defaultSettings: UserSettings = {
  tts_voice: "Google Indian English",
  tts_speed: 1.0,
  slow_mode: false,
  silence_timeout_ms: 2000,
  auto_speak_replies: true,
  theme: "dark",
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  toggleTheme: () => {},
  speak: () => {},
  stopSpeaking: () => {},
  isSpeaking: false,
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (profile?.id) {
      fetchProfileSettings(profile.id)
        .then((s) => {
          setSettings(s);
          if (s.theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        })
        .catch(() => {});
    }
  }, [profile?.id]);

  const update = async (newSettings: Partial<UserSettings>) => {
    if (!profile?.id) return;
    try {
      const updated = await updateProfileSettings(profile.id, newSettings);
      setSettings(updated);
      if (updated.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.error("Error updating settings:", e);
    }
  };

  const toggleTheme = () => {
    const next = settings.theme === "dark" ? "light" : "dark";
    update({ theme: next });
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    stopSpeaking();
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const speed = settings.slow_mode ? 0.8 : settings.tts_speed;
    utterance.rate = Math.max(0.7, Math.min(1.3, speed));

    // Try finding Indian English voice
    const voices = window.speechSynthesis.getVoices();
    const inVoice = voices.find((v) => v.lang.includes("en-IN") || v.name.includes("India"));
    if (inVoice) {
      utterance.voice = inVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings: update,
        toggleTheme,
        speak,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
