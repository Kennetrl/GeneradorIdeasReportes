import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SourceBadge } from "@/components/shared/source-badge";
import { KeywordTag } from "@/components/shared/keyword-tag";
import { SimilarityBar } from "@/components/shared/similarity-bar";
import { RatingStars } from "@/components/shared/rating-stars";
import { ArrowUp, MessageSquare } from "lucide-react";
import type { Insight } from "@/lib/api-types";

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Link href={`/insights/${insight.id}`}>
      <Card className="transition-colors hover:bg-accent/50 h-full">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <SourceBadge source={insight.source} />
            {insight.similarity != null && (
              <SimilarityBar value={insight.similarity} />
            )}
          </div>

          <div>
            <h3 className="font-medium text-sm line-clamp-2 leading-snug">
              {insight.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-3 mt-1.5">
              {insight.body}
            </p>
          </div>

          {insight.product_name && (
            <p className="text-xs text-primary font-medium">
              {insight.product_name}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {insight.upvotes != null && insight.upvotes > 0 && (
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                {insight.upvotes}
              </span>
            )}
            {insight.comments_count != null && insight.comments_count > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {insight.comments_count}
              </span>
            )}
            {insight.rating != null && <RatingStars rating={insight.rating} />}
          </div>

          {insight.pain_keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {insight.pain_keywords.slice(0, 4).map((kw) => (
                <KeywordTag key={kw} keyword={kw} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
