"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SOURCE_NAMES, CHART_COLORS } from "@/lib/constants";
import type { StatsResponse } from "@/lib/api-types";

export function SourceDonut({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: SOURCE_NAMES[name] || name,
    value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Por Fuente</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {chartData.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TypeBars({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Por Tipo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ProductBars({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11 }}
              width={100}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({ stats }: { stats: StatsResponse }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SourceDonut data={stats.by_source} />
      <TypeBars data={stats.by_content_type} />
      <ProductBars data={stats.by_product} />
    </div>
  );
}
