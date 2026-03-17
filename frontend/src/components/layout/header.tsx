"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isHomePage = pathname === "/";
  const isAuthPage = pathname.includes("/login") || pathname.includes("/auth");

  // En auth pages, no mostrar header
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-lime-400 text-black font-bold">
            🧠
          </div>
          <span>ProblemFinder</span>
        </Link>

        {/* Centro: Nav (solo en dashboard logged in) */}
        {user && !isHomePage && (
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/ideas" className="text-muted-foreground hover:text-white transition">
              Ideas
            </Link>
            <Link href="/saved" className="text-muted-foreground hover:text-white transition">
              Guardadas
            </Link>
          </nav>
        )}

        {/* Right: Auth buttons o user menu */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="bg-lime-400 text-black hover:bg-lime-500 font-semibold" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.email?.split("@")[0]}</span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
