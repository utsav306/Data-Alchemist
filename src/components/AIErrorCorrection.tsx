import { useState } from "react";
import generateFromGemini from "../lib/gemini";
import { ValidationError } from "../lib/validate";

interface AIErrorCorrectionProps {
  clients: any[];
  setClients: (rows: any[]) => void;
  workers: any[];
  setWorkers: (rows: any[]) => void;
  tasks: any[];
  setTasks: (rows: any[]) => void;
  errors: ValidationError[];
  setErrors: (errors: ValidationError[]) => void;
  validateClients: (rows: any[]) => ValidationError[];
  validateWorkers: (rows: any[]) => ValidationError[];
  validateTasks: (rows: any[]) => ValidationError[];
  dataLoaded: boolean;
}

export default function AIErrorCorrection({
  clients,
  setClients,
  workers,
  setWorkers,
  tasks,
  setTasks,
  errors,
  setErrors,
  validateClients,
  validateWorkers,
  validateTasks,
  dataLoaded,
}: AIErrorCorrectionProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchSuggestions = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const prompt = `You are an expert data cleaner. Given the following data and validation errors, suggest corrections as a JSON array of {table, filter, update, reason}. Use the schema: { table: "clients"|"workers"|"tasks", filter: {...}, update: {...}, reason: "why this fix" }\nData:\nclients: ${JSON.stringify(
        clients,
      )}\nworkers: ${JSON.stringify(workers)}\ntasks: ${JSON.stringify(
        tasks,
      )}\nErrors: ${JSON.stringify(
        errors,
      )}\nReturn only a JSON array, no explanation.`;
      const response = await generateFromGemini(prompt);
      const match = response.match(/\[.*\]/s);
      if (!match) throw new Error("No JSON array found in Gemini response.");
      const fixes = JSON.parse(match[0]);
      // Filter out fixes where all update values are null or empty string
      const filteredFixes = fixes.filter((fix: any) => {
        if (!fix.update || typeof fix.update !== "object") return false;
        return Object.values(fix.update).some(
          (v) => v !== null && v !== "" && v !== undefined,
        );
      });
      setSuggestions(filteredFixes);
    } catch (err: any) {
      setError(err.message || "Failed to get suggestions from Gemini.");
    } finally {
      setLoading(false);
    }
  };

  const applyFix = (fix: any) => {
    let updated = 0;
    let newClients = clients;
    let newWorkers = workers;
    let newTasks = tasks;
    if (fix.table === "clients") {
      newClients = clients.map((row) => {
        const match = Object.entries(fix.filter).every(([k, v]) => row[k] == v);
        if (match) {
          updated++;
          return { ...row, ...fix.update };
        }
        return row;
      });
      setClients(newClients);
      setErrors(validateClients(newClients));
    } else if (fix.table === "workers") {
      newWorkers = workers.map((row) => {
        const match = Object.entries(fix.filter).every(([k, v]) => row[k] == v);
        if (match) {
          updated++;
          return { ...row, ...fix.update };
        }
        return row;
      });
      setWorkers(newWorkers);
      setErrors(validateWorkers(newWorkers));
    } else if (fix.table === "tasks") {
      newTasks = tasks.map((row) => {
        const match = Object.entries(fix.filter).every(([k, v]) => row[k] == v);
        if (match) {
          updated++;
          return { ...row, ...fix.update };
        }
        return row;
      });
      setTasks(newTasks);
      setErrors(validateTasks(newTasks));
    }
    setSuggestions((prev) => prev.filter((f) => f !== fix));
    setMessage(
      updated > 0
        ? `Applied fix to ${updated} row(s) in ${fix.table}.`
        : "No matching rows found.",
    );
  };

  const handleApply = (fix: any) => {
    applyFix(fix);
  };

  const handleDismiss = (fix: any) => {
    setSuggestions((prev) => prev.filter((f) => f !== fix));
  };

  const handleApplyAll = () => {
    let newClients = clients;
    let newWorkers = workers;
    let newTasks = tasks;
    let applied = 0;
    suggestions.forEach((fix) => {
      if (fix.table === "clients") {
        newClients = newClients.map((row) => {
          const match = Object.entries(fix.filter).every(
            ([k, v]) => row[k] == v,
          );
          if (match) {
            applied++;
            return { ...row, ...fix.update };
          }
          return row;
        });
      } else if (fix.table === "workers") {
        newWorkers = newWorkers.map((row) => {
          const match = Object.entries(fix.filter).every(
            ([k, v]) => row[k] == v,
          );
          if (match) {
            applied++;
            return { ...row, ...fix.update };
          }
          return row;
        });
      } else if (fix.table === "tasks") {
        newTasks = newTasks.map((row) => {
          const match = Object.entries(fix.filter).every(
            ([k, v]) => row[k] == v,
          );
          if (match) {
            applied++;
            return { ...row, ...fix.update };
          }
          return row;
        });
      }
    });
    setClients(newClients);
    setWorkers(newWorkers);
    setTasks(newTasks);
    // Validate all
    const allErrors = [
      ...validateClients(newClients),
      ...validateWorkers(newWorkers),
      ...validateTasks(newTasks),
    ];
    setErrors(allErrors);
    setSuggestions([]);
    setMessage(
      applied > 0
        ? `Applied all fixes to ${applied} row(s).`
        : "No matching rows found.",
    );
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-8">
      <div className="flex items-center gap-3 mb-3">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          AI Error Correction
        </h4>
        <button
          onClick={fetchSuggestions}
          className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          disabled={loading || !dataLoaded}
          title={
            !dataLoaded ? "Upload data to enable AI error correction." : ""
          }
        >
          {loading ? "Loading..." : "Suggest Error Fixes"}
        </button>
        {suggestions.length > 0 && (
          <button
            onClick={handleApplyAll}
            className="px-4 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
            disabled={!dataLoaded}
            title={
              !dataLoaded ? "Upload data to enable AI error correction." : ""
            }
          >
            Apply All
          </button>
        )}
      </div>
      {!dataLoaded && (
        <div className="text-yellow-700 dark:text-yellow-200 mb-2 text-sm">
          Upload data to enable AI error correction features.
        </div>
      )}
      {message && <div className="text-green-600 mb-2 text-sm">{message}</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {suggestions.length === 0 && !loading && (
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          No suggestions yet. Click 'Suggest Error Fixes' to get AI-powered
          corrections.
        </div>
      )}
      <ul className="space-y-3">
        {suggestions.map((fix, i) => (
          <li
            key={i}
            className="bg-white dark:bg-gray-800 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex-1">
              <div className="text-sm text-gray-800 dark:text-gray-100 font-mono">
                {JSON.stringify(fix.update)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                {fix.reason}
              </div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => handleApply(fix)}
                className="px-3 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                disabled={!dataLoaded}
                title={
                  !dataLoaded
                    ? "Upload data to enable AI error correction."
                    : ""
                }
              >
                Apply
              </button>
              <button
                onClick={() => handleDismiss(fix)}
                className="px-3 py-1 rounded bg-gray-400 text-white font-semibold hover:bg-gray-600"
                disabled={!dataLoaded}
                title={
                  !dataLoaded
                    ? "Upload data to enable AI error correction."
                    : ""
                }
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
