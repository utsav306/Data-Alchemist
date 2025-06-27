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

export default function Home() {
  const [clients, setClients] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [rules, setRules] = useState<any[]>([]); // rule objects
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const dataLoaded =
    clients.length > 0 || workers.length > 0 || tasks.length > 0;

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    setUploadError(null);
    setUploadedFile(files[0]?.name || null);
    try {
      for (const file of Array.from(files)) {
        const sheetData = await parseMultiSheetFile(file);
        if (sheetData.clients) {
          setClients(sheetData.clients);
          setErrors((prev) => [...prev, ...validateClients(sheetData.clients)]);
        }
        if (sheetData.workers) {
          setWorkers(sheetData.workers);
          setErrors((prev) => [...prev, ...validateWorkers(sheetData.workers)]);
        }
        if (sheetData.tasks) {
          setTasks(sheetData.tasks);
          setErrors((prev) => [...prev, ...validateTasks(sheetData.tasks)]);
        }
      }
    } catch (err: any) {
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

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadError(null);
    setClients([]);
    setWorkers([]);
    setTasks([]);
    setErrors([]);
  };

  const updateRow = (
    table: "clients" | "workers" | "tasks",
    id: number,
    field: string,
    value: any,
  ) => {
    const updater = (rows: any[], setter: Function, validator: Function) => {
      const updated = rows.map((r) =>
        r.id === id ? { ...r, [field]: value } : r,
      );
      setter(updated);
      const otherErrors = errors.filter((e) => e.table !== table);
      setErrors([...otherErrors, ...validator(updated)]);
    };

    if (table === "clients") updater(clients, setClients, validateClients);
    if (table === "workers") updater(workers, setWorkers, validateWorkers);
    if (table === "tasks") updater(tasks, setTasks, validateTasks);
  };

  const handleAddRule = (rule: any) => {
    setRules((prev) => [...prev, rule]);
  };

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

      <FileUploader
        onUpload={handleFileUpload}
        uploading={uploading}
        uploadedFile={uploadedFile}
        error={uploadError}
        onRemove={handleRemoveFile}
      />

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

      {!dataLoaded && (
        <div className="my-8 p-6 bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 rounded-lg text-center text-lg font-semibold">
          Please upload data to begin using Data Alchemist features.
        </div>
      )}

      <RuleSection
        rules={rules}
        onAddRule={handleAddRule}
        onDeleteRule={(i) => setRules(rules.filter((_, idx) => idx !== i))}
        dataLoaded={dataLoaded}
      />

      <NaturalLanguageDataModification
        clients={clients}
        setClients={setClients}
        workers={workers}
        setWorkers={setWorkers}
        tasks={tasks}
        setTasks={setTasks}
        dataLoaded={dataLoaded}
      />

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

      <AIValidator
        clients={clients}
        workers={workers}
        tasks={tasks}
        dataLoaded={dataLoaded}
        onAddRule={handleAddRule}
      />

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
