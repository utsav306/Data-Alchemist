import { RuleBuilder } from "./RuleBuilder";
import NaturalLanguageRuleInput from "./NaturalLanguageRuleInput";
import AISuggestedRules from "./AISuggestedRules";

interface RuleSectionProps {
  rules: any[];
  onAddRule: (rule: any) => void;
  onDeleteRule: (i: number) => void;
  dataLoaded: boolean;
}

export default function RuleSection({
  rules,
  onAddRule,
  onDeleteRule,
  dataLoaded,
}: RuleSectionProps) {
  const exportRules = () => {
    const blob = new Blob([JSON.stringify(rules, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rules.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get data from window for suggestions (temporary, will pass as props in page.tsx)
  const clients =
    (typeof window !== "undefined" && (window as any).clients) || [];
  const workers =
    (typeof window !== "undefined" && (window as any).workers) || [];
  const tasks = (typeof window !== "undefined" && (window as any).tasks) || [];

  return (
    <section className="my-8 bg-gray-800 rounded-lg p-6 shadow-lg">
      <NaturalLanguageRuleInput onAddRule={onAddRule} dataLoaded={dataLoaded} />
      <RuleBuilder onAddRule={onAddRule} dataLoaded={dataLoaded} />
      <div className="mb-6 mt-4">
        <h3 className="text-lg font-semibold mb-2 text-white">
          📜 Current Rules:
        </h3>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-300">
          {rules.map((r, i) => (
            <li key={i} className="flex items-center gap-2">
              <span>{JSON.stringify(r)}</span>
              <button
                onClick={() => onDeleteRule(i)}
                className="ml-2 text-red-400 hover:text-red-600 disabled:opacity-60"
                disabled={!dataLoaded}
                title={
                  !dataLoaded ? "Upload data to enable rule deletion." : ""
                }
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>
      {rules.length > 0 && (
        <button
          onClick={exportRules}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-60"
          disabled={!dataLoaded}
          title={!dataLoaded ? "Upload data to enable rule export." : ""}
        >
          📥 Export Rules JSON
        </button>
      )}
      {!dataLoaded && (
        <div className="text-yellow-200 mt-4">
          Upload data to enable rule features.
        </div>
      )}
      <div className="mt-8">
        <AISuggestedRules
          clients={clients}
          workers={workers}
          tasks={tasks}
          onAddRule={onAddRule}
          dataLoaded={dataLoaded}
        />
      </div>
    </section>
  );
}
