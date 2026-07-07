import * as XLSX from "xlsx";

export interface ImportedRow {
  row: number;
  data: Record<string, string>;
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  errors: { row: number; message: string }[];
}

export function downloadTemplate(filename: string, headers: string[], exampleRows: string[][]): void {
  const wb = XLSX.utils.book_new();
  const rows = [headers, ...exampleRows];
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 3, 18) }));

  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, filename);
}

export function parseExcelFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: (string | undefined)[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (json.length < 2) {
          reject(new Error("File kosong atau hanya berisi header"));
          return;
        }

        const headers = json[0].map((h) => String(h).trim().toLowerCase());
        const rows = json.slice(1).map((row) => {
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = String(row[i] || "").trim();
          });
          return obj;
        });

        resolve({ headers, rows });
      } catch {
        reject(new Error("Gagal membaca file Excel"));
      }
    };

    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsArrayBuffer(file);
  });
}
