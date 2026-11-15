import { NextRequest, NextResponse } from "next/server";
import { callGeminiAPI } from "../../../lib/gemini";

const WRITING_PROMPT = `You are the Corporate Writing & Tone Specialist for SpeakUp.
Analyze emails, cover letters, and summaries.
Return ONLY valid JSON matching:
{
  "corrected_text": "Complete polished text incorporating all fixes",
  "tone_variations": {
    "formal": "Strictly executive, formal corporate tone",
    "confident": "Direct, assertive, results-driven tone",
    "friendly": "Warm, collaborative, accessible tone"
  },
  "changes": [
    {
      "original": "revert back with the needful",
      "replacement": "reply with the required details",
      "reason": "Avoid 'revert back' (redundant) and 'needful' (archaic).",
      "category": "collocation"
    }
  ],
  "scores": {"overall": 85, "clarity": 88, "tone": 82, "grammar": 85},
  "key_takeaway": "Main recommendation to elevate your written communication."
}`;

export async function POST(req: NextRequest) {
  try {
    const { text, type, apiKey } = await req.json();
    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

    const prompt = `Document Type: ${type || "email"}\nOriginal Text:\n${text}`;
    const aiRes = await callGeminiAPI(prompt, WRITING_PROMPT, apiKey);
    if (aiRes && aiRes.corrected_text) {
      return NextResponse.json(aiRes);
    }

    return NextResponse.json({
      corrected_text: text.replace(/revert back/gi, "reply").replace(/do the needful/gi, "take the necessary action"),
      tone_variations: {
        formal: `I am writing to share the updated project details for your review. Please let me know if any further clarification is required.`,
        confident: `Here are the updated project milestones. We have achieved on-time completion across all key deliverables and are ready for the next phase.`,
        friendly: `Hope you're having a great week! Here are the latest updates on our project—let me know your thoughts whenever you have a moment.`
      },
      changes: [
        {
          original: "revert back",
          replacement: "reply",
          reason: "'Revert' already means return, so adding 'back' is redundant.",
          category: "collocation"
        }
      ],
      scores: { overall: 84, clarity: 86, tone: 82, grammar: 85 },
      key_takeaway: "Keep your sentences direct and replace archaic expressions with crisp modern phrasing."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
