import { RuleBuilder } from "./RuleBuilder";
import NaturalLanguageRuleInput from "./NaturalLanguageRuleInput";
import AISuggestedRules from "./AISuggestedRules";

/**
 * Props interface for the RuleSection component
 *
 * Defines the properties required for the business rules management functionality,
 * including rule data, callbacks for rule operations, and loading state.
 */
interface RuleSectionProps {
  /** Array of business rules currently defined */
  rules: any[];
  /** Callback function to add a new rule */
  onAddRule: (rule: any) => void;
  /** Callback function to delete a rule by index */
  onDeleteRule: (i: number) => void;
  /** Boolean indicating if data has been loaded and rule features are available */
  dataLoaded: boolean;
}

/**
 * RuleSection component for managing business rules and data validation logic
 *
 * This component provides a comprehensive interface for creating, managing, and
 * exporting business rules. It includes multiple rule creation methods and AI-powered
 * rule suggestions based on the loaded data.
 *
 * Features:
 * - Natural language rule input
 * - Visual rule builder interface
 * - AI-powered rule suggestions
 * - Rule export functionality
 * - Rule deletion with confirmation
 * - Conditional rendering based on data availability
 *
 * @param {RuleSectionProps} props - Component properties
 * @returns {JSX.Element} Business rules management interface
 *
 * @example
 * <RuleSection
 *   rules={businessRules}
 *   onAddRule={handleAddRule}
 *   onDeleteRule={handleDeleteRule}
 *   dataLoaded={true}
 * />
 */
export default function RuleSection({
  rules,
  onAddRule,
  onDeleteRule,
  dataLoaded,
}: RuleSectionProps) {
  /**
   * Exports the current business rules to a JSON file
   *
   * Creates a downloadable JSON file containing all current business rules
   * for backup, sharing, or version control purposes.
   */
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

  // Get data from window for AI suggestions (temporary implementation)
  // TODO: Pass data as props from parent component instead of accessing window
  const clients =
    (typeof window !== "undefined" && (window as any).clients) || [];
  const workers =
    (typeof window !== "undefined" && (window as any).workers) || [];
  const tasks = (typeof window !== "undefined" && (window as any).tasks) || [];

  return (
    <section className="my-8 bg-gray-800 rounded-lg p-6 shadow-lg">
      {/* Natural language rule input interface */}
      <NaturalLanguageRuleInput onAddRule={onAddRule} dataLoaded={dataLoaded} />

      {/* Visual rule builder interface */}
      <RuleBuilder onAddRule={onAddRule} dataLoaded={dataLoaded} />

      {/* Current rules display and management */}
      <div className="mb-6 mt-4">
        <h3 className="text-lg font-semibold mb-2 text-white">
          📜 Current Rules:
        </h3>

        {/* List of current rules with delete functionality */}
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-300">
          {rules.map((r, i) => (
            <li key={i} className="flex items-center gap-2">
              <span>{JSON.stringify(r)}</span>

              {/* Delete rule button */}
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

      {/* Export rules button - only shown if rules exist */}
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

      {/* Prompt to upload data when no data is loaded */}
      {!dataLoaded && (
        <div className="text-yellow-200 mt-4">
          Upload data to enable rule features.
        </div>
      )}

      {/* AI-powered rule suggestions */}
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
