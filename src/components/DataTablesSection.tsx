import { useState } from "react";
import { EditableTable } from "./EditableTable";
import { GridColDef } from "@mui/x-data-grid";
import NaturalLanguageDataQuery from "./NaturalLanguageDataQuery";

/**
 * Props interface for the DataTablesSection component
 *
 * Defines the properties required for displaying and managing data tables,
 * including data arrays, error handling, and update callbacks.
 */
interface DataTablesSectionProps {
  /** Array of client records to display */
  clients: any[];
  /** Array of worker records to display */
  workers: any[];
  /** Array of task records to display */
  tasks: any[];
  /** Array of validation errors to highlight in tables */
  errors: any[];
  /** Callback function to update table rows */
  updateRow: (
    table: "clients" | "workers" | "tasks",
    id: number,
    field: string,
    value: any,
  ) => void;
  /** Boolean indicating if data has been loaded */
  dataLoaded?: boolean;
}

// Column definitions for the clients data table
const clientCols: GridColDef[] = [
  { field: "ClientID", headerName: "Client ID", width: 150, editable: true },
  { field: "ClientName", headerName: "Name", width: 150, editable: true },
  {
    field: "PriorityLevel",
    headerName: "Priority (1–5)",
    width: 150,
    editable: true,
  },
  {
    field: "RequestedTaskIDs",
    headerName: "Task IDs",
    width: 200,
    editable: true,
  },
  { field: "GroupTag", headerName: "Group", width: 150, editable: true },
  {
    field: "AttributesJSON",
    headerName: "Attributes JSON",
    width: 200,
    editable: true,
  },
];

// Column definitions for the workers data table
const workerCols: GridColDef[] = [
  { field: "WorkerID", headerName: "Worker ID", width: 150, editable: true },
  { field: "WorkerName", headerName: "Name", width: 150, editable: true },
  { field: "Skills", headerName: "Skills", width: 200, editable: true },
  {
    field: "AvailableSlots",
    headerName: "Available Slots",
    width: 200,
    editable: true,
  },
  {
    field: "MaxLoadPerPhase",
    headerName: "Max Load",
    width: 150,
    editable: true,
  },
  { field: "WorkerGroup", headerName: "Group", width: 150, editable: true },
  {
    field: "QualificationLevel",
    headerName: "Level",
    width: 150,
    editable: true,
  },
];

// Column definitions for the tasks data table
const taskCols: GridColDef[] = [
  { field: "TaskID", headerName: "Task ID", width: 150, editable: true },
  { field: "TaskName", headerName: "Name", width: 150, editable: true },
  { field: "Category", headerName: "Category", width: 150, editable: true },
  { field: "Duration", headerName: "Duration", width: 120, editable: true },
  { field: "RequiredSkills", headerName: "Skills", width: 200, editable: true },
  {
    field: "PreferredPhases",
    headerName: "Phases",
    width: 200,
    editable: true,
  },
  {
    field: "MaxConcurrent",
    headerName: "Concurrent",
    width: 150,
    editable: true,
  },
];

/**
 * DataTablesSection component for displaying and managing data tables
 *
 * This component provides a comprehensive interface for viewing and editing
 * client, worker, and task data. It includes filtering capabilities, error
 * highlighting, and natural language query support.
 *
 * Features:
 * - Interactive data tables with inline editing
 * - Advanced filtering with natural language queries
 * - Error highlighting for data validation issues
 * - Responsive design with Material-UI DataGrid
 * - Support for complex filter operations (>, <, =, contains)
 *
 * @param {DataTablesSectionProps} props - Component properties
 * @returns {JSX.Element} Data tables interface with filtering capabilities
 *
 * @example
 * <DataTablesSection
 *   clients={clientData}
 *   workers={workerData}
 *   tasks={taskData}
 *   errors={validationErrors}
 *   updateRow={handleRowUpdate}
 *   dataLoaded={true}
 * />
 */
export default function DataTablesSection({
  clients,
  workers,
  tasks,
  errors,
  updateRow,
  dataLoaded = true,
}: DataTablesSectionProps) {
  // State management for filtering functionality
  const [filter, setFilter] = useState<any>(null);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [filteredTable, setFilteredTable] = useState<string>("");

  /**
   * Applies filtering logic to data tables based on filter criteria
   *
   * This function handles complex filtering operations including:
   * - Error-only filtering (__showErrors)
   * - Numeric comparisons (>, <, =)
   * - String matching (case-insensitive)
   * - Array/CSV field searching
   * - Multiple condition filtering
   *
   * @param {string} table - The table to filter (clients, workers, tasks)
   * @param {any} filter - The filter criteria to apply
   * @returns {any[]} Filtered array of rows
   */
  const getFiltered = (table: string, filter: any) => {
    if (!filter) return [];

    // Special case: show only rows with errors
    if (filter.filter && filter.filter.__showErrors) {
      let rows = [];
      let tableErrors = errors;

      // Select the appropriate data array based on table type
      if (table === "clients") rows = clients;
      if (table === "workers") rows = workers;
      if (table === "tasks") rows = tasks;

      // Get all row IDs with errors for this table
      const errorRowIds = tableErrors
        .filter((e) => !table || e.table === table)
        .map((e) => e.row);

      // Return only rows whose ID is in the error list
      return rows.filter((row) =>
        errorRowIds.includes(
          row.ClientID || row.WorkerID || row.TaskID || row.id,
        ),
      );
    }

    if (!filter.filter) return [];

    let rows = [];
    // Select the appropriate data array based on table type
    if (table === "clients") rows = clients;
    if (table === "workers") rows = workers;
    if (table === "tasks") rows = tasks;

    // Enhanced filter: all keys must match (AND logic)
    return rows.filter((row) => {
      return Object.entries(filter.filter).every(([key, value]) => {
        if (key === "__showErrors") return true; // Skip special key

        const rowVal = row[key];

        // Handle numeric comparisons with string format (e.g., ">5", "<10")
        if (typeof value === "string" && value.startsWith(">")) {
          const num = parseFloat((value as string).slice(1));
          return parseFloat(rowVal) > num;
        }
        if (typeof value === "string" && value.startsWith("<")) {
          const num = parseFloat((value as string).slice(1));
          return parseFloat(rowVal) < num;
        }

        // Handle numeric comparisons with object format (e.g., { $gt: 2 }, { $lt: 3 })
        if (typeof value === "object" && value !== null) {
          if ("$gt" in value) {
            return parseFloat(rowVal) > parseFloat(String(value["$gt"]));
          }
          if ("$lt" in value) {
            return parseFloat(rowVal) < parseFloat(String(value["$lt"]));
          }
          if ("$eq" in value) {
            return parseFloat(rowVal) === parseFloat(String(value["$eq"]));
          }
        }

        // Handle array field searching (case-insensitive)
        if (Array.isArray(rowVal)) {
          return rowVal
            .map((v) => v.toString().toLowerCase())
            .includes((value as string).toLowerCase());
        }

        // Handle comma-separated string field searching
        if (typeof rowVal === "string" && rowVal.includes(",")) {
          return rowVal
            .split(",")
            .map((v) => v.trim().toLowerCase())
            .includes((value as string).toLowerCase());
        }

        // Handle case-insensitive string matching
        if (typeof rowVal === "string" && typeof value === "string") {
          return rowVal.toLowerCase() === (value as string).toLowerCase();
        }

        // Fallback: loose equality comparison
        return rowVal == value;
      });
    });
  };

  /**
   * Handles filter application based on filter rules
   *
   * @param {any} filterRule - The filter rule to apply
   */
  const handleFilter = (filterRule: any) => {
    if (!filterRule || !filterRule.table) return;
    setFilter(filterRule);
    setFilteredTable(filterRule.table);
    setFilteredRows(getFiltered(filterRule.table, filterRule));
  };

  /**
   * Clears all active filters and resets to show all data
   */
  const handleClear = () => {
    setFilter(null);
    setFilteredRows([]);
    setFilteredTable("");
  };

  return (
    <section className="space-y-8 my-8">
      {/* Natural language query interface for filtering */}
      <NaturalLanguageDataQuery
        onFilter={handleFilter}
        onClear={handleClear}
        filter={filter}
      />

      {/* Active filter display */}
      {filter && (
        <div className="mb-2 text-sm text-blue-700 dark:text-blue-300">
          <span className="font-semibold">Filter:</span>{" "}
          {JSON.stringify(filter.filter)} on{" "}
          {filter && typeof filter.filter === "object"
            ? JSON.stringify(filter.filter)
            : "Invalid filter"}{" "}
          on <span className="font-semibold">{filter.table}</span>
        </div>
      )}
      {(!filter || filteredTable === "clients") && clients.length > 0 && (
        <>
          <EditableTable
            rows={
              filter && filteredTable === "clients" ? filteredRows : clients
            }
            columns={clientCols}
            tableName="clients"
            errors={errors}
            onCellEditCommit={(id, field, value) =>
              updateRow("clients", id, field, value)
            }
          />
          {filter &&
            filteredTable === "clients" &&
            filteredRows.length === 0 && (
              <div className="text-center text-red-500 mt-2">
                No matching clients found for this filter.
              </div>
            )}
        </>
      )}
      {(!filter || filteredTable === "workers") && workers.length > 0 && (
        <>
          <EditableTable
            rows={
              filter && filteredTable === "workers" ? filteredRows : workers
            }
            columns={workerCols}
            tableName="workers"
            errors={errors}
            onCellEditCommit={(id, field, value) =>
              updateRow("workers", id, field, value)
            }
          />
          {filter &&
            filteredTable === "workers" &&
            filteredRows.length === 0 && (
              <div className="text-center text-red-500 mt-2">
                No matching workers found for this filter.
              </div>
            )}
        </>
      )}
      {(!filter || filteredTable === "tasks") && tasks.length > 0 && (
        <>
          <EditableTable
            rows={filter && filteredTable === "tasks" ? filteredRows : tasks}
            columns={taskCols}
            tableName="tasks"
            errors={errors}
            onCellEditCommit={(id, field, value) =>
              updateRow("tasks", id, field, value)
            }
          />
          {filter && filteredTable === "tasks" && filteredRows.length === 0 && (
            <div className="text-center text-red-500 mt-2">
              No matching tasks found for this filter.
            </div>
          )}
        </>
      )}
    </section>
  );
}
