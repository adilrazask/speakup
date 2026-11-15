import { clean_and_repair_json } from "./utils";

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export async function callGeminiAPI(
  promptOrTurns: string | ChatTurn[],
  systemInstruction: string,
  apiKey?: string,
  temperature: number = 0.4
): Promise<any> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    console.warn("No GEMINI_API_KEY provided; returning fallback.");
    return null;
  }

  // Format multi-turn conversation contents
  let contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (typeof promptOrTurns === "string") {
    contents = [
      {
        role: "user",
        parts: [{ text: promptOrTurns }]
      }
    ];
  } else if (Array.isArray(promptOrTurns)) {
    contents = promptOrTurns.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }]
    }));
  }

  // Support primary and fallback models
  const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const payload: any = {
      contents,
      generationConfig: {
        temperature,
        responseMimeType: "application/json"
      }
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Gemini (${model}) failed:`, errText);
        continue; // try next model
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      return clean_and_repair_json(rawText);
    } catch (err) {
      console.error(`Error invoking Gemini (${model}):`, err);
    }
  }

  return null;
}
