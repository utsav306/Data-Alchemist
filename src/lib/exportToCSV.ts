import * as XLSX from "xlsx";

/**
 * Exports data to a CSV file and triggers automatic download
 *
 * This function converts an array of objects to a CSV file format and
 * automatically downloads it to the user's device. It uses the XLSX library
 * for reliable CSV generation that handles various data types and special characters.
 *
 * Features:
 * - Automatic file download
 * - Proper CSV formatting
 * - Handles complex data structures
 * - Uses XLSX library for robust CSV generation
 *
 * @param {any[]} data - Array of objects to export to CSV
 * @param {string} fileName - Name of the file to be downloaded (without extension)
 *
 * @example
 * const userData = [
 *   { name: 'John', age: 30, city: 'New York' },
 *   { name: 'Jane', age: 25, city: 'Los Angeles' }
 * ];
 * exportToCSV(userData, 'users');
 * // Downloads 'users.csv' file
 *
 * @throws {Error} When data cannot be converted to CSV format
 */
export const exportToCSV = (data: any[], fileName: string) => {
  // Convert JSON data to worksheet format
  const ws = XLSX.utils.json_to_sheet(data);

  // Create a new workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, fileName);

  // Write the workbook to a CSV file and trigger download
  XLSX.writeFile(wb, `${fileName}.csv`);
};
