const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const MODEL = "gemini-2.0-flash"; // or "gemini-2.0-pro"

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

/**
 * Calls the Gemini API with the given prompt.
 */
async function generateFromGemini(prompt: string): Promise<string> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data: GeminiResponse = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return text ?? "⚠️ No meaningful response received from Gemini.";
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "❌ Gemini API failed.";
  }
}

export default generateFromGemini;
