import * as XLSX from "xlsx";

/**
 * Normalizes sheet names to standard internal format
 *
 * Converts various sheet naming conventions to standardized internal keys.
 * Handles common variations like "Client Data", "Workers", "Task List", etc.
 *
 * @param {string} name - The original sheet name from the Excel file
 * @returns {string} Normalized sheet name for internal use
 */
function normalizeSheetName(name: string): string {
  const n = name.toLowerCase().replace(/\s+/g, "");
  if (n.startsWith("client")) return "clients";
  if (n.startsWith("worker")) return "workers";
  if (n.startsWith("task")) return "tasks";
  return name.toLowerCase();
}

/**
 * Parses multi-sheet Excel files and converts them to structured data
 *
 * This function reads Excel files (both .xlsx and .xls formats) and extracts
 * data from multiple sheets. It automatically detects sheet types based on
 * naming conventions and normalizes the data structure for the application.
 *
 * Features:
 * - Supports multiple sheets in a single file
 * - Automatic sheet type detection (clients, workers, tasks)
 * - Handles empty cells gracefully
 * - Adds unique row IDs for data management
 *
 * @param {File} file - The Excel file to parse
 * @returns {Promise<{ [key: string]: any[] }>} Object containing parsed data organized by sheet type
 * @throws {Error} When file cannot be read or parsed
 *
 * @example
 * const data = await parseMultiSheetFile(excelFile);
 * // Returns: { clients: [...], workers: [...], tasks: [...] }
 */
export const parseMultiSheetFile = async (
  file: File,
): Promise<{ [key: string]: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Handle successful file read
    reader.onload = (e) => {
      try {
        // Convert file to Uint8Array for XLSX processing
        const data = new Uint8Array(e.target!.result as ArrayBuffer);

        // Parse the Excel workbook
        const workbook = XLSX.read(data, { type: "array" });

        const result: { [key: string]: any[] } = {};

        // Process each sheet in the workbook
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];

          // Convert sheet to JSON with empty string as default for empty cells
          const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

          // Normalize sheet name for consistent internal keys
          const key = normalizeSheetName(sheetName);

          // Add unique row IDs and ensure all rows are objects
          result[key] = json.map((row, i) => {
            if (typeof row === "object" && row !== null) {
              return { id: i, ...row };
            } else {
              return { id: i };
            }
          });
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    // Handle file read errors
    reader.onerror = (err) => {
      reject(err);
    };

    // Start reading the file as ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
};
