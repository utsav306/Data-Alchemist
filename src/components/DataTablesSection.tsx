import { useState } from "react";
import { EditableTable } from "./EditableTable";
import { GridColDef } from "@mui/x-data-grid";
import NaturalLanguageDataQuery from "./NaturalLanguageDataQuery";

interface DataTablesSectionProps {
  clients: any[];
  workers: any[];
  tasks: any[];
  errors: any[];
  updateRow: (
    table: "clients" | "workers" | "tasks",
    id: number,
    field: string,
    value: any,
  ) => void;
  dataLoaded?: boolean;
}

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

export default function DataTablesSection({
  clients,
  workers,
  tasks,
  errors,
  updateRow,
  dataLoaded = true,
}: DataTablesSectionProps) {
  const [filter, setFilter] = useState<any>(null);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [filteredTable, setFilteredTable] = useState<string>("");

  // Filtering logic
  const getFiltered = (table: string, filter: any) => {
    if (!filter) return [];
    if (filter.filter && filter.filter.__showErrors) {
      // Show only rows with errors for the selected table
      let rows = [];
      let tableErrors = errors;
      if (table === "clients") rows = clients;
      if (table === "workers") rows = workers;
      if (table === "tasks") rows = tasks;
      // Get all row IDs with errors for this table
      const errorRowIds = tableErrors
        .filter((e) => !table || e.table === table)
        .map((e) => e.row);
      // Only show rows whose ID is in errorRowIds
      return rows.filter((row) =>
        errorRowIds.includes(
          row.ClientID || row.WorkerID || row.TaskID || row.id,
        ),
      );
    }
    if (!filter.filter) return [];
    let rows = [];
    if (table === "clients") rows = clients;
    if (table === "workers") rows = workers;
    if (table === "tasks") rows = tasks;
    // Enhanced filter: all keys must match
    return rows.filter((row) => {
      return Object.entries(filter.filter).every(([key, value]) => {
        if (key === "__showErrors") return true; // skip special key
        const rowVal = row[key];
        // Numeric comparison: string format
        if (typeof value === "string" && value.startsWith(">")) {
          const num = parseFloat((value as string).slice(1));
          return parseFloat(rowVal) > num;
        }
        if (typeof value === "string" && value.startsWith("<")) {
          const num = parseFloat((value as string).slice(1));
          return parseFloat(rowVal) < num;
        }
        // Numeric comparison: object format { $gt: 2 }, { $lt: 3 }
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
        // Array or comma-separated string contains
        if (Array.isArray(rowVal)) {
          return rowVal
            .map((v) => v.toString().toLowerCase())
            .includes((value as string).toLowerCase());
        }
        if (typeof rowVal === "string" && rowVal.includes(",")) {
          return rowVal
            .split(",")
            .map((v) => v.trim().toLowerCase())
            .includes((value as string).toLowerCase());
        }
        // Case-insensitive string match
        if (typeof rowVal === "string" && typeof value === "string") {
          return rowVal.toLowerCase() === (value as string).toLowerCase();
        }
        // Fallback: loose equality
        return rowVal == value;
      });
    });
  };

  const handleFilter = (filterRule: any) => {
    if (!filterRule || !filterRule.table) return;
    setFilter(filterRule);
    setFilteredTable(filterRule.table);
    setFilteredRows(getFiltered(filterRule.table, filterRule));
  };

  const handleClear = () => {
    setFilter(null);
    setFilteredRows([]);
    setFilteredTable("");
  };

  return (
    <section className="space-y-8 my-8">
      <NaturalLanguageDataQuery
        onFilter={handleFilter}
        onClear={handleClear}
        filter={filter}
      />
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
