import { OverviewCharts } from "@/components/charts/overview-charts";
import { KpiCard } from "@/components/charts/kpi-card";
import { SectionTitle } from "@/components/ui/section-title";
import { requireSession } from "@/lib/auth/session";
import { buildMetrics, listTransactions, listTransfers } from "@/lib/data/app";

export default async function AnalyticsPage() {
  const session = await requireSession();
  const [metrics, transfers, transactions] = await Promise.all([
    buildMetrics(session),
    listTransfers(session),
    listTransactions(session),
  ]);

  const transferChartMap = new Map<string, { day: string; volume: number; failed: number }>();
  for (const transfer of transfers) {
    const day = new Date(transfer.createdAt).toLocaleDateString("en-US", { weekday: "short" });
    const existing = transferChartMap.get(day) ?? { day, volume: 0, failed: 0 };
    existing.volume += 1;
    if (transfer.status === "failed" || transfer.status === "returned" || transfer.status === "reversed") {
      existing.failed += 1;
    }
    transferChartMap.set(day, existing);
  }
  const transferSeries = Array.from(transferChartMap.values()).slice(-7);
  const riskSeries = [
    { name: "Allow" as const, value: transactions.filter((item) => item.riskAction === "allow").length, fill: "#10b981" },
    { name: "Flag" as const, value: transactions.filter((item) => item.riskAction === "flag").length, fill: "#38bdf8" },
    { name: "Review" as const, value: transactions.filter((item) => item.riskAction === "review").length, fill: "#f59e0b" },
    { name: "Decline" as const, value: transactions.filter((item) => item.riskAction === "decline").length, fill: "#f43f5e" },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Analytics" title="Operations analytics" description="KPIs, distribution charts, and trend summaries based on live workspace activity." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.slice(0, 4).map((metric) => (
          <KpiCard key={metric.label} detail={metric.detail} label={metric.label} value={metric.value} />
        ))}
      </div>
      <OverviewCharts transferData={transferSeries} riskData={riskSeries} />
    </div>
  );
}
