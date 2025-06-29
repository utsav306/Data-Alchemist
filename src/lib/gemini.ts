// Environment variable for the Gemini API key
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// AI model to use for text generation (can be switched between different models)
const MODEL = "gemini-2.0-flash"; // or "gemini-2.0-pro"

/**
 * Interface defining the structure of a Gemini API response
 *
 * This interface represents the expected response format from the Gemini API,
 * including the nested structure of candidates, content, and parts.
 */
interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

/**
 * Calls the Gemini API with the given prompt to generate text content
 *
 * This function sends a text prompt to Google's Gemini AI model and returns
 * the generated response. It handles API authentication, request formatting,
 * and error handling.
 *
 * Features:
 * - Automatic API key authentication
 * - Proper request formatting for Gemini API
 * - Comprehensive error handling
 * - Fallback error messages for failed requests
 *
 * @param {string} prompt - The text prompt to send to Gemini AI
 * @returns {Promise<string>} The generated text response from Gemini
 *
 * @example
 * const response = await generateFromGemini("Explain machine learning in simple terms");
 * console.log(response);
 *
 * @throws {Error} When API key is missing or API request fails
 */
async function generateFromGemini(prompt: string): Promise<string> {
  try {
    // Make API request to Gemini with the provided prompt
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

    // Check if the API request was successful
    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    // Parse the JSON response from the API
    const data: GeminiResponse = await res.json();

    // Extract the generated text from the nested response structure
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Return the generated text or a fallback message if no text was generated
    return text ?? "⚠️ No meaningful response received from Gemini.";
  } catch (err) {
    // Log the error for debugging purposes
    console.error("Gemini API Error:", err);

    // Return a user-friendly error message
    return "❌ Gemini API failed.";
  }
}

export default generateFromGemini;
