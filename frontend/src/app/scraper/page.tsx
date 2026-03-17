"use client";

import { useEffect, useState, useCallback } from "react";
import { runScrapers, getScraperRuns } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ALL_SOURCES, SOURCE_NAMES } from "@/lib/constants";
import { Play, Loader2, RefreshCw } from "lucide-react";
import type { ScraperRun } from "@/lib/api-types";

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  running: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  started: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function ScraperPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [runs, setRuns] = useState<ScraperRun[]>([]);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await getScraperRuns(30);
      setRuns(res.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Auto-refresh while there are active runs
  useEffect(() => {
    const hasActive = runs.some(
      (r) => r.status === "running" || r.status === "started"
    );
    if (!hasActive) return;
    const interval = setInterval(fetchRuns, 10000);
    return () => clearInterval(interval);
  }, [runs, fetchRuns]);

  function toggleSource(source: string) {
    setSelected((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  }

  async function handleRun() {
    setLaunching(true);
    setError(null);
    try {
      await runScrapers({
        scrapers: selected.length > 0 ? selected : undefined,
      });
      setSelected([]);
      setTimeout(fetchRuns, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ejecutar scrapers");
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Scrapers</h1>
        <p className="text-muted-foreground">
          Ejecuta y monitorea los scrapers de datos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Ejecutar Scrapers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {ALL_SOURCES.map((source) => (
              <label
                key={source}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={selected.includes(source)}
                  onCheckedChange={() => toggleSource(source)}
                />
                {SOURCE_NAMES[source]}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRun} disabled={launching}>
              {launching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {selected.length > 0
                ? `Ejecutar ${selected.length} scraper${selected.length > 1 ? "s" : ""}`
                : "Ejecutar Todos"}
            </Button>
            <Button variant="outline" onClick={fetchRuns}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Historial de Ejecuciones</CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay ejecuciones registradas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Fuente</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Encontrados</th>
                    <th className="pb-2 font-medium">Nuevos</th>
                    <th className="pb-2 font-medium">Inicio</th>
                    <th className="pb-2 font-medium">Fin</th>
                    <th className="pb-2 font-medium">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b last:border-0">
                      <td className="py-2">
                        {SOURCE_NAMES[run.source] || run.source}
                      </td>
                      <td className="py-2">
                        <Badge
                          variant="secondary"
                          className={STATUS_STYLE[run.status] || ""}
                        >
                          {run.status}
                        </Badge>
                      </td>
                      <td className="py-2">{run.items_found ?? "-"}</td>
                      <td className="py-2">{run.items_new ?? "-"}</td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {run.started_at
                          ? new Date(run.started_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {run.finished_at
                          ? new Date(run.finished_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="py-2 text-xs text-destructive max-w-48 truncate">
                        {run.error_message || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
