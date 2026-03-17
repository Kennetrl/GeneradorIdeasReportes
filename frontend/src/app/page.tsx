"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Si está logueado, ir al dashboard
  if (user) {
    return <Dashboard />;
  }

  const handleGenerateClick = () => {
    if (!searchQuery.trim()) {
      alert("Describe un problema o idea");
      return;
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-6 py-20 md:py-32">
        {/* Fondo gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-lime-500/10 via-transparent to-transparent"></div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-block rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1.5">
            <span className="text-sm font-semibold text-lime-300">
              ✨ NOW POWERED BY GPT-4O
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl md:text-7xl font-bold leading-tight">
            Turn Sparks into
            <br />
            <span className="text-lime-400">Startups</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-12 text-lg md:text-xl text-gray-400">
            Describe a problem or a space you're interested in. We'll generate 5
            validated, high-potential startup ideas with full execution blueprints.
          </p>

          {/* Input + CTA */}
          <div className="mb-8 flex gap-3 flex-col md:flex-row">
            <Input
              type="text"
              placeholder="Describe a problem or startup idea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleGenerateClick();
              }}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 px-6 text-base"
            />
            <Button
              onClick={handleGenerateClick}
              className="bg-lime-400 hover:bg-lime-500 text-black font-bold px-8 h-14 text-base whitespace-nowrap"
            >
              Generate ideas →
            </Button>
          </div>

          {/* Micro copy */}
          <p className="text-sm text-gray-500">
            Get 5 validated startup ideas for free
          </p>

          {/* PROOF SECTION */}
          <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 border-t border-white/10 pt-8">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-black"></div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-black"></div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-black"></div>
              </div>
              <div>
                <p className="font-semibold">Used by 1,200+ builders this week</p>
                <p className="text-sm text-gray-500">Devs, indie hackers, entrepreneurs</p>
              </div>
            </div>

            <div className="hidden md:block h-12 w-px bg-white/10"></div>

            <div>
              <p className="font-semibold">🔥 Being built RIGHT NOW</p>
              <p className="text-sm text-gray-500">Ideas your peers are executing on</p>
            </div>
          </div>
        </div>
      </section>

      {/* SAMPLE IDEAS SECTION */}
      <section className="px-6 py-20 bg-white/5 border-t border-white/10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Recently Generated Gems
              </h2>
              <p className="text-gray-500">Updated 2m ago</p>
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 hidden md:inline-flex">
              View all
            </Button>
          </div>

          {/* 3 Sample Ideas */}
          <div className="grid md:grid-cols-3 gap-6">
            <IdeaCard
              category="SAAS"
              categoryColor="bg-green-500/20 text-green-300"
              title="AI-Powered Legal Clerk"
              description="Automating discovery for boutique law firms through neural document processing and semantic search patterns."
              metrics={{
                demand: 75,
                profitability: 85,
                competition: 45,
              }}
            />

            <IdeaCard
              category="E-COMMERCE"
              categoryColor="bg-blue-500/20 text-blue-300"
              title="Micro-SaaS for Ghost Kitchens"
              description="A unified operational dashboard specifically designed for multi-brand kitchen operations to manage overhead..."
              metrics={{
                demand: 78,
                profitability: 64,
                competition: 42,
              }}
            />

            <IdeaCard
              category="LOGISTICS"
              categoryColor="bg-purple-500/20 text-purple-300"
              title="Last-Mile Optimization"
              description="Using real-time telemetry to reduce carbon footprint for small-scale local delivery networks in urban centers..."
              metrics={{
                demand: 88,
                profitability: 72,
                competition: 58,
              }}
            />
          </div>
        </div>
      </section>

      {/* FOMO SECTION */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-lime-400/30 bg-gradient-to-r from-lime-500/5 to-transparent p-12 text-center">
          <h2 className="mb-6 text-3xl md:text-4xl font-bold">
            Unlock your first 5 ideas
          </h2>
          <p className="mb-8 text-gray-400">
            Join over 12,000 entrepreneurs who use ProblemFinder to find their
            next multi-million dollar venture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/login")}
              className="bg-lime-400 text-black hover:bg-lime-500 font-bold h-12 px-8"
            >
              Start Free
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 h-12 px-8"
            >
              View Examples
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>
    </div>
  );
}

// Componente IdeaCard
function IdeaCard({
  category,
  categoryColor,
  title,
  description,
  metrics,
}: {
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  metrics: { demand: number; profitability: number; competition: number };
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:border-lime-400/30 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded text-xs font-bold ${categoryColor}`}>
          {category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-2">{title}</h3>

      {/* Description (truncado) */}
      <p className="text-sm text-gray-400 mb-6 line-clamp-2">{description}</p>

      {/* Metrics */}
      <div className="space-y-3 mb-6">
        <MetricBar label="DEMAND" value={metrics.demand} />
        <MetricBar label="PROFITABILITY" value={metrics.profitability} />
        <MetricBar label="COMPETITION" value={metrics.competition} />
      </div>

      {/* CTA */}
      <Button
        className="w-full bg-white text-black hover:bg-gray-200 font-semibold"
      >
        🔓 Unlock full idea
      </Button>
    </div>
  );
}

// Componente MetricBar
function MetricBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-400">{label}</span>
        <span className="text-xs text-gray-500">{value}%</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-lime-400 to-lime-300 rounded-full"
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

// Dashboard para usuarios logueados
function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-12">Welcome back! 👋</h1>

        {/* Placeholder */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-lime-400" />
          <p className="text-gray-400">Dashboard en construcción...</p>
        </div>
      </div>
    </div>
  );
}
