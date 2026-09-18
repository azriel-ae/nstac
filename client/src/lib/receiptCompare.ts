import { parseIndonesianNumber, type ReceiptRow } from "./receiptParser";

export type ReceiptCompareStatus = "SAMA" | "BERBEDA" | "HANYA DI FILE 1" | "HANYA DI FILE 2";
export type ReceiptCompareRow = { no_struk: string; status: ReceiptCompareStatus; differences: string[]; file1?: ReceiptRow; file2?: ReceiptRow };
const fields = ["id_agent", "date_trans", "subtotal", "service_charge", "discount", "dpp", "tax", "paid_amount", "total", "keterangan"] as const;
const numeric = new Set(["subtotal", "service_charge", "discount", "dpp", "tax", "paid_amount", "total"]);
const numericValue = (row: ReceiptRow, field: typeof fields[number]) => field === "total" && !row.total && row.paid_amount ? parseIndonesianNumber(row.paid_amount) : parseIndonesianNumber(row[field]);
export function compareReceiptRows(file1: ReceiptRow[], file2: ReceiptRow[]) {
  const left = new Map(file1.filter((row) => row.no_struk).map((row) => [row.no_struk, row]));
  const right = new Map(file2.filter((row) => row.no_struk).map((row) => [row.no_struk, row]));
  const keys = new Set([...left.keys(), ...right.keys()]);
  const rows: ReceiptCompareRow[] = [];
  for (const no_struk of keys) {
    const a = left.get(no_struk), b = right.get(no_struk);
    if (!a) { rows.push({ no_struk, status: "HANYA DI FILE 2", differences: [], file2: b }); continue; }
    if (!b) { rows.push({ no_struk, status: "HANYA DI FILE 1", differences: [], file1: a }); continue; }
    const differences = fields.filter((field) => numeric.has(field) ? numericValue(a, field) !== numericValue(b, field) : a[field] !== b[field]).map((field) => field);
    rows.push({ no_struk, status: differences.length ? "BERBEDA" : "SAMA", differences, file1: a, file2: b });
  }
  return { rows, summary: { file1: file1.length, file2: file2.length, same: rows.filter((row) => row.status === "SAMA").length, only1: rows.filter((row) => row.status === "HANYA DI FILE 1").length, only2: rows.filter((row) => row.status === "HANYA DI FILE 2").length, different: rows.filter((row) => row.status === "BERBEDA").length } };
}
