import { clean_and_repair_json } from "./utils";

export async function callGeminiAPI(
  prompt: string,
  systemInstruction: string,
  apiKey?: string,
  temperature: number = 0.4
): Promise<any> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    console.warn("No GEMINI_API_KEY provided; returning fallback.");
    return null;
  }

  // Use Google Gemini REST API v1beta
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

  const payload: any = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
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
      console.error("Gemini API Error:", errText);
      return null;
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    return JSON.parse(candidateText);
  } catch (err) {
    console.error("Error invoking Gemini API:", err);
    return null;
  }
}
