"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthPage = pathname.includes("/login") || pathname.includes("/auth");

  if (isAuthPage) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/ideas", label: "Ideas" },
    { href: "/explorer", label: "Explorer" },
    { href: "/reports", label: "Reports" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-lime-400 text-black font-bold text-sm">
            PF
          </div>
          <span>ProblemFinder</span>
        </Link>

        {/* Center nav (logged in, desktop) */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  pathname === link.href
                    ? "text-lime-400 bg-lime-400/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition font-medium text-sm px-3 py-2 hidden sm:block">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-400 hover:text-white transition font-medium text-sm px-3 py-2">
                Sign In
              </Link>
              <Link href="/login" className="bg-lime-400 text-black hover:bg-lime-500 font-semibold px-4 py-2 rounded-lg transition text-sm">
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* Desktop user menu */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/profile"
                  className={`text-sm font-medium transition px-3 py-2 rounded-md ${
                    pathname === "/profile"
                      ? "text-lime-400 bg-lime-400/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {user.email?.split("@")[0]}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-red-400 transition px-3 py-2"
                >
                  Log out
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && user && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="fixed top-16 right-0 z-50 w-64 h-[calc(100vh-4rem)] bg-black border-l border-white/10 p-4 space-y-1 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-3 rounded-md text-sm font-medium transition ${
                  pathname === link.href
                    ? "text-lime-400 bg-lime-400/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-3" />
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-3 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              Profile
            </Link>
            <button
              onClick={() => { handleSignOut(); setMobileOpen(false); }}
              className="block w-full text-left px-3 py-3 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
            >
              Log out
            </button>
          </nav>
        </>
      )}
    </header>
  );
}
