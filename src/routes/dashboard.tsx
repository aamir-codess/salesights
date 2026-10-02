import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  BarChart3,
  Banknote,
  ReceiptText,
  TrendingUp,
  Upload,
  ArrowDownWideNarrow,
  TriangleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRs } from "@/lib/sales";
import { getSalesData, clearSalesData } from "@/lib/sales-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SalesInsight" },
      {
        name: "description",
        content: "Your sales dashboard: revenue by month, top products and key summaries.",
      },
      { property: "og:title", content: "Dashboard — SalesInsight" },
      {
        property: "og:description",
        content: "Your sales dashboard: revenue by month, top products and key summaries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function compactRs(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(Math.round(value));
}

function DashboardPage() {
  const navigate = useNavigate();
  const data = getSalesData();

  useEffect(() => {
    if (!data) {
      navigate({ to: "/", replace: true });
    }
  }, [data, navigate]);

  if (!data) return null;

  const { summary, fileName, skippedRows } = data;

  // If the top product dwarfs the rest (more than 5x the next highest), use a
  // logarithmic axis so the smaller bars stay visible and readable.
  const top = summary.topProducts;
  const useLogScale =
    top.length > 1 &&
    (top[1]?.revenue ?? 0) > 0 &&
    (top[0]?.revenue ?? 0) > 5 * (top[1]?.revenue ?? 1);

  const cards = [
    {
      title: "Total Revenue",
      value: formatRs(summary.totalRevenue),
      icon: Banknote,
    },
    {
      title: "Number of Sales",
      value: summary.totalSales.toLocaleString("en-PK"),
      icon: ReceiptText,
    },
    {
      title: "Average Sale Value",
      value: formatRs(summary.averageSale),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">SalesInsight</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearSalesData();
              navigate({ to: "/" });
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload new file
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Your sales dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          From <span className="font-medium text-foreground">{fileName}</span> — processed in your
          browser only, nothing stored.
        </p>

        {skippedRows > 0 && (
          <Alert className="mt-4 border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Some rows were skipped</AlertTitle>
            <AlertDescription>
              {skippedRows.toLocaleString("en-PK")} {skippedRows === 1 ? "row was" : "rows were"}{" "}
              skipped due to invalid or missing data (blank or negative amounts, non-numeric
              values, or missing dates). The charts below use only the valid rows.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <Card key={c.title}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                  <p className="truncate text-xl font-bold text-foreground">{c.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue by month */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {summary.monthlyRevenue.length > 1 ? (
                  <LineChart data={summary.monthlyRevenue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis
                      tickFormatter={compactRs}
                      tick={{ fontSize: 12 }}
                      stroke="var(--muted-foreground)"
                      width={48}
                    />
                    <Tooltip
                      formatter={(value) => [formatRs(Number(value)), "Revenue"]}
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                        color: "var(--popover-foreground)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--chart-1)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "var(--chart-1)" }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={summary.monthlyRevenue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis
                      tickFormatter={compactRs}
                      tick={{ fontSize: 12 }}
                      stroke="var(--muted-foreground)"
                      width={48}
                    />
                    <Tooltip
                      formatter={(value) => [formatRs(Number(value)), "Revenue"]}
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                        color: "var(--popover-foreground)",
                      }}
                    />
                    <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 products */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Top 5 Selling Products</CardTitle>
            {useLogScale && (
              <p className="text-xs text-muted-foreground">
                One product is far ahead of the rest, so this chart uses a logarithmic scale to
                keep the smaller bars readable. Labels show the real values.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.topProducts}
                  layout="vertical"
                  margin={{ top: 8, right: 96, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    scale={useLogScale ? "log" : "auto"}
                    domain={useLogScale ? [1, "auto"] : [0, "auto"]}
                    allowDataOverflow={useLogScale}
                    tickFormatter={compactRs}
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    type="category"
                    dataKey="product"
                    width={110}
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    formatter={(value) => [formatRs(Number(value)), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {summary.topProducts.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                    <LabelList
                      dataKey="revenue"
                      content={(props) => {
                        const { x, y, width, height, value } = props as {
                          x?: number | string;
                          y?: number | string;
                          width?: number | string;
                          height?: number | string;
                          value?: number | string;
                        };
                        return (
                          <text
                            x={Number(x) + Number(width) + 6}
                            y={Number(y) + Number(height) / 2 + 4}
                            fontSize={12}
                            fill="var(--foreground)"
                          >
                            {formatRs(Number(value))}
                          </text>
                        );
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lowest-selling products */}
        <Card className="mt-6 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowDownWideNarrow className="h-5 w-5 text-primary" />
              5 Lowest-Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {summary.bottomProducts.map((p, i) => (
                <li key={p.product} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm font-medium text-foreground">{p.product}</span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {formatRs(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <p className="pb-8 text-center text-sm text-muted-foreground">
          Want to analyse a different file?{" "}
          <Link
            to="/"
            onClick={() => clearSalesData()}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Upload a new CSV
          </Link>
        </p>
      </main>
    </div>
  );
}
