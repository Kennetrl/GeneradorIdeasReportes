export function SimilarityBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span>{pct}%</span>
    </div>
  );
}
