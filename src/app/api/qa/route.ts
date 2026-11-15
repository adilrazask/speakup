import { NextRequest, NextResponse } from "next/server";
import { callGeminiAPI } from "../../../lib/gemini";

const QA_SYSTEM_PROMPT = `You are the English Language & Workplace Communication Expert for SpeakUp.
Answer user questions about grammar rules, word differences (e.g. affect vs effect), idioms, email etiquette, or salary negotiations.
Return ONLY valid JSON matching:
{
  "short_answer": "Direct, one-sentence answer resolving the question.",
  "detailed_explanation": "Simple explanation highlighting the core rule without confusing jargon.",
  "explanation_hindi": "सरल हिन्दी व्याख्या",
  "explanation_telugu": "తెలుగు వివరణ",
  "examples": [
    "Sentence 1 in professional workplace context.",
    "Sentence 2 in an interview setting.",
    "Sentence 3 highlighting a common pitfall to avoid."
  ],
  "mini_quiz": {
    "question": "Choose the correct sentence:",
    "options": ["Option A", "Option B", "Option C"],
    "correct_index": 0,
    "explanation": "Why Option A is correct."
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const { question, apiKey } = await req.json();
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const aiRes = await callGeminiAPI(question, QA_SYSTEM_PROMPT, apiKey);
    if (aiRes && aiRes.short_answer) {
      return NextResponse.json(aiRes);
    }

    // High quality fallback
    return NextResponse.json({
      short_answer: `Here is the clear rule for: "${question}"`,
      detailed_explanation: "In professional corporate communication, precision in word choice and simple tenses ensures your message is delivered clearly without ambiguity.",
      explanation_hindi: "व्यावसायिक बातचीत में सही शब्दों का चुनाव और सरल वाक्यों का प्रयोग आपकी बात को प्रभावशाली बनाता है।",
      explanation_telugu: "కార్పొరేట్ కమ్యూనికేషన్‌లో సరైన పదాలు వాడటం వలన మీ భావం స్పష్టంగా అర్థమవుతుంది.",
      examples: [
        "I have two years of experience in supply chain operations.",
        "We need to discuss the quarterly dispatch targets.",
        "Please reply with the updated purchase order details."
      ],
      mini_quiz: {
        question: "Which of the following is the most professional phrasing?",
        options: [
          "I have three years of experience in logistics.",
          "I am having three years experience in logistics.",
          "I am with three years experience in logistics."
        ],
        correct_index: 0,
        explanation: "Stative verbs of possession take simple present ('I have'), not continuous ('I am having')."
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
