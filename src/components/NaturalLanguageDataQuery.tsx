import { useState } from "react";
import generateFromGemini from "../lib/gemini";

interface NaturalLanguageDataQueryProps {
  onFilter: (filterRule: any) => void;
  onClear: () => void;
  filter: any;
}

// Schema for mapping and prompt
const SCHEMA = `
SCHEMA:
clients: [ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON]
workers: [WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel]
tasks: [TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent]
`;

// Field mapping for synonyms and lowercase
const FIELD_MAP: Record<string, Record<string, string>> = {
  clients: {
    priority: "PriorityLevel",
    prioritylevel: "PriorityLevel",
    group: "GroupTag",
    groupname: "GroupTag",
    name: "ClientName",
    id: "ClientID",
    clientid: "ClientID",
    requestedtasks: "RequestedTaskIDs",
    attributes: "AttributesJSON",
  },
  workers: {
    name: "WorkerName",
    id: "WorkerID",
    workerid: "WorkerID",
    skills: "Skills",
    group: "WorkerGroup",
    groupname: "WorkerGroup",
    available: "AvailableSlots",
    maxload: "MaxLoadPerPhase",
    qualification: "QualificationLevel",
  },
  tasks: {
    name: "TaskName",
    id: "TaskID",
    taskid: "TaskID",
    category: "Category",
    duration: "Duration",
    requiredskills: "RequiredSkills",
    preferredphases: "PreferredPhases",
    maxconcurrent: "MaxConcurrent",
  },
};

function safeParseJSON(str: string): any {
  // Try to fix common Gemini output issues: unquoted keys, single quotes, trailing commas
  try {
    // Replace single quotes with double quotes
    let fixed = str.replace(/'/g, '"');
    // Add quotes around unquoted keys
    fixed = fixed.replace(/([{,\s])(\w+):/g, '$1"$2":');
    // Remove trailing commas
    fixed = fixed.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(fixed);
  } catch (e) {
    return null;
  }
}

function mapFields(
  table: string,
  filter: Record<string, any>,
): Record<string, any> {
  if (!FIELD_MAP[table]) return filter;
  const mapped: Record<string, any> = {};
  for (const key in filter) {
    const norm = key.toLowerCase().replace(/\s/g, "");
    mapped[FIELD_MAP[table][norm] || key] = filter[key];
  }
  return mapped;
}

function inferTableFromFilter(filter: Record<string, any>): string | null {
  const allFields = Object.entries(FIELD_MAP).flatMap(([table, map]) =>
    Object.values(map).map((field) => [table, field] as [string, string]),
  );
  for (const key in filter) {
    for (const [table, field] of allFields) {
      if (field.toLowerCase() === key.toLowerCase()) {
        return table;
      }
    }
  }
  return null;
}

export default function NaturalLanguageDataQuery({
  onFilter,
  onClear,
  filter,
}: NaturalLanguageDataQueryProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Special case: show only rows with errors
      const q = query.toLowerCase();
      if (q.includes("error") || q.includes("invalid")) {
        let table: string | null = null;
        if (q.includes("client")) table = "clients";
        else if (q.includes("worker")) table = "workers";
        else if (q.includes("task")) table = "tasks";
        // If not specified, default to all tables (handled in DataTablesSection)
        onFilter({ table, filter: { __showErrors: true } });
        setQuery("");
        setLoading(false);
        return;
      }
      const geminiPrompt = `${SCHEMA}\nConvert the following user query into a JSON filter rule for this resource allocation system.\nQuery: "${query}"\nReturn only the JSON object, no explanation.\nAlways include the 'table' property (clients, workers, or tasks) and a 'filter' object using the exact field names from the schema.\nExample: { table: \"clients\", filter: { \"PriorityLevel\": 5 } }`;
      const response = await generateFromGemini(geminiPrompt);
      console.log("Gemini raw response:", response);
      const match = response.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON object found in Gemini response.");
      let filterRule = safeParseJSON(match[0]);
      if (filterRule && !filterRule.table && filterRule.filter) {
        // Try to infer table
        const inferred = inferTableFromFilter(filterRule.filter);
        if (inferred) {
          filterRule.table = inferred;
          console.log("Inferred table:", inferred);
        }
      }
      if (!filterRule || !filterRule.table || !filterRule.filter) {
        throw new Error("Gemini response did not contain a valid filter rule.");
      }
      // Map fields to schema
      filterRule.filter = mapFields(filterRule.table, filterRule.filter);
      console.log("Mapped filter rule:", filterRule);
      onFilter(filterRule);
      setQuery("");
    } catch (err: any) {
      setError(err.message || "Failed to parse filter from Gemini response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a data question (e.g. 'Show all clients with PriorityLevel 5')"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          required
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={loading || !query.trim()}
        >
          {loading ? "Querying..." : "Filter with AI"}
        </button>
        {filter && (
          <button
            type="button"
            onClick={onClear}
            className="px-5 py-2 rounded-lg bg-gray-500 text-white font-semibold shadow hover:bg-gray-700 transition-colors"
          >
            Clear Filter
          </button>
        )}
      </div>
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </form>
  );
}
