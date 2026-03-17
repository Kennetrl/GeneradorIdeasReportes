"use client";

import { useEffect, useState } from "react";
import { getStats, getInsights } from "@/lib/api";
import type { StatsResponse, Insight } from "@/lib/api-types";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { RecentInsights } from "@/components/dashboard/recent-insights";
import { QuickSearch } from "@/components/dashboard/quick-search";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recent, setRecent] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, insightsData] = await Promise.all([
          getStats(),
          getInsights({ limit: 5 }),
        ]);
        setStats(statsData);
        setRecent(insightsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Asegurate de que el backend este corriendo en localhost:8000
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Vision general de los insights recolectados
        </p>
      </div>

      <QuickSearch />
      <StatsCards stats={stats} />
      <DashboardCharts stats={stats} />
      <RecentInsights insights={recent} />
    </div>
  );
}
