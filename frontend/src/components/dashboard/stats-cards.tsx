"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Globe, Package, AlertTriangle } from "lucide-react";
import type { StatsResponse } from "@/lib/api-types";

export function StatsCards({ stats }: { stats: StatsResponse }) {
  const activeSources = Object.keys(stats.by_source).length;
  const products = Object.keys(stats.by_product).length;
  const painPoints = stats.by_content_type["pain_point"] || 0;

  const cards = [
    {
      title: "Total Insights",
      value: stats.total.toLocaleString(),
      icon: Database,
      color: "text-indigo-500",
    },
    {
      title: "Fuentes Activas",
      value: activeSources,
      icon: Globe,
      color: "text-emerald-500",
    },
    {
      title: "Productos",
      value: products,
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Pain Points",
      value: painPoints.toLocaleString(),
      icon: AlertTriangle,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
