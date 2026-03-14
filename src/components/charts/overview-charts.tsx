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

const transferData = [
  { day: "Mon", volume: 52, failed: 2 },
  { day: "Tue", volume: 61, failed: 1 },
  { day: "Wed", volume: 74, failed: 4 },
  { day: "Thu", volume: 89, failed: 5 },
  { day: "Fri", volume: 68, failed: 3 },
];

const riskData = [
  { name: "Allow", value: 62, fill: "#10b981" },
  { name: "Flag", value: 23, fill: "#38bdf8" },
  { name: "Review", value: 10, fill: "#f59e0b" },
  { name: "Decline", value: 5, fill: "#f43f5e" },
];

export function OverviewCharts() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Transaction volume over time</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transferData}>
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
              <Pie data={riskData} dataKey="value" innerRadius={68} outerRadius={104} paddingAngle={4} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
