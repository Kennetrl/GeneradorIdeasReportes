"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2 } from "lucide-react";

interface IdeasFormProps {
  query: string;
  productName: string;
  onQueryChange: (v: string) => void;
  onProductChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function IdeasForm({
  query,
  productName,
  onQueryChange,
  onProductChange,
  onSubmit,
  loading,
}: IdeasFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-1 block">
          Describe el area o problema
        </label>
        <Input
          placeholder="Ej: problemas de facturacion en SaaS, herramientas de productividad..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">
          Producto (opcional)
        </label>
        <Input
          placeholder="Ej: Notion, Stripe, Slack..."
          value={productName}
          onChange={(e) => onProductChange(e.target.value)}
        />
      </div>
      <Button onClick={onSubmit} disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generando ideas...
          </>
        ) : (
          <>
            <Lightbulb className="h-4 w-4 mr-2" />
            Generar Ideas
          </>
        )}
      </Button>
    </div>
  );
}
