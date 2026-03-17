"use client";

import { useState } from "react";
import { generateReport } from "@/lib/api";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      setError(err instanceof Error ? err.message : "Error generating report");
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
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Competitive Reports</h1>
          <p className="text-gray-500">
            Generate AI-powered competitive analysis for any product
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product to analyze
              </label>
              <Input
                placeholder="e.g., Notion, Figma, Linear..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data sources (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_SOURCES.map((source) => (
                  <button
                    key={source}
                    onClick={() => toggleSource(source)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      selectedSources.includes(source)
                        ? "bg-lime-400/20 text-lime-400 border border-lime-400/30"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    {SOURCE_NAMES[source] || source}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !productName.trim()}
              className="w-full bg-lime-400 hover:bg-lime-500 text-black font-bold h-12 text-base disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" /> Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm mb-8">
            {error}
          </div>
        )}

        {/* Results */}
        {content && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Report: {productName}</h2>
                <span className="text-xs text-gray-500">
                  {sourcesUsed} insights analyzed
                </span>
              </div>
              <Button
                onClick={handleCopy}
                className="bg-white/5 border border-white/10 text-white hover:bg-white/10 text-sm"
              >
                {copied ? (
                  <><Check className="h-3 w-3 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3 mr-1" /> Copy MD</>
                )}
              </Button>
            </div>
            <div className="prose prose-invert prose-lime max-w-none">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!content && !loading && !error && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 mb-2">No report generated yet</p>
            <p className="text-sm text-gray-600">
              Enter a product name to generate a competitive analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
