import { exportToCSV } from "../lib/exportToCSV";
import Tooltip from "@mui/material/Tooltip";

interface ExportButtonsProps {
  clients: any[];
  workers: any[];
  tasks: any[];
  rules: any[];
  errors: any[];
  dataLoaded: boolean;
}

export default function ExportButtons({
  clients,
  workers,
  tasks,
  errors,
  dataLoaded,
}: ExportButtonsProps) {
  const hasErrors = errors.length > 0;
  const disabled = !dataLoaded || hasErrors;
  const tooltipMsg = !dataLoaded
    ? "Upload data to enable export."
    : hasErrors
    ? "Fix all validation errors before exporting."
    : "";
  return (
    <div className="flex flex-wrap gap-3 mt-8">
      {clients.length > 0 && (
        <Tooltip
          title={tooltipMsg}
          arrow
          disableHoverListener={tooltipMsg === ""}
        >
          <span>
            <button
              onClick={() => exportToCSV(clients, "clients")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-60"
              disabled={disabled}
            >
              📤 Export Clients CSV
            </button>
          </span>
        </Tooltip>
      )}
      {workers.length > 0 && (
        <Tooltip
          title={tooltipMsg}
          arrow
          disableHoverListener={tooltipMsg === ""}
        >
          <span>
            <button
              onClick={() => exportToCSV(workers, "workers")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-60"
              disabled={disabled}
            >
              📤 Export Workers CSV
            </button>
          </span>
        </Tooltip>
      )}
      {tasks.length > 0 && (
        <Tooltip
          title={tooltipMsg}
          arrow
          disableHoverListener={tooltipMsg === ""}
        >
          <span>
            <button
              onClick={() => exportToCSV(tasks, "tasks")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-60"
              disabled={disabled}
            >
              📤 Export Tasks CSV
            </button>
          </span>
        </Tooltip>
      )}
    </div>
  );
}
