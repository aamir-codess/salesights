import type { SalesSummary } from "./sales";

// In-memory only: the uploaded data lives here for the current session and is
// never written to storage, a server, or a database.
let current: { fileName: string; summary: SalesSummary } | null = null;

export function setSalesData(fileName: string, summary: SalesSummary) {
  current = { fileName, summary };
}

export function getSalesData() {
  return current;
}

export function clearSalesData() {
  current = null;
}
