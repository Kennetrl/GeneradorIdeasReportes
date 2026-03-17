"use client";

import { useState } from "react";
import { generateReport } from "@/lib/api";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Copy, Check } from "lucide-react";
import { ALL_SOURCES, SOURCE_NAMES } from "@/lib/constants";

export default function ReportsPage() {
  const [productName, setProductName] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [sourcesUsed, setSourcesUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function toggleSource(source: string) {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  }

  async function handleGenerate() {
    if (!productName.trim()) return;
    setLoading(true);
    setError(null);
    setContent("");
    try {
      const res = await generateReport({
        product_name: productName.trim(),
        sources: selectedSources.length > 0 ? selectedSources : undefined,
      });
      setContent(res.content);
      setSourcesUsed(res.sources_used);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar reporte");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes Competitivos</h1>
        <p className="text-muted-foreground">
          Genera reportes de analisis competitivo con IA
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Producto a analizar *
            </label>
            <Input
              placeholder="Ej: Notion, Figma, Linear..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Fuentes (opcional)
            </label>
            <div className="flex flex-wrap gap-4">
              {ALL_SOURCES.map((source) => (
                <label
                  key={source}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={selectedSources.includes(source)}
                    onCheckedChange={() => toggleSource(source)}
                  />
                  {SOURCE_NAMES[source]}
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !productName.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando reporte...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generar Reporte
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {content && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              Reporte: {productName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {sourcesUsed} insights analizados
              </Badge>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <Copy className="h-3 w-3 mr-1" />
                )}
                {copied ? "Copiado" : "Copiar MD"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={content} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
