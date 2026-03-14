import { OverviewCharts } from "@/components/charts/overview-charts";
import { KpiCard } from "@/components/charts/kpi-card";
import { SectionTitle } from "@/components/ui/section-title";
import { requireSession } from "@/lib/auth/session";
import { buildMetrics } from "@/lib/data/app";

export default async function AnalyticsPage() {
  const session = await requireSession();
  const metrics = (await buildMetrics(session)).slice(0, 4);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Analytics" title="Operations analytics" description="KPIs, distribution charts, and trend summaries with enough demo density to support executive walkthroughs and partner reviews." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <KpiCard key={metric.label} detail={metric.detail} label={metric.label} value={metric.value} />
        ))}
      </div>
      <OverviewCharts />
    </div>
  );
}
