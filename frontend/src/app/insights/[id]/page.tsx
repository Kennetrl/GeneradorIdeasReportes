import { getInsight } from "@/lib/api";
import type { Insight } from "@/lib/api-types";
import { InsightDetail } from "./insight-detail";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const insight = await getInsight(params.id);
    return {
      title: insight.title,
      description: insight.body?.slice(0, 160),
    };
  } catch {
    return { title: "Insight" };
  }
}

export default async function InsightPage({ params }: Props) {
  let insight: Insight;
  try {
    insight = await getInsight(params.id);
  } catch {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No se pudo cargar el insight. Verifica que el backend este activo.
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: insight.body?.slice(0, 300),
    datePublished: insight.source_date || insight.created_at,
    author: { "@type": "Organization", name: insight.source },
    keywords: insight.pain_keywords?.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InsightDetail insight={insight} />
    </>
  );
}
