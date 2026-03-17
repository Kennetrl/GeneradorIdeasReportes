import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Pagina no encontrada
      </p>
      <Link href="/" className="mt-6">
        <Button>Volver al Dashboard</Button>
      </Link>
    </div>
  );
}
