import { exportToCSV } from "../lib/exportToCSV";
import Tooltip from "@mui/material/Tooltip";

/**
 * Props interface for the ExportButtons component
 *
 * Defines the properties required for the export functionality,
 * including data arrays, validation state, and loading status.
 */
interface ExportButtonsProps {
  /** Array of client records available for export */
  clients: any[];
  /** Array of worker records available for export */
  workers: any[];
  /** Array of task records available for export */
  tasks: any[];
  /** Array of business rules available for export */
  rules: any[];
  /** Array of validation errors to check before allowing export */
  errors: any[];
  /** Boolean indicating if data has been loaded and export is available */
  dataLoaded: boolean;
}

/**
 * ExportButtons component for exporting data to CSV format
 *
 * This component provides a set of export buttons for different data types
 * (clients, workers, tasks). It includes validation checks to ensure data
 * quality before export and provides helpful tooltips for user guidance.
 *
 * Features:
 * - Conditional button rendering based on available data
 * - Validation error checking before export
 * - Helpful tooltips for disabled states
 * - Responsive design with hover effects
 * - Automatic CSV file download
 *
 * @param {ExportButtonsProps} props - Component properties
 * @returns {JSX.Element} Export buttons interface
 *
 * @example
 * <ExportButtons
 *   clients={clientData}
 *   workers={workerData}
 *   tasks={taskData}
 *   rules={businessRules}
 *   errors={validationErrors}
 *   dataLoaded={true}
 * />
 */
export default function ExportButtons({
  clients,
  workers,
  tasks,
  errors,
  dataLoaded,
}: ExportButtonsProps) {
  // Determine if there are validation errors that should prevent export
  const hasErrors = errors.length > 0;

  // Disable export buttons if no data is loaded or there are validation errors
  const disabled = !dataLoaded || hasErrors;

  // Generate appropriate tooltip message based on current state
  const tooltipMsg = !dataLoaded
    ? "Upload data to enable export."
    : hasErrors
    ? "Fix all validation errors before exporting."
    : "";

  return (
    <div className="flex flex-wrap gap-3 mt-8">
      {/* Export Clients button - only shown if client data exists */}
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

      {/* Export Workers button - only shown if worker data exists */}
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

      {/* Export Tasks button - only shown if task data exists */}
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
