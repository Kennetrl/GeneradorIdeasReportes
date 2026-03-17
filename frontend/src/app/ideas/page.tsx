"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { generateIdeas } from "@/lib/api";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";

export default function IdeasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
        </div>
      }
    >
      <IdeasContent />
    </Suspense>
  );
}

function IdeasContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [productName, setProductName] = useState("");
  const [content, setContent] = useState("");
  const [sourcesUsed, setSourcesUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

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
      setError(err instanceof Error ? err.message : "Error generating ideas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Idea Generator</h1>
          <p className="text-gray-500">
            Generate startup ideas from real user pain points using AI
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Problem or industry
              </label>
              <Input
                placeholder="e.g., 'people struggle with meal planning' or 'fintech for freelancers'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Specific product (optional)
              </label>
              <Input
                placeholder="e.g., 'Notion', 'Uber Eats'"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading || (!query.trim() && !productName.trim())}
              className="w-full bg-lime-400 hover:bg-lime-500 text-black font-bold h-12 text-base disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing pain points...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate 5 Ideas
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
              <h2 className="text-xl font-bold">Generated Ideas</h2>
              <span className="px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-semibold">
                {sourcesUsed} insights analyzed
              </span>
            </div>
            <div className="prose prose-invert prose-lime max-w-none">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!content && !loading && !error && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 mb-2">No ideas generated yet</p>
            <p className="text-sm text-gray-600">
              Describe a problem or industry above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
