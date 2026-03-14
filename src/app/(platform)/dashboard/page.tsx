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

  return (
    <div className="space-y-8">
      <SectionTitle eyebrow="Overview" title="Embedded banking operations in one place" description="Monitor partner health, sandbox product activity, fraud posture, and compliance queues across the seeded multi-tenant environment." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <KpiCard key={metric.label} detail={metric.detail} label={metric.label} value={metric.value} />
        ))}
      </div>
      <OverviewCharts />
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
