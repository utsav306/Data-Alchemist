import * as XLSX from "xlsx";

function normalizeSheetName(name: string): string {
  const n = name.toLowerCase().replace(/\s+/g, "");
  if (n.startsWith("client")) return "clients";
  if (n.startsWith("worker")) return "workers";
  if (n.startsWith("task")) return "tasks";
  return name.toLowerCase();
}

export const parseMultiSheetFile = async (
  file: File,
): Promise<{ [key: string]: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const result: { [key: string]: any[] } = {};

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          const key = normalizeSheetName(sheetName);
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
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsArrayBuffer(file);
  });
};
