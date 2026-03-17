"use client";

import { useState } from "react";
import { generateIdeas } from "@/lib/api";
import { IdeasForm } from "@/components/ideas/ideas-form";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function IdeasPage() {
  const [query, setQuery] = useState("");
  const [productName, setProductName] = useState("");
  const [content, setContent] = useState("");
  const [sourcesUsed, setSourcesUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!query.trim() && !productName.trim()) return;
    setLoading(true);
    setError(null);
    setContent("");
    try {
      const res = await generateIdeas({
        query: query.trim() || undefined,
        product_name: productName.trim() || undefined,
      });
      setContent(res.content);
      setSourcesUsed(res.sources_used);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar ideas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generador de Ideas</h1>
        <p className="text-muted-foreground">
          Genera ideas de producto basadas en problemas reales
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <IdeasForm
            query={query}
            productName={productName}
            onQueryChange={setQuery}
            onProductChange={setProductName}
            onSubmit={handleGenerate}
            loading={loading}
          />
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
            <CardTitle className="text-lg">Ideas Generadas</CardTitle>
            <Badge variant="secondary">
              {sourcesUsed} insights analizados
            </Badge>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={content} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
