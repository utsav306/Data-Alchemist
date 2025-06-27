import { useState } from "react";
import generateFromGemini from "../lib/gemini";

interface NaturalLanguageDataModificationProps {
  clients: any[];
  setClients: (rows: any[]) => void;
  workers: any[];
  setWorkers: (rows: any[]) => void;
  tasks: any[];
  setTasks: (rows: any[]) => void;
  dataLoaded?: boolean;
}

export default function NaturalLanguageDataModification({
  clients,
  setClients,
  workers,
  setWorkers,
  tasks,
  setTasks,
  dataLoaded = true,
}: NaturalLanguageDataModificationProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const schema = `SCHEMA:\nclients: [ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON]\nworkers: [WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel]\ntasks: [TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent]`;
      const prompt = `${schema}\nConvert the following user instruction into a JSON modification object.\nInstruction: "${input}"\nReturn only a JSON object, no explanation.\nExample: { table: "clients", filter: { "ClientID": "C1" }, update: { "PriorityLevel": 5 } }`;
      const response = await generateFromGemini(prompt);
      const match = response.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON object found in Gemini response.");
      const mod = JSON.parse(match[0].replace(/([a-zA-Z0-9_]+):/g, '"$1":'));
      if (!mod.table || !mod.filter || !mod.update)
        throw new Error("Gemini response missing table, filter, or update.");
      let updated = 0;
      if (mod.table === "clients") {
        setClients(
          clients.map((row) => {
            const match = Object.entries(mod.filter).every(
              ([k, v]) => row[k] == v,
            );
            if (match) {
              updated++;
              return { ...row, ...mod.update };
            }
            return row;
          }),
        );
      } else if (mod.table === "workers") {
        setWorkers(
          workers.map((row) => {
            const match = Object.entries(mod.filter).every(
              ([k, v]) => row[k] == v,
            );
            if (match) {
              updated++;
              return { ...row, ...mod.update };
            }
            return row;
          }),
        );
      } else if (mod.table === "tasks") {
        setTasks(
          tasks.map((row) => {
            const match = Object.entries(mod.filter).every(
              ([k, v]) => row[k] == v,
            );
            if (match) {
              updated++;
              return { ...row, ...mod.update };
            }
            return row;
          }),
        );
      } else {
        throw new Error("Unknown table: " + mod.table);
      }
      setMessage(
        updated > 0
          ? `Updated ${updated} row(s) in ${mod.table}.`
          : "No matching rows found.",
      );
      setInput("");
    } catch (err: any) {
      setError(err.message || "Failed to parse Gemini response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Modify data (e.g. 'Set PriorityLevel of client C1 to 5')"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || !dataLoaded}
          required
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={loading || !input.trim() || !dataLoaded}
          title={!dataLoaded ? "Upload data to enable AI modification." : ""}
        >
          {loading ? "Modifying..." : "Modify with AI"}
        </button>
      </div>
      {message && <div className="text-green-600 mt-2 text-sm">{message}</div>}
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      {!dataLoaded && (
        <div className="text-yellow-600 mt-2 text-sm">
          Upload data to enable AI modification.
        </div>
      )}
    </form>
  );
}
