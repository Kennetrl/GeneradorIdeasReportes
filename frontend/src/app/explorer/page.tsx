"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchInsights, getInsights } from "@/lib/api";
import type { Insight } from "@/lib/api-types";
import { SearchBar } from "@/components/explorer/search-bar";
import { FilterPanel, type Filters } from "@/components/explorer/filter-panel";
import { InsightCard } from "@/components/explorer/insight-card";
import { Pagination } from "@/components/explorer/pagination";
import { Loader2 } from "lucide-react";

const LIMIT = 20;
const EMPTY_FILTERS: Filters = {
  source: "",
  content_type: "",
  product_name: "",
  min_rating: "",
  date_from: "",
  date_to: "",
};

function ExplorerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
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
            source: filters.source && filters.source !== "all" ? filters.source : undefined,
            product_name: filters.product_name || undefined,
            content_type:
              filters.content_type && filters.content_type !== "all"
                ? filters.content_type
                : undefined,
            limit: LIMIT,
          });
          setResults(res.results);
          setTotal(res.total);
        } else {
          const res = await getInsights({
            source: filters.source && filters.source !== "all" ? filters.source : undefined,
            content_type:
              filters.content_type && filters.content_type !== "all"
                ? filters.content_type
                : undefined,
            product_name: filters.product_name || undefined,
            min_rating: filters.min_rating ? Number(filters.min_rating) : undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
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
    [query, filters]
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Explorer</h1>
        <p className="text-muted-foreground">
          Busqueda semantica y filtrado de insights
        </p>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
      />

      <FilterPanel
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron resultados. Intenta con otra busqueda.
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
          <Pagination
            offset={offset}
            limit={LIMIT}
            total={total}
            onChange={(newOffset) => doSearch(newOffset)}
          />
        </>
      )}
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ExplorerContent />
    </Suspense>
  );
}
