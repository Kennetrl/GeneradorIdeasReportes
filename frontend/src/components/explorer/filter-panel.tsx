"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_SOURCES, SOURCE_NAMES, CONTENT_TYPE_NAMES } from "@/lib/constants";
import { X } from "lucide-react";

export interface Filters {
  source: string;
  content_type: string;
  product_name: string;
  min_rating: string;
  date_from: string;
  date_to: string;
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

export function FilterPanel({ filters, onChange, onClear }: FilterPanelProps) {
  const update = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-40">
        <label className="text-xs text-muted-foreground mb-1 block">Fuente</label>
        <Select value={filters.source || undefined} onValueChange={(v) => update("source", v ?? "")}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {ALL_SOURCES.map((s) => (
              <SelectItem key={s} value={s}>
                {SOURCE_NAMES[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-40">
        <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
        <Select
          value={filters.content_type || undefined}
          onValueChange={(v) => update("content_type", v ?? "")}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(CONTENT_TYPE_NAMES).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-40">
        <label className="text-xs text-muted-foreground mb-1 block">Producto</label>
        <Input
          placeholder="Filtrar..."
          value={filters.product_name}
          onChange={(e) => update("product_name", e.target.value)}
          className="h-9"
        />
      </div>

      <div className="w-28">
        <label className="text-xs text-muted-foreground mb-1 block">Rating min</label>
        <Input
          type="number"
          min="1"
          max="5"
          step="0.5"
          placeholder="1-5"
          value={filters.min_rating}
          onChange={(e) => update("min_rating", e.target.value)}
          className="h-9"
        />
      </div>

      <div className="w-36">
        <label className="text-xs text-muted-foreground mb-1 block">Desde</label>
        <Input
          type="date"
          value={filters.date_from}
          onChange={(e) => update("date_from", e.target.value)}
          className="h-9"
        />
      </div>

      <div className="w-36">
        <label className="text-xs text-muted-foreground mb-1 block">Hasta</label>
        <Input
          type="date"
          value={filters.date_to}
          onChange={(e) => update("date_to", e.target.value)}
          className="h-9"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-9">
          <X className="h-3 w-3 mr-1" /> Limpiar
        </Button>
      )}
    </div>
  );
}
