"use client";

import { useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

type RuleType = "co-run" | "exclude" | "phase-limit";

interface Rule {
  type: RuleType;
  task1?: string;
  task2?: string;
  worker?: string;
  maxPhases?: number;
  weight?: number; // NEW
}

interface RuleBuilderProps {
  onAddRule: (rule: Rule) => void;
dataLoaded: boolean;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({ onAddRule }) => {
  const [type, setType] = useState<RuleType>("co-run");
  const [task1, setTask1] = useState("");
  const [task2, setTask2] = useState("");
  const [worker, setWorker] = useState("");
  const [maxPhases, setMaxPhases] = useState("");
  const [weight, setWeight] = useState(1); // NEW

  const handleAdd = () => {
    const rule: Rule = { type, weight };

    if (type === "co-run") {
      rule.task1 = task1;
      rule.task2 = task2;
    } else if (type === "exclude") {
      rule.worker = worker;
      rule.task1 = task1;
    } else if (type === "phase-limit") {
      rule.task1 = task1;
      rule.maxPhases = Number(maxPhases);
    }

    onAddRule(rule);

    // Reset fields
    setTask1("");
    setTask2("");
    setWorker("");
    setMaxPhases("");
    setWeight(1); // NEW
  };

  return (
    <div className="border p-6 rounded-xl mb-8 bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Add New Rule
        </h2>
      </div>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rule Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as RuleType)}
            className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
          >
            <option value="co-run">Co-Run</option>
            <option value="exclude">Exclude Worker</option>
            <option value="phase-limit">Phase Limit</option>
          </select>
        </div>
        {type === "co-run" && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task 1
              </label>
              <input
                placeholder="Task 1"
                value={task1}
                onChange={(e) => setTask1(e.target.value)}
                className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task 2
              </label>
              <input
                placeholder="Task 2"
                value={task2}
                onChange={(e) => setTask2(e.target.value)}
                className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              />
            </div>
          </>
        )}
        {type === "exclude" && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Worker
              </label>
              <input
                placeholder="Worker"
                value={worker}
                onChange={(e) => setWorker(e.target.value)}
                className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task
              </label>
              <input
                placeholder="Task"
                value={task1}
                onChange={(e) => setTask1(e.target.value)}
                className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              />
            </div>
          </>
        )}
        {type === "phase-limit" && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task
              </label>
              <input
                placeholder="Task"
                value={task1}
                onChange={(e) => setTask1(e.target.value)}
                className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Phases
              </label>
              <input
                placeholder="Max Phases"
                value={maxPhases}
                onChange={(e) => setMaxPhases(e.target.value)}
                type="number"
                className="border rounded px-3 py-2 w-28 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              />
            </div>
          </>
        )}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weight (0–1)
          </label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.1}
            placeholder="Weight (0–1)"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="border rounded px-3 py-2 w-36 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors mt-4"
        >
          <PlusCircleIcon className="h-5 w-5" /> Add Rule
        </button>
      </div>
    </div>
  );
};
