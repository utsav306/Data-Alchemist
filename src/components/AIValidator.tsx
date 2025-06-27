import { useState } from "react";
import generateFromGemini from "../lib/gemini";

interface AIValidatorProps {
  clients: any[];
  workers: any[];
  tasks: any[];
  dataLoaded?: boolean;
  onAddRule: (rule: any) => void;
}

interface AIValidationWarning {
  table: string;
  rowId: string | number;
  field: string;
  message: string;
}

export default function AIValidator({
  clients,
  workers,
  tasks,
  dataLoaded = true,
  onAddRule,
}: AIValidatorProps) {
  const [warnings, setWarnings] = useState<AIValidationWarning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValidate = async () => {
    setLoading(true);
    setError("");
    try {
      const prompt = `You are an expert data analyst. Given the following data, flag any unusual, risky, or outlier values or patterns that a human should review. Return a JSON array of {table, rowId, field, message}. Do not repeat rule-based validation errors.\nData:\nclients: ${JSON.stringify(
        clients,
      )}\nworkers: ${JSON.stringify(workers)}\ntasks: ${JSON.stringify(
        tasks,
      )}\nReturn only a JSON array, no explanation.`;
      const response = await generateFromGemini(prompt);
      const match = response.match(/\[.*\]/s);
      if (!match) throw new Error("No JSON array found in Gemini response.");
      const aiWarnings = JSON.parse(match[0]);
      setWarnings(aiWarnings);
    } catch (err: any) {
      setError(err.message || "Failed to get AI validation warnings.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (warning: AIValidationWarning) => {
    const rule = {
      type: "ai-warning",
      table: warning.table,
      rowId: warning.rowId,
      field: warning.field,
      message: warning.message,
    };
    onAddRule(rule);
    setWarnings((prev) => prev.filter((w) => w !== warning));
  };

  const handleApplyAll = () => {
    warnings.forEach((warning) => {
      const rule = {
        type: "ai-warning",
        table: warning.table,
        rowId: warning.rowId,
        field: warning.field,
        message: warning.message,
      };
      onAddRule(rule);
    });
    setWarnings([]);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-8">
      <div className="flex items-center gap-3 mb-3">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          AI Validation Warnings
        </h4>
        <button
          onClick={handleValidate}
          className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          disabled={loading || !dataLoaded}
          title={!dataLoaded ? "Upload data to enable AI validation." : ""}
        >
          {loading ? "Validating..." : "AI Validate Data"}
        </button>
        {warnings.length > 0 && (
          <button
            onClick={handleApplyAll}
            className="px-4 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
            disabled={!dataLoaded}
            title={!dataLoaded ? "Upload data to enable AI validation." : ""}
          >
            Apply All
          </button>
        )}
      </div>
      {!dataLoaded && (
        <div className="text-yellow-600 mb-2 text-sm">
          Upload data to enable AI validation.
        </div>
      )}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {warnings.length === 0 && !loading && dataLoaded && (
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          No AI validation warnings. Click 'AI Validate Data' to check for
          anomalies or outliers.
        </div>
      )}
      <ul className="space-y-3">
        {warnings.map((w, i) => (
          <li
            key={i}
            className="bg-yellow-50 dark:bg-yellow-900 rounded p-3 border border-yellow-300 dark:border-yellow-700"
          >
            <div className="text-sm text-yellow-900 dark:text-yellow-100 font-mono">
              <span className="font-bold">[{w.table}]</span> Row{" "}
              <span className="font-bold">{w.rowId}</span>{" "}
              <span className="font-bold">{w.field}</span>: {w.message}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleApply(w)}
                className="px-3 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                disabled={!dataLoaded}
                title={
                  !dataLoaded ? "Upload data to enable AI validation." : ""
                }
              >
                Apply
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
