export interface ValidationError {
  table: "clients" | "workers" | "tasks";
  row: number;
  field: string;
  message: string;
}

export const validateClients = (rows: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seenIDs = new Set();

  rows.forEach((row, idx) => {
    const rowId = row.ClientID;
    if (!rowId || rowId.toString().trim() === "") {
      errors.push({
        table: "clients",
        row: rowId ?? idx,
        field: "ClientID",
        message: "ClientID is required.",
      });
    } else if (seenIDs.has(rowId)) {
      errors.push({
        table: "clients",
        row: rowId,
        field: "ClientID",
        message: "Duplicate ClientID.",
      });
    } else {
      seenIDs.add(rowId);
    }

    const priority = Number(row.PriorityLevel);
    if (isNaN(priority) || priority < 1 || priority > 5) {
      errors.push({
        table: "clients",
        row: rowId,
        field: "PriorityLevel",
        message: "Priority must be between 1 and 5.",
      });
    }

    if (row.AttributesJSON) {
      try {
        JSON.parse(row.AttributesJSON);
      } catch {
        errors.push({
          table: "clients",
          row: rowId,
          field: "AttributesJSON",
          message: "Invalid JSON format.",
        });
      }
    }
  });

  return errors;
};

export const validateWorkers = (rows: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seenIDs = new Set();

  rows.forEach((row, idx) => {
    const rowId = row.WorkerID;
    if (!rowId || rowId.toString().trim() === "") {
      errors.push({
        table: "workers",
        row: rowId ?? idx,
        field: "WorkerID",
        message: "WorkerID is required.",
      });
    } else if (seenIDs.has(rowId)) {
      errors.push({
        table: "workers",
        row: rowId,
        field: "WorkerID",
        message: "Duplicate WorkerID.",
      });
    } else {
      seenIDs.add(rowId);
    }

    const maxLoad = Number(row.MaxLoadPerPhase);
    if (isNaN(maxLoad) || maxLoad <= 0) {
      errors.push({
        table: "workers",
        row: rowId,
        field: "MaxLoadPerPhase",
        message: "MaxLoad must be a number > 0.",
      });
    }

    if (row.AvailableSlots) {
      try {
        const parsed = JSON.parse(row.AvailableSlots);
        if (!Array.isArray(parsed)) throw new Error();
      } catch {
        errors.push({
          table: "workers",
          row: rowId,
          field: "AvailableSlots",
          message: "Must be a valid JSON array.",
        });
      }
    }
  });

  return errors;
};

export const validateTasks = (rows: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seenIDs = new Set();

  rows.forEach((row, idx) => {
    const rowId = row.TaskID;
    if (!rowId || rowId.toString().trim() === "") {
      errors.push({
        table: "tasks",
        row: rowId ?? idx,
        field: "TaskID",
        message: "TaskID is required.",
      });
    } else if (seenIDs.has(rowId)) {
      errors.push({
        table: "tasks",
        row: rowId,
        field: "TaskID",
        message: "Duplicate TaskID.",
      });
    } else {
      seenIDs.add(rowId);
    }

    const duration = Number(row.Duration);
    if (isNaN(duration) || duration <= 0) {
      errors.push({
        table: "tasks",
        row: rowId,
        field: "Duration",
        message: "Duration must be > 0.",
      });
    }

    if (row.PreferredPhases) {
      try {
        const parsed = JSON.parse(row.PreferredPhases);
        if (!Array.isArray(parsed)) throw new Error();
      } catch {
        errors.push({
          table: "tasks",
          row: rowId,
          field: "PreferredPhases",
          message: "Must be a JSON array.",
        });
      }
    }
  });

  return errors;
};
