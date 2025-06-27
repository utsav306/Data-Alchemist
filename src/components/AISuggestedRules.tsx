import { useState } from "react";
import generateFromGemini from "../lib/gemini";

interface AISuggestedRulesProps {
  clients: any[];
  workers: any[];
  tasks: any[];
  onAddRule: (rule: any) => void;
  dataLoaded: boolean;
}

export default function AISuggestedRules({
  clients,
  workers,
  tasks,
  onAddRule,
  dataLoaded,
}: AISuggestedRulesProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSuggestions = async () => {
    setLoading(true);
    setError("");
    try {
      const prompt = `You are an expert in resource allocation. Based on the following data, suggest 3-5 useful rules (co-run, exclude, phase-limit) in JSON format. Use the schema: {type, task1, task2, worker, maxPhases, weight}.\nClients: ${JSON.stringify(
        clients,
      )}\nWorkers: ${JSON.stringify(workers)}\nTasks: ${JSON.stringify(
        tasks,
      )}\nReturn only a JSON array of rule objects, no explanation.`;
      const response = await generateFromGemini(prompt);
      const match = response.match(/\[.*\]/s);
      if (!match) throw new Error("No JSON array found in Gemini response.");
      const rules = JSON.parse(match[0]);
      setSuggestions(rules);
    } catch (err: any) {
      setError(err.message || "Failed to get suggestions from Gemini.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (rule: any) => {
    onAddRule(rule);
    setSuggestions((prev) => prev.filter((r) => r !== rule));
  };

  const handleDismiss = (rule: any) => {
    setSuggestions((prev) => prev.filter((r) => r !== rule));
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          AI Suggested Rules
        </h4>
        <button
          onClick={fetchSuggestions}
          className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          disabled={loading || !dataLoaded}
          title={!dataLoaded ? "Upload data to enable AI suggestions." : ""}
        >
          {loading ? "Loading..." : "Suggest Rules"}
        </button>
      </div>
      {!dataLoaded && (
        <div className="text-yellow-600 mb-2 text-sm">
          Upload data to enable AI rule suggestions.
        </div>
      )}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {suggestions.length === 0 && !loading && dataLoaded && (
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          No suggestions yet. Click 'Suggest Rules' to get AI recommendations.
        </div>
      )}
      <ul className="space-y-3">
        {suggestions.map((rule, i) => (
          <li
            key={i}
            className="bg-white dark:bg-gray-800 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-gray-200 dark:border-gray-700"
          >
            <span className="text-sm text-gray-800 dark:text-gray-100">
              {JSON.stringify(rule)}
            </span>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => handleAccept(rule)}
                className="px-3 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => handleDismiss(rule)}
                className="px-3 py-1 rounded bg-gray-400 text-white font-semibold hover:bg-gray-600"
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
