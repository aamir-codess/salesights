import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, Loader2, BarChart3 } from "lucide-react";
import { parseSalesCsv } from "@/lib/sales";
import { setSalesData } from "@/lib/sales-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SalesInsight — Upload your sales CSV" },
      {
        name: "description",
        content:
          "Upload a sales CSV and instantly see revenue charts, top products and summaries. Nothing is stored.",
      },
      { property: "og:title", content: "SalesInsight — Upload your sales CSV" },
      {
        property: "og:description",
        content:
          "Upload a sales CSV and instantly see revenue charts, top products and summaries. Nothing is stored.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UploadPage,
});

const EXAMPLE_ROWS = [
  ["2026-01-05", "Cotton Kurta", "2500"],
  ["2026-01-12", "Leather Wallet", "1800"],
  ["2026-02-03", "Cotton Kurta", "2500"],
];

function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);

    const looksCsv =
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel";
    if (!looksCsv) {
      setError("That doesn't look like a CSV file. Please upload a file ending in .csv.");
      return;
    }

    setLoading(true);
    try {
      const result = await parseSalesCsv(file);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSalesData(file.name, result.summary, result.skippedRows);
      navigate({ to: "/dashboard" });
    } catch {
      setError("Something went wrong while reading that file. Please try a different CSV.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">SalesInsight</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Understand your sales in seconds
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            Upload your sales CSV and instantly see revenue charts, your best products and key
            numbers. Your file is never stored — it's only used to build your dashboard.
          </p>
        </div>

        <Card className="mt-8">
          <CardContent className="p-4 sm:p-6">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                dragging
                  ? "border-primary bg-accent"
                  : "border-border bg-muted/50 hover:border-primary/60 hover:bg-accent"
              }`}
            >
              {loading ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : (
                <Upload className="h-10 w-10 text-primary" />
              )}
              <span className="mt-4 text-base font-semibold text-foreground">
                {loading ? "Reading your file…" : "Tap to choose your CSV file"}
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                or drag and drop it here
              </span>
            </button>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Couldn't use that file</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Expected format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your CSV needs three columns: <strong className="text-foreground">Date</strong>,{" "}
              <strong className="text-foreground">Product</strong> and{" "}
              <strong className="text-foreground">Amount</strong>. For example:
            </p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-left">
                    <th className="px-3 py-2 font-semibold text-foreground">Date</th>
                    <th className="px-3 py-2 font-semibold text-foreground">Product</th>
                    <th className="px-3 py-2 font-semibold text-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLE_ROWS.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 text-muted-foreground">{row[0]}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row[1]}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full sm:w-auto"
              onClick={() => {
                const csv =
                  "Date,Product,Amount\n" +
                  EXAMPLE_ROWS.map((r) => r.join(",")).join("\n") +
                  "\n";
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sales-example.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download example CSV
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
