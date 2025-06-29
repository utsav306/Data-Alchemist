"use client";

import { useState } from "react";
import FileUploader from "../components/FileUploader";
import { parseMultiSheetFile } from "../lib/parseFile";
import {
  validateClients,
  validateWorkers,
  validateTasks,
  ValidationError,
} from "../lib/validate";

import { GridColDef } from "@mui/x-data-grid";
import DataTablesSection from "../components/DataTablesSection";
import RuleSection from "../components/RuleSection";
import ExportButtons from "../components/ExportButtons";
import NaturalLanguageDataModification from "../components/NaturalLanguageDataModification";
import AIErrorCorrection from "../components/AIErrorCorrection";
import AIValidator from "../components/AIValidator";

/**
 * Main application component for Data Alchemist
 *
 * This component serves as the central hub for the data management application,
 * handling file uploads, data validation, rule management, and AI-powered features.
 * It manages the state for clients, workers, tasks, validation errors, and business rules.
 *
 * @returns {JSX.Element} The main application interface
 */
export default function Home() {
  // Core data state management
  const [clients, setClients] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [rules, setRules] = useState<any[]>([]); // Business rule objects for data validation and processing

  // File upload state management
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Derived state: determines if any data has been loaded for conditional rendering
  const dataLoaded =
    clients.length > 0 || workers.length > 0 || tasks.length > 0;

  /**
   * Handles file upload and parsing for multi-sheet Excel/CSV files
   *
   * This function processes uploaded files, extracts data from multiple sheets,
   * validates the data, and updates the application state accordingly.
   * Supports both Excel (.xlsx) and CSV file formats.
   *
   * @param {FileList} files - The files to be processed
   * @returns {Promise<void>}
   */
  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    setUploadError(null);
    setUploadedFile(files[0]?.name || null);

    try {
      // Process each file in the FileList
      for (const file of Array.from(files)) {
        const sheetData = await parseMultiSheetFile(file);

        // Update clients data and validate
        if (sheetData.clients) {
          setClients(sheetData.clients);
          setErrors((prev) => [...prev, ...validateClients(sheetData.clients)]);
        }

        // Update workers data and validate
        if (sheetData.workers) {
          setWorkers(sheetData.workers);
          setErrors((prev) => [...prev, ...validateWorkers(sheetData.workers)]);
        }

        // Update tasks data and validate
        if (sheetData.tasks) {
          setTasks(sheetData.tasks);
          setErrors((prev) => [...prev, ...validateTasks(sheetData.tasks)]);
        }
      }
    } catch (err: any) {
      // Handle file processing errors
      setUploadError(
        err instanceof Error
          ? err.message
          : "Failed to read file. Please upload a valid Excel or CSV file.",
      );
      setUploadedFile(null);
      setClients([]);
      setWorkers([]);
      setTasks([]);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Clears all uploaded data and resets the application state
   *
   * This function is called when the user wants to remove the uploaded file
   * and start fresh with new data.
   */
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadError(null);
    setClients([]);
    setWorkers([]);
    setTasks([]);
    setErrors([]);
  };

  /**
   * Updates a specific field in a data table row and re-validates the data
   *
   * This function handles inline editing of table data and ensures that
   * any changes are immediately validated to maintain data integrity.
   *
   * @param {"clients" | "workers" | "tasks"} table - The table to update
   * @param {number} id - The row ID to update
   * @param {string} field - The field name to update
   * @param {any} value - The new value for the field
   */
  const updateRow = (
    table: "clients" | "workers" | "tasks",
    id: number,
    field: string,
    value: any,
  ) => {
    // Generic updater function to handle row updates and validation
    const updater = (rows: any[], setter: Function, validator: Function) => {
      // Update the specific row with the new field value
      const updated = rows.map((r) =>
        r.id === id ? { ...r, [field]: value } : r,
      );
      setter(updated);

      // Remove existing errors for this table and add new validation results
      const otherErrors = errors.filter((e) => e.table !== table);
      setErrors([...otherErrors, ...validator(updated)]);
    };

    // Apply updates based on table type
    if (table === "clients") updater(clients, setClients, validateClients);
    if (table === "workers") updater(workers, setWorkers, validateWorkers);
    if (table === "tasks") updater(tasks, setTasks, validateTasks);
  };

  /**
   * Adds a new business rule to the rules collection
   *
   * @param {any} rule - The rule object to add
   */
  const handleAddRule = (rule: any) => {
    setRules((prev) => [...prev, rule]);
  };

  /**
   * Exports the current business rules to a JSON file
   *
   * Creates a downloadable JSON file containing all current business rules
   * for backup or sharing purposes.
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
    {
      field: "RequiredSkills",
      headerName: "Skills",
      width: 200,
      editable: true,
    },
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

  return (
    <main className="max-w-screen-xl mx-auto px-6 py-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <h1 className="text-5xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
        Data Alchemist
      </h1>

      {/* File upload component for handling data import */}
      <FileUploader
        onUpload={handleFileUpload}
        uploading={uploading}
        uploadedFile={uploadedFile}
        error={uploadError}
        onRemove={handleRemoveFile}
      />

      {/* Export functionality for data and rules */}
      <div className="mt-8">
        <ExportButtons
          clients={clients}
          workers={workers}
          tasks={tasks}
          rules={rules}
          errors={errors}
          dataLoaded={dataLoaded}
        />
      </div>

      {/* Prompt to upload data when no data is loaded */}
      {!dataLoaded && (
        <div className="my-8 p-6 bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 rounded-lg text-center text-lg font-semibold">
          Please upload data to begin using Data Alchemist features.
        </div>
      )}

      {/* Business rules management section */}
      <RuleSection
        rules={rules}
        onAddRule={handleAddRule}
        onDeleteRule={(i) => setRules(rules.filter((_, idx) => idx !== i))}
        dataLoaded={dataLoaded}
      />

      {/* Natural language data modification interface */}
      <NaturalLanguageDataModification
        clients={clients}
        setClients={setClients}
        workers={workers}
        setWorkers={setWorkers}
        tasks={tasks}
        setTasks={setTasks}
        dataLoaded={dataLoaded}
      />

      {/* AI-powered error correction component */}
      <AIErrorCorrection
        clients={clients}
        setClients={setClients}
        workers={workers}
        setWorkers={setWorkers}
        tasks={tasks}
        setTasks={setTasks}
        errors={errors}
        setErrors={setErrors}
        validateClients={validateClients}
        validateWorkers={validateWorkers}
        validateTasks={validateTasks}
        dataLoaded={dataLoaded}
      />

      {/* AI-powered data validation component */}
      <AIValidator
        clients={clients}
        workers={workers}
        tasks={tasks}
        dataLoaded={dataLoaded}
        onAddRule={handleAddRule}
      />

      {/* Interactive data tables for viewing and editing data */}
      <DataTablesSection
        clients={clients}
        workers={workers}
        tasks={tasks}
        errors={errors}
        updateRow={updateRow}
        dataLoaded={dataLoaded}
      />
    </main>
  );
}
