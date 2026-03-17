"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Sparkles,
  Search,
  TrendingUp,
  ArrowRight,
  Zap,
  BarChart3,
  FileText,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return <LandingPage />;
}

// ============================================================
// LANDING PAGE (public, not logged in)
// ============================================================
function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleGenerateClick = () => {
    if (!searchQuery.trim()) return;
    // Store the query for after login
    sessionStorage.setItem("pf_initial_query", searchQuery);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-6 py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-lime-500/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-lime-400/3 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-block rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1.5">
            <span className="text-sm font-semibold text-lime-300">
              POWERED BY AI + REAL DATA
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            Turn Real Problems
            <br />
            into <span className="text-lime-400">Startups</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-12 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            We analyze thousands of real user complaints from App Store, Reddit &
            more. Describe a space — get 5 validated startup ideas with evidence.
          </p>

          {/* Input + CTA */}
          <div className="mb-6 flex gap-3 flex-col sm:flex-row max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Describe a problem or startup idea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerateClick();
              }}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 px-6 text-base flex-1"
            />
            <Button
              onClick={handleGenerateClick}
              className="bg-lime-400 hover:bg-lime-500 text-black font-bold px-8 h-14 text-base whitespace-nowrap"
            >
              Generate Ideas <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-500 mb-16">
            Get 5 validated startup ideas for free — no credit card required
          </p>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 border-t border-white/10 pt-8">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-black" />
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-black" />
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-black" />
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 border-2 border-black flex items-center justify-center text-xs font-bold text-black">
                  +
                </div>
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">1,200+ builders this week</p>
                <p className="text-xs text-gray-500">Devs, indie hackers & founders</p>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-white/10" />

            <div className="text-left">
              <p className="font-semibold text-sm">New problems detected daily</p>
              <p className="text-xs text-gray-500">From Reddit, App Store & more</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How it works
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-lg mx-auto">
            From real user pain to actionable startup blueprint in seconds
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step="01"
              icon={<Search className="h-6 w-6" />}
              title="Describe a space"
              description="Tell us a problem area or industry. Our AI searches thousands of real complaints and pain points."
            />
            <StepCard
              step="02"
              icon={<Zap className="h-6 w-6" />}
              title="Get validated ideas"
              description="We generate 5 startup ideas backed by real evidence — actual user reviews, ratings, and frequency data."
            />
            <StepCard
              step="03"
              icon={<BarChart3 className="h-6 w-6" />}
              title="Execute with data"
              description="Each idea comes with demand score, competition analysis, MVP suggestions, and monetization strategies."
            />
          </div>
        </div>
      </section>

      {/* SAMPLE IDEAS */}
      <section className="px-6 py-20 bg-white/[0.02] border-t border-white/10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Recently Generated Ideas
              </h2>
              <p className="text-gray-500">Real ideas from real problems</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <IdeaPreviewCard
              category="SAAS"
              categoryColor="bg-green-500/20 text-green-300"
              title="AI-Powered Legal Clerk"
              description="Automating discovery for boutique law firms through neural document processing and semantic search..."
              metrics={{ demand: 75, profitability: 85, competition: 45 }}
            />
            <IdeaPreviewCard
              category="FOODTECH"
              categoryColor="bg-blue-500/20 text-blue-300"
              title="Ghost Kitchen OS"
              description="A unified operational dashboard for multi-brand kitchen operations to manage orders, inventory..."
              metrics={{ demand: 78, profitability: 64, competition: 42 }}
            />
            <IdeaPreviewCard
              category="LOGISTICS"
              categoryColor="bg-purple-500/20 text-purple-300"
              title="Last-Mile Carbon Optimizer"
              description="Using real-time telemetry to reduce carbon footprint for local delivery networks in urban centers..."
              metrics={{ demand: 88, profitability: 72, competition: 58 }}
            />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-lime-400/30 bg-gradient-to-r from-lime-500/5 to-transparent p-12 text-center">
          <h2 className="mb-4 text-3xl md:text-4xl font-bold">
            Ready to find your next idea?
          </h2>
          <p className="mb-8 text-gray-400">
            Join thousands of entrepreneurs using ProblemFinder to validate their next venture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-lime-400 text-black hover:bg-lime-500 font-bold h-12 px-8 rounded-lg transition text-base"
            >
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            5 free ideas. No credit card required.
          </p>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// DASHBOARD (logged in)
// ============================================================
function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, sources: 0, painPoints: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Check if there's a stored query from before login
    const storedQuery = sessionStorage.getItem("pf_initial_query");
    if (storedQuery) {
      sessionStorage.removeItem("pf_initial_query");
      setSearchQuery(storedQuery);
    }

    // Fetch stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/insights/stats`
      );
      if (res.ok) {
        const data = await res.json();
        setStats({
          total: data.total || 0,
          sources: Object.keys(data.by_source || {}).length,
          painPoints: data.by_content_type?.pain_point || 0,
        });
      }
    } catch {
      // Stats not available yet
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/ideas?q=${encodeURIComponent(searchQuery)}`);
  };

  const firstName = user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="text-gray-500">
            Discover validated startup ideas backed by real user pain points.
          </p>
        </div>

        {/* Search */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-4">Generate new ideas</h2>
          <div className="flex gap-3 flex-col sm:flex-row">
            <Input
              type="text"
              placeholder="Describe a problem, industry, or pain point..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 px-5 text-base flex-1"
            />
            <Button
              onClick={handleSearch}
              className="bg-lime-400 hover:bg-lime-500 text-black font-bold px-6 h-12 text-sm whitespace-nowrap"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Generate Ideas
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Insights"
            value={loadingStats ? "..." : stats.total.toLocaleString()}
            icon={<BarChart3 className="h-5 w-5 text-lime-400" />}
          />
          <StatCard
            label="Data Sources"
            value={loadingStats ? "..." : String(stats.sources)}
            icon={<FileText className="h-5 w-5 text-blue-400" />}
          />
          <StatCard
            label="Pain Points"
            value={loadingStats ? "..." : stats.painPoints.toLocaleString()}
            icon={<Zap className="h-5 w-5 text-amber-400" />}
          />
          <StatCard
            label="Ideas Generated"
            value="5 free"
            icon={<Sparkles className="h-5 w-5 text-purple-400" />}
          />
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <QuickActionCard
            href="/ideas"
            icon={<Sparkles className="h-6 w-6 text-lime-400" />}
            title="Idea Generator"
            description="Generate validated startup ideas from real user pain points using AI."
          />
          <QuickActionCard
            href="/explorer"
            icon={<Search className="h-6 w-6 text-blue-400" />}
            title="Pain Point Explorer"
            description="Search and filter through thousands of real user reviews and complaints."
          />
          <QuickActionCard
            href="/reports"
            icon={<FileText className="h-6 w-6 text-purple-400" />}
            title="Competitive Reports"
            description="Generate AI-powered competitive analysis reports for any product."
          />
        </div>

        {/* Trending categories */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Trending Categories</h2>
          <div className="flex flex-wrap gap-3">
            {[
              "SaaS", "AI Tools", "E-Commerce", "Fintech", "Health Tech",
              "Education", "Developer Tools", "Marketplaces", "Logistics", "Social",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSearchQuery(cat);
                  router.push(`/ideas?q=${encodeURIComponent(cat)}`);
                }}
                className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300 hover:border-lime-400/30 hover:text-lime-400 transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sample trending ideas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Trending Ideas</h2>
            <Link
              href="/ideas"
              className="text-sm text-lime-400 hover:text-lime-300 transition flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TrendingIdeaCard
              category="AI"
              title="AI Meeting Summarizer for Remote Teams"
              pain="Teams waste 30min+ per meeting on notes"
              demand={82}
            />
            <TrendingIdeaCard
              category="SAAS"
              title="No-Code API Connector"
              pain="Non-technical users can't integrate tools"
              demand={76}
            />
            <TrendingIdeaCard
              category="FINTECH"
              title="Freelancer Tax Autopilot"
              pain="Freelancers lose money on missed deductions"
              demand={91}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-xl border border-white/10 bg-white/5 p-6 hover:border-lime-400/20 transition">
      <div className="text-xs font-bold text-lime-400 mb-3">{step}</div>
      <div className="mb-3 text-lime-400">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function IdeaPreviewCard({
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
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:border-lime-400/30 transition group relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded text-xs font-bold ${categoryColor}`}>
          {category}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 line-clamp-2">{description}</p>

      <div className="space-y-3 mb-6">
        <MetricBar label="DEMAND" value={metrics.demand} />
        <MetricBar label="PROFITABILITY" value={metrics.profitability} />
        <MetricBar label="COMPETITION" value={metrics.competition} />
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-center pb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-200 font-semibold px-6 py-2.5 rounded-lg transition text-sm"
        >
          <Lock className="h-3.5 w-3.5" /> Unlock full idea
        </Link>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-400">{label}</span>
        <span className="text-xs text-gray-500">{value}%</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-lime-400 to-lime-300 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-lime-400/30 hover:bg-white/[0.07] transition group block"
    >
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-bold mb-1 group-hover:text-lime-400 transition">
        {title}
      </h3>
      <p className="text-sm text-gray-400">{description}</p>
    </Link>
  );
}

function TrendingIdeaCard({
  category,
  title,
  pain,
  demand,
}: {
  category: string;
  title: string;
  pain: string;
  demand: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 hover:border-lime-400/20 transition">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-400/10 text-lime-400">
          {category}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
          <TrendingUp className="h-3 w-3" /> {demand}% demand
        </span>
      </div>
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{pain}</p>
    </div>
  );
}
