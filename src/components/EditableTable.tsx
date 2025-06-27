"use client";
import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import { ValidationError } from "../lib/validate";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";
import type { GridRowModel, GridEventListener } from "@mui/x-data-grid";

interface Props {
  rows: any[];
  columns: GridColDef[];
  tableName: string;
  errors: ValidationError[];
  onCellEditCommit: (id: number, field: string, value: any) => void;
}

export const EditableTable: React.FC<Props> = ({
  rows,
  columns,
  tableName,
  errors,
  onCellEditCommit,
}) => {
  // Set MUI DataGrid dark mode if parent is dark
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

  const enhancedColumns: GridColDef[] = columns.map((col) => ({
    ...col,
    editable: true,
    cellClassName: (params) => {
      const err = errors.find(
        (e) =>
          e.table === tableName &&
          e.row === params.id &&
          e.field === params.field,
      );
      return err ? "error-cell" : "";
    },
    renderCell: (params) => {
      const error = errors.find(
        (e) =>
          e.table === tableName &&
          e.row === params.id &&
          e.field === params.field,
      );
      const value = params.value ?? "";

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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold mb-4 capitalize text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
          {tableName} Table
        </h3>
        <div className="overflow-x-auto">
          <DataGrid
            rows={rows}
            columns={enhancedColumns}
            getRowId={(row) =>
              row.ClientID || row.WorkerID || row.TaskID || row.id
            }
            processRowUpdate={(newRow: GridRowModel, oldRow: GridRowModel) => {
              // Find the changed field
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
            autoHeight
            disableRowSelectionOnClick
            sx={{
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
              "& .MuiDataGrid-root, & .MuiDataGrid-cell": {
                backgroundColor: "inherit",
                color: "inherit",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f1f5f9",
                color: "#1e293b",
                fontWeight: 700,
              },
              '&[data-mui-color-scheme="dark"] .MuiDataGrid-columnHeaders': {
                backgroundColor: "#1e293b",
                color: "#f1f5f9",
              },
              '&[data-mui-color-scheme="dark"] .MuiDataGrid-row': {
                backgroundColor: "#1e293b",
                "&:nth-of-type(even)": {
                  backgroundColor: "#111827",
                },
                "&:hover": {
                  backgroundColor: "#2563eb22",
                },
              },
              // Error cell highlight (light and dark)
              "& .error-cell": {
                backgroundColor: "#fee2e2 !important", // Tailwind bg-red-100
                color: "#b91c1c !important", // Tailwind text-red-700
                fontWeight: 600,
              },
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
