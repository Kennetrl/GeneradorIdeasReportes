import { Badge } from "@/components/ui/badge";

export function KeywordTag({ keyword }: { keyword: string }) {
  return (
    <Badge variant="outline" className="text-xs font-normal">
      {keyword}
    </Badge>
  );
}
