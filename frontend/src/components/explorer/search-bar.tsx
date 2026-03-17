"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

export function SearchBar({ value, onChange, onSearch, loading }: SearchBarProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Busqueda semantica: describe un problema o necesidad..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="pl-9 h-11"
        />
      </div>
      <Button onClick={onSearch} disabled={loading} className="h-11">
        {loading ? "Buscando..." : "Buscar"}
      </Button>
    </div>
  );
}
