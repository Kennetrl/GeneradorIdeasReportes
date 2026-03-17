"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "@/components/shared/source-badge";
import { KeywordTag } from "@/components/shared/keyword-tag";
import { RatingStars } from "@/components/shared/rating-stars";
import {
  ArrowUp,
  MessageSquare,
  ExternalLink,
  Search,
  Calendar,
} from "lucide-react";
import type { Insight } from "@/lib/api-types";

export function InsightDetail({ insight }: { insight: Insight }) {
  return (
    <article className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href="/explorer"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Explorer
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm truncate">{insight.title}</span>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <SourceBadge source={insight.source} />
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {insight.source_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(insight.source_date).toLocaleDateString()}
                </span>
              )}
              {insight.upvotes != null && insight.upvotes > 0 && (
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-3.5 w-3.5" />
                  {insight.upvotes}
                </span>
              )}
              {insight.comments_count != null && insight.comments_count > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {insight.comments_count}
                </span>
              )}
            </div>
          </div>

          <h1 className="text-xl font-bold leading-tight">{insight.title}</h1>

          {insight.product_name && (
            <p className="text-sm text-primary font-medium">
              {insight.product_name}
            </p>
          )}

          {insight.rating != null && <RatingStars rating={insight.rating} />}
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {insight.body}
          </p>

          {insight.pain_keywords?.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {insight.pain_keywords.map((kw) => (
                  <KeywordTag key={kw} keyword={kw} />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {insight.url && (
              <a
                href={insight.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Ver fuente original
                </Button>
              </a>
            )}
            <Link
              href={`/explorer?q=${encodeURIComponent(insight.title)}`}
            >
              <Button variant="outline" size="sm">
                <Search className="h-3.5 w-3.5 mr-1.5" />
                Buscar similares
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
