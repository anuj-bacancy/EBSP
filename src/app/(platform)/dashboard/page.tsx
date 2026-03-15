import { OverviewCharts } from "@/components/charts/overview-charts";
import { KpiCard } from "@/components/charts/kpi-card";
import { SectionTitle } from "@/components/ui/section-title";
import { OperationalPanels } from "@/features/dashboard/operational-panels";
import { RecentActivity } from "@/features/dashboard/recent-activity";
import { requireSession } from "@/lib/auth/session";
import { buildMetrics, listEndUsers, listFraudAlerts, listKycCases, listTransactions, listTransfers } from "@/lib/data/app";

export default async function DashboardPage() {
  const session = await requireSession();
  const [metrics, transactions, transfers, fraudAlerts, endUsers, kycCases] = await Promise.all([
    buildMetrics(session),
    listTransactions(session),
    listTransfers(session),
    listFraudAlerts(session),
    listEndUsers(session),
    listKycCases(session),
  ]);
  const approvedKycCount = kycCases.filter((item) => item.status === "approved").length;
  const fundedCount = transfers.filter((item) => item.status === "settled").length;

  const transferChartMap = new Map<string, { day: string; volume: number; failed: number }>();
  for (const transfer of transfers) {
    const date = new Date(transfer.createdAt);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
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
    <div className="space-y-8">
      <SectionTitle eyebrow="Overview" title="Embedded banking operations in one place" description="Monitor partner health, product activity, fraud posture, and compliance queues across your active workspace." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <KpiCard key={metric.label} detail={metric.detail} label={metric.label} value={metric.value} />
        ))}
      </div>
      <OverviewCharts transferData={transferSeries} riskData={riskSeries} />
      <div className="grid gap-6 xl:grid-cols-2">
        <RecentActivity transactions={transactions.slice(0, 4)} />
        <RecentActivity transactions={transactions.slice(4, 8)} />
      </div>
      <OperationalPanels
        approvedKycCount={approvedKycCount}
        endUserCount={endUsers.length}
        fraudAlerts={fraudAlerts}
        fundedCount={fundedCount}
        transfers={transfers}
      />
    </div>
  );
}
