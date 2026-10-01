import Papa from "papaparse";

export interface SaleRow {
  date: Date;
  monthKey: string; // e.g. "2026-01"
  monthLabel: string; // e.g. "Jan 2026"
  product: string;
  amount: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface ProductRevenue {
  product: string;
  revenue: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalSales: number;
  averageSale: number;
  monthlyRevenue: MonthlyRevenue[];
  topProducts: ProductRevenue[];
  bottomProducts: ProductRevenue[];
}

export type ParseResult =
  | { ok: true; rows: SaleRow[]; summary: SalesSummary }
  | { ok: false; error: string };

const REQUIRED_COLUMNS = ["date", "product", "amount"];

export function formatRs(value: number): string {
  return `Rs. ${value.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function parseAmount(raw: string): number | null {
  // Strip currency symbols, commas and spaces: "Rs. 1,250" -> 1250
  const cleaned = raw.replace(/[^\d.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDate(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) return d;
  // Try DD/MM/YYYY or DD-MM-YYYY
  const m = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    let year = Number(m[3]);
    if (year < 100) year += 2000;
    const dt = new Date(year, month - 1, day);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  return null;
}

export function summarize(rows: SaleRow[]): SalesSummary {
  const totalRevenue = rows.reduce((s, r) => s + r.amount, 0);
  const totalSales = rows.length;
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  const byMonth = new Map<string, { label: string; revenue: number }>();
  for (const r of rows) {
    const entry = byMonth.get(r.monthKey) ?? { label: r.monthLabel, revenue: 0 };
    entry.revenue += r.amount;
    byMonth.set(r.monthKey, entry);
  }
  const monthlyRevenue = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ month: v.label, revenue: v.revenue }));

  const byProduct = new Map<string, number>();
  for (const r of rows) {
    byProduct.set(r.product, (byProduct.get(r.product) ?? 0) + r.amount);
  }
  const products = [...byProduct.entries()]
    .map(([product, revenue]) => ({ product, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    totalRevenue,
    totalSales,
    averageSale,
    monthlyRevenue,
    topProducts: products.slice(0, 5),
    bottomProducts: [...products].sort((a, b) => a.revenue - b.revenue).slice(0, 5),
  };
}

export function parseSalesCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const headers = (results.meta.fields ?? []).map((h) => h.trim().toLowerCase());
        const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          resolve({
            ok: false,
            error: `Your file is missing required column${missing.length > 1 ? "s" : ""}: ${missing
              .map((c) => `"${c.charAt(0).toUpperCase()}${c.slice(1)}"`)
              .join(", ")}. Please make sure your CSV has Date, Product and Amount columns.`,
          });
          return;
        }

        const data = results.data ?? [];
        if (data.length === 0) {
          resolve({
            ok: false,
            error: "Your CSV has a header row but no data rows. Add some sales records and try again.",
          });
          return;
        }

        const rows: SaleRow[] = [];
        const problems: string[] = [];
        data.forEach((rec, i) => {
          const line = i + 2; // account for header row
          const rawDate = (rec["date"] ?? "").trim();
          const rawProduct = (rec["product"] ?? "").trim();
          const rawAmount = (rec["amount"] ?? "").trim();

          const date = parseDate(rawDate);
          const amount = parseAmount(rawAmount);

          if (!date) {
            problems.push(`row ${line}: invalid date "${rawDate}"`);
            return;
          }
          if (!rawProduct) {
            problems.push(`row ${line}: missing product name`);
            return;
          }
          if (amount === null || amount < 0) {
            problems.push(`row ${line}: invalid amount "${rawAmount}"`);
            return;
          }

          rows.push({
            date,
            monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
            monthLabel: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            product: rawProduct,
            amount,
          });
        });

        if (rows.length === 0) {
          const detail = problems.slice(0, 3).join("; ");
          resolve({
            ok: false,
            error: `None of the rows in your file could be read as valid sales. ${detail}${
              problems.length > 3 ? ` (and ${problems.length - 3} more)` : ""
            }. Check that dates look like 2026-01-15 and amounts are numbers.`,
          });
          return;
        }

        resolve({ ok: true, rows, summary: summarize(rows) });
      },
      error: () => {
        resolve({
          ok: false,
          error: "This file couldn't be read as a CSV. Please upload a valid .csv file with Date, Product and Amount columns.",
        });
      },
    });
  });
}
