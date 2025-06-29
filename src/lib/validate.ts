/**
 * Represents a validation error found in the data
 *
 * This interface defines the structure for validation errors that can occur
 * during data validation. Each error includes information about which table,
 * row, and field the error occurred in, along with a descriptive message.
 */
export interface ValidationError {
  table: "clients" | "workers" | "tasks";
  row: number;
  field: string;
  message: string;
}

/**
 * Validates client data for completeness and correctness
 *
 * Performs comprehensive validation on client records including:
 * - Required field validation (ClientID)
 * - Duplicate ID detection
 * - Priority level range validation (1-5)
 * - JSON format validation for attributes
 *
 * @param {any[]} rows - Array of client records to validate
 * @returns {ValidationError[]} Array of validation errors found
 *
 * @example
 * const errors = validateClients(clientData);
 * if (errors.length > 0) {
 *   console.log('Validation errors found:', errors);
 * }
 */
export const validateClients = (rows: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seenIDs = new Set(); // Track seen IDs to detect duplicates

  rows.forEach((row, idx) => {
    const rowId = row.ClientID;

    // Validate ClientID is present and not empty
    if (!rowId || rowId.toString().trim() === "") {
      errors.push({
        table: "clients",
        row: rowId ?? idx,
        field: "ClientID",
        message: "ClientID is required.",
      });
    } else if (seenIDs.has(rowId)) {
      // Check for duplicate ClientIDs
      errors.push({
        table: "clients",
        row: rowId,
        field: "ClientID",
        message: "Duplicate ClientID.",
      });
    } else {
      seenIDs.add(rowId);
    }

    // Validate priority level is within acceptable range (1-5)
    const priority = Number(row.PriorityLevel);
    if (isNaN(priority) || priority < 1 || priority > 5) {
      errors.push({
        table: "clients",
        row: rowId,
        field: "PriorityLevel",
        message: "Priority must be between 1 and 5.",
      });
    }

    // Validate JSON format for attributes if present
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

/**
 * Validates worker data for completeness and correctness
 *
 * Performs comprehensive validation on worker records including:
 * - Required field validation (WorkerID)
 * - Duplicate ID detection
 * - Maximum load validation (must be positive number)
 * - JSON array format validation for available slots
 *
 * @param {any[]} rows - Array of worker records to validate
 * @returns {ValidationError[]} Array of validation errors found
 *
 * @example
 * const errors = validateWorkers(workerData);
 * if (errors.length > 0) {
 *   console.log('Validation errors found:', errors);
 * }
 */
export const validateWorkers = (rows: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seenIDs = new Set(); // Track seen IDs to detect duplicates

  rows.forEach((row, idx) => {
    const rowId = row.WorkerID;

    // Validate WorkerID is present and not empty
    if (!rowId || rowId.toString().trim() === "") {
      errors.push({
        table: "workers",
        row: rowId ?? idx,
        field: "WorkerID",
        message: "WorkerID is required.",
      });
    } else if (seenIDs.has(rowId)) {
      // Check for duplicate WorkerIDs
      errors.push({
        table: "workers",
        row: rowId,
        field: "WorkerID",
        message: "Duplicate WorkerID.",
      });
    } else {
      seenIDs.add(rowId);
    }

    // Validate maximum load is a positive number
    const maxLoad = Number(row.MaxLoadPerPhase);
    if (isNaN(maxLoad) || maxLoad <= 0) {
      errors.push({
        table: "workers",
        row: rowId,
        field: "MaxLoadPerPhase",
        message: "MaxLoad must be a number > 0.",
      });
    }

    // Validate JSON array format for available slots if present
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

/**
 * Validates task data for completeness and correctness
 *
 * Performs comprehensive validation on task records including:
 * - Required field validation (TaskID)
 * - Duplicate ID detection
 * - Duration validation (must be positive number)
 * - JSON array format validation for preferred phases
 *
 * @param {any[]} rows - Array of task records to validate
 * @returns {ValidationError[]} Array of validation errors found
 *
 * @example
 * const errors = validateTasks(taskData);
 * if (errors.length > 0) {
 *   console.log('Validation errors found:', errors);
 * }
 */
export const validateTasks = (rows: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seenIDs = new Set(); // Track seen IDs to detect duplicates

  rows.forEach((row, idx) => {
    const rowId = row.TaskID;

    // Validate TaskID is present and not empty
    if (!rowId || rowId.toString().trim() === "") {
      errors.push({
        table: "tasks",
        row: rowId ?? idx,
        field: "TaskID",
        message: "TaskID is required.",
      });
    } else if (seenIDs.has(rowId)) {
      // Check for duplicate TaskIDs
      errors.push({
        table: "tasks",
        row: rowId,
        field: "TaskID",
        message: "Duplicate TaskID.",
      });
    } else {
      seenIDs.add(rowId);
    }

    // Validate duration is a positive number
    const duration = Number(row.Duration);
    if (isNaN(duration) || duration <= 0) {
      errors.push({
        table: "tasks",
        row: rowId,
        field: "Duration",
        message: "Duration must be > 0.",
      });
    }

    // Validate JSON array format for preferred phases if present
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
