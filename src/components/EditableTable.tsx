"use client";
import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import { ValidationError } from "../lib/validate";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";
import type { GridRowModel, GridEventListener } from "@mui/x-data-grid";

/**
 * Props interface for the EditableTable component
 *
 * Defines the properties required for the editable data table functionality,
 * including data, column definitions, error handling, and edit callbacks.
 */
interface Props {
  /** Array of data rows to display in the table */
  rows: any[];
  /** Column definitions for the table structure */
  columns: GridColDef[];
  /** Name of the table for error filtering and display */
  tableName: string;
  /** Array of validation errors to highlight in the table */
  errors: ValidationError[];
  /** Callback function triggered when a cell is edited */
  onCellEditCommit: (id: number, field: string, value: any) => void;
}

/**
 * EditableTable component for displaying and editing tabular data
 *
 * This component provides a fully interactive data table with inline editing
 * capabilities, error highlighting, and responsive design. It uses Material-UI's
 * DataGrid for robust table functionality with custom styling and error handling.
 *
 * Features:
 * - Inline cell editing with validation
 * - Error highlighting with tooltips
 * - Dark mode support
 * - Responsive design
 * - Hover effects and visual feedback
 * - Automatic row height adjustment
 *
 * @param {Props} props - Component properties
 * @returns {JSX.Element} Interactive data table
 *
 * @example
 * <EditableTable
 *   rows={clientData}
 *   columns={clientColumns}
 *   tableName="clients"
 *   errors={validationErrors}
 *   onCellEditCommit={handleCellEdit}
 * />
 */
export const EditableTable: React.FC<Props> = ({
  rows,
  columns,
  tableName,
  errors,
  onCellEditCommit,
}) => {
  // Configure MUI DataGrid dark mode based on parent theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const html = document.documentElement;
      if (html.classList.contains("dark")) {
        document.body.setAttribute("data-mui-color-scheme", "dark");
      } else {
        document.body.removeAttribute("data-mui-color-scheme");
      }
    }
  }, []);

  // Enhance columns with error highlighting and custom cell rendering
  const enhancedColumns: GridColDef[] = columns.map((col) => ({
    ...col,
    editable: true,

    // Add error styling to cells with validation errors
    cellClassName: (params) => {
      const err = errors.find(
        (e) =>
          e.table === tableName &&
          e.row === params.id &&
          e.field === params.field,
      );
      return err ? "error-cell" : "";
    },

    // Custom cell rendering with error tooltips
    renderCell: (params) => {
      const error = errors.find(
        (e) =>
          e.table === tableName &&
          e.row === params.id &&
          e.field === params.field,
      );
      const value = params.value ?? "";

      // Render cell with error tooltip if validation error exists
      return error ? (
        <Tooltip title={error.message} arrow placement="top">
          <div className="w-full h-full px-2 text-red-700 font-semibold truncate">
            {value}
          </div>
        </Tooltip>
      ) : (
        <div className="w-full h-full px-2 truncate">{value}</div>
      );
    },
  }));

  return (
    <div className="mb-12">
      {/* Table container with styling */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        {/* Table header with visual indicator */}
        <h3 className="text-2xl font-bold mb-4 capitalize text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
          {tableName} Table
        </h3>

        {/* DataGrid container with horizontal scroll support */}
        <div className="overflow-x-auto">
          <DataGrid
            rows={rows}
            columns={enhancedColumns}
            // Custom row ID resolution for different data types
            getRowId={(row) =>
              row.ClientID || row.WorkerID || row.TaskID || row.id
            }
            // Handle row updates and trigger edit callback
            processRowUpdate={(newRow: GridRowModel, oldRow: GridRowModel) => {
              // Find the changed field by comparing old and new row data
              const changedField = Object.keys(newRow).find(
                (key) => newRow[key] !== oldRow[key],
              );
              if (changedField) {
                onCellEditCommit(
                  newRow.id as number,
                  changedField,
                  newRow[changedField],
                );
              }
              return newRow;
            }}
            // Table configuration
            autoHeight
            disableRowSelectionOnClick
            // Custom styling for light and dark themes
            sx={{
              // Row styling with hover effects
              "& .MuiDataGrid-row": {
                transition: "background 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(59,130,246,0.08)",
                },
                "&:nth-of-type(even)": {
                  backgroundColor: "rgba(243,244,246,1)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(59,130,246,0.15) !important",
                },
              },

              // Inherit theme colors
              "& .MuiDataGrid-root, & .MuiDataGrid-cell": {
                backgroundColor: "inherit",
                color: "inherit",
              },

              // Light theme header styling
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f1f5f9",
                color: "#1e293b",
                fontWeight: 700,
              },

              // Dark theme header styling
              '&[data-mui-color-scheme="dark"] .MuiDataGrid-columnHeaders': {
                backgroundColor: "#1e293b",
                color: "#f1f5f9",
              },

              // Dark theme row styling
              '&[data-mui-color-scheme="dark"] .MuiDataGrid-row': {
                backgroundColor: "#1e293b",
                "&:nth-of-type(even)": {
                  backgroundColor: "#111827",
                },
                "&:hover": {
                  backgroundColor: "#2563eb22",
                },
              },

              // Error cell highlighting for light theme
              "& .error-cell": {
                backgroundColor: "#fee2e2 !important", // Tailwind bg-red-100
                color: "#b91c1c !important", // Tailwind text-red-700
                fontWeight: 600,
              },

              // Error cell highlighting for dark theme
              '&[data-mui-color-scheme="dark"] .error-cell': {
                backgroundColor: "#7f1d1d !important", // Tailwind bg-red-900
                color: "#fee2e2 !important", // Tailwind text-red-100
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
