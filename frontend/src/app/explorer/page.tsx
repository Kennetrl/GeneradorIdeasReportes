"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchInsights, getInsights } from "@/lib/api";
import type { Insight } from "@/lib/api-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ExternalLink, Star } from "lucide-react";

const LIMIT = 20;

function ExplorerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [source, setSource] = useState("");
  const [results, setResults] = useState<Insight[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(
    async (newOffset = 0) => {
      setLoading(true);
      setOffset(newOffset);
      try {
        if (query.trim()) {
          const res = await searchInsights({
            query: query.trim(),
            source: source || undefined,
            limit: LIMIT,
          });
          setResults(res.results);
          setTotal(res.total);
        } else {
          const res = await getInsights({
            source: source || undefined,
            limit: LIMIT,
            offset: newOffset,
          });
          setResults(res.data);
          setTotal(res.count);
        }
        setSearched(true);
      } catch {
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [query, source]
  );

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      doSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.replace(`/explorer${params.toString() ? `?${params}` : ""}`);
    doSearch(0);
  }

  const sources = ["", "reddit", "hn", "reviews", "ph", "apps"];
  const sourceLabels: Record<string, string> = {
    "": "All Sources",
    reddit: "Reddit",
    hn: "Hacker News",
    reviews: "Reviews",
    ph: "Product Hunt",
    apps: "App Store",
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pain Point Explorer</h1>
          <p className="text-gray-500">
            Search and filter through thousands of real user reviews and complaints
          </p>
        </div>

        {/* Search + Filters */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
          <div className="flex gap-3 flex-col sm:flex-row mb-4">
            <Input
              placeholder="Search pain points, problems, complaints..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-lime-400 hover:bg-lime-500 text-black font-bold h-12 px-6"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><Search className="mr-2 h-4 w-4" /> Search</>
              )}
            </Button>
          </div>

          {/* Source filters */}
          <div className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  source === s
                    ? "bg-lime-400/20 text-lime-400 border border-lime-400/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                }`}
              >
                {sourceLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && results.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No results found</p>
            <p className="text-sm text-gray-600">Try a different search query or filter</p>
          </div>
        )}

        {/* Initial state */}
        {!loading && !searched && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">Start exploring</p>
            <p className="text-sm text-gray-600">
              Search for pain points or browse by source
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {total} result{total !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="space-y-3">
              {results.map((insight) => (
                <InsightRow key={insight.id} insight={insight} />
              ))}
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  onClick={() => doSearch(Math.max(0, offset - LIMIT))}
                  disabled={offset === 0}
                  className="bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  {Math.floor(offset / LIMIT) + 1} / {Math.ceil(total / LIMIT)}
                </span>
                <Button
                  onClick={() => doSearch(offset + LIMIT)}
                  disabled={offset + LIMIT >= total}
                  className="bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  const sourceColors: Record<string, string> = {
    reddit: "bg-orange-500/20 text-orange-300",
    hn: "bg-orange-400/20 text-orange-200",
    reviews: "bg-blue-500/20 text-blue-300",
    ph: "bg-red-500/20 text-red-300",
    apps: "bg-green-500/20 text-green-300",
  };

  return (
    <a
      href={`/insights/${insight.id}`}
      className="block rounded-xl border border-white/10 bg-white/5 p-5 hover:border-lime-400/20 transition group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                sourceColors[insight.source] || "bg-gray-500/20 text-gray-300"
              }`}
            >
              {insight.source}
            </span>
            {insight.product_name && (
              <span className="text-xs text-gray-500">{insight.product_name}</span>
            )}
            {insight.rating && (
              <span className="flex items-center gap-0.5 text-xs text-amber-400">
                <Star className="h-3 w-3 fill-current" /> {insight.rating}
              </span>
            )}
            {insight.similarity !== undefined && (
              <span className="text-xs text-lime-400 font-medium">
                {Math.round(insight.similarity * 100)}% match
              </span>
            )}
          </div>
          <h3 className="font-semibold text-sm mb-1 group-hover:text-lime-400 transition truncate">
            {insight.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2">{insight.body}</p>
          {insight.pain_keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {insight.pain_keywords.slice(0, 4).map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-400"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
        <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-lime-400 transition shrink-0 mt-1" />
      </div>
    </a>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
        </div>
      }
    >
      <ExplorerContent />
    </Suspense>
  );
}
