"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TransferChartPoint = {
  day: string;
  volume: number;
  failed: number;
};

type RiskChartPoint = {
  name: "Allow" | "Flag" | "Review" | "Decline";
  value: number;
  fill: string;
};

export function OverviewCharts({
  transferData,
  riskData,
}: {
  transferData: TransferChartPoint[];
  riskData: RiskChartPoint[];
}) {
  const safeTransferData = transferData.length
    ? transferData
    : [{ day: "N/A", volume: 0, failed: 0 }];
  const safeRiskData = riskData.length
    ? riskData
    : [
        { name: "Allow", value: 0, fill: "#10b981" },
        { name: "Flag", value: 0, fill: "#38bdf8" },
        { name: "Review", value: 0, fill: "#f59e0b" },
        { name: "Decline", value: 0, fill: "#f43f5e" },
      ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Transaction volume over time</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeTransferData}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="volume" radius={[12, 12, 0, 0]} fill="var(--brand-500)" />
              <Bar dataKey="failed" radius={[12, 12, 0, 0]} fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Risk score distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={safeRiskData} dataKey="value" innerRadius={68} outerRadius={104} paddingAngle={4} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
