"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-white/10 bg-black py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-lime-400 text-black font-bold text-sm">
                PF
              </div>
              <span className="font-bold text-white">ProblemFinder</span>
            </div>
            <p className="text-sm text-gray-500">
              Turning real problems into validated startup ideas.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href={user ? "/ideas" : "/login"} className="hover:text-white transition">Idea Generator</Link></li>
              <li><Link href={user ? "/explorer" : "/login"} className="hover:text-white transition">Explorer</Link></li>
              <li><Link href={user ? "/reports" : "/login"} className="hover:text-white transition">Reports</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><span className="hover:text-white transition cursor-pointer">About</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Blog</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Careers</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><span className="hover:text-white transition cursor-pointer">Privacy</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Terms</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} ProblemFinder. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
