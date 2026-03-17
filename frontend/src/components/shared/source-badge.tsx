import { Badge } from "@/components/ui/badge";
import { SOURCE_NAMES, SOURCE_BG } from "@/lib/constants";

export function SourceBadge({ source }: { source: string }) {
  return (
    <Badge variant="secondary" className={SOURCE_BG[source] || ""}>
      {SOURCE_NAMES[source] || source}
    </Badge>
  );
}
