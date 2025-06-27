import { useState } from "react";
import generateFromGemini from "../lib/gemini";

interface NaturalLanguageRuleInputProps {
  onAddRule: (rule: any) => void;
  dataLoaded: boolean;
}

export default function NaturalLanguageRuleInput({
  onAddRule,
  dataLoaded,
}: NaturalLanguageRuleInputProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const geminiPrompt = `Convert the following user instruction into a valid JSON rule object for a resource allocation system.\nInstruction: "${prompt}"\nReturn only the JSON object, no explanation. Example formats: {\"type\":\"co-run\",\"task1\":\"T1\",\"task2\":\"T2\",\"weight\":1}, {\"type\":\"exclude\",\"worker\":\"W3\",\"task1\":\"T5\",\"weight\":1}, {\"type\":\"phase-limit\",\"task1\":\"T1\",\"maxPhases\":2,\"weight\":1}`;
      const response = await generateFromGemini(geminiPrompt);
      // Try to parse the first JSON object in the response
      const match = response.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON object found in Gemini response.");
      const rule = JSON.parse(match[0]);
      onAddRule(rule);
      setPrompt("");
    } catch (err: any) {
      setError(err.message || "Failed to parse rule from Gemini response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type a rule in natural language (e.g. 'Don't assign task T1 and T2 together')"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || !dataLoaded}
          required
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={loading || !prompt.trim() || !dataLoaded}
          title={!dataLoaded ? "Upload data to enable rule input." : ""}
        >
          {loading ? "Converting..." : "Add Rule with AI"}
        </button>
      </div>
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      {!dataLoaded && (
        <div className="text-yellow-600 mt-2 text-sm">
          Upload data to enable rule input.
        </div>
      )}
    </form>
  );
}
