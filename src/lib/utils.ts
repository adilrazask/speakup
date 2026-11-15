import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(dateString?: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function clean_and_repair_json(raw: string): any {
  let text = raw.trim();
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    text = match[1].trim();
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    const cleaned = text.replace(/,\s*([\]}])/g, "$1");
    return JSON.parse(cleaned);
  }
}
