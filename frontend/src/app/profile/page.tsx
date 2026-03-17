"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, Calendar, LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const email = user.email || "";
  const username = email.split("@")[0];
  const initials = username.slice(0, 2).toUpperCase();
  const provider = user.app_metadata?.provider || "email";
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-gray-500">Manage your account settings</p>
        </div>

        {/* Avatar + Name */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-6">
          <div className="flex items-center gap-5 mb-8">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-black font-bold text-2xl">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold">{username}</h2>
              <p className="text-gray-400 text-sm">{email}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="space-y-4">
            <InfoRow
              icon={<Mail className="h-4 w-4 text-gray-400" />}
              label="Email"
              value={email}
            />
            <InfoRow
              icon={<Shield className="h-4 w-4 text-gray-400" />}
              label="Auth Provider"
              value={provider.charAt(0).toUpperCase() + provider.slice(1)}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4 text-gray-400" />}
              label="Member since"
              value={createdAt}
            />
            <InfoRow
              icon={<User className="h-4 w-4 text-gray-400" />}
              label="Plan"
              value="Free"
              badge={
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-400/10 text-lime-400">
                  5 ideas
                </span>
              }
            />
          </div>
        </div>

        {/* Plan section */}
        <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Upgrade to Pro</h3>
              <p className="text-sm text-gray-400 mt-1">
                Get unlimited ideas, advanced filters, trend detection, and export.
              </p>
            </div>
            <span className="text-2xl font-bold text-lime-400">$29<span className="text-sm text-gray-400 font-normal">/mo</span></span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {[
              "Unlimited ideas",
              "Advanced filters",
              "Trend detection",
              "Export to CSV",
              "Priority support",
              "API access",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                {feature}
              </div>
            ))}
          </div>
          <Button className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold h-11">
            Upgrade Now
          </Button>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h3 className="text-lg font-bold mb-4 text-red-400">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign out of your account</p>
              <p className="text-xs text-gray-500 mt-1">
                You will be redirected to the home page.
              </p>
            </div>
            <Button
              onClick={handleSignOut}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-semibold"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value}</span>
        {badge}
      </div>
    </div>
  );
}
