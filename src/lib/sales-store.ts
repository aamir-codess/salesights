import type { SalesSummary } from "./sales";

// In-memory only: the uploaded data lives here for the current session and is
// never written to storage, a server, or a database.
let current: { fileName: string; summary: SalesSummary; skippedRows: number } | null = null;

export function setSalesData(fileName: string, summary: SalesSummary, skippedRows = 0) {
  current = { fileName, summary, skippedRows };
}

export function getSalesData() {
  return current;
}

export function clearSalesData() {
  current = null;
}
