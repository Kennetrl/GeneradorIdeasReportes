"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceBadge } from "@/components/shared/source-badge";
import { KeywordTag } from "@/components/shared/keyword-tag";
import type { Insight } from "@/lib/api-types";
import { ArrowUpRight } from "lucide-react";

export function RecentInsights({ insights }: { insights: Insight[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Insights Recientes</CardTitle>
        <Link
          href="/explorer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Ver todos <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <Link
            key={insight.id}
            href={`/insights/${insight.id}`}
            className="block rounded-lg border p-3 transition-colors hover:bg-accent"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SourceBadge source={insight.source} />
                  {insight.product_name && (
                    <span className="text-xs text-muted-foreground truncate">
                      {insight.product_name}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium line-clamp-1">
                  {insight.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {insight.body}
                </p>
                {insight.pain_keywords?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {insight.pain_keywords.slice(0, 3).map((kw) => (
                      <KeywordTag key={kw} keyword={kw} />
                    ))}
                  </div>
                )}
              </div>
              {insight.upvotes != null && insight.upvotes > 0 && (
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {insight.upvotes} upvotes
                </span>
              )}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
