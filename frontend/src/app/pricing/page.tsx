"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Lock, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "STARTER",
    price: "$10",
    period: "/mo",
    description: "For indie hackers exploring ideas",
    features: [
      "10 Ideas per Month",
      "Daily Updates",
      "Basic Analytics",
      "Email Support",
    ],
    cta: "Select Starter",
    highlighted: false,
  },
  {
    name: "PRO",
    price: "$29",
    period: "/mo",
    description: "For serious builders and founders",
    features: [
      "Unlimited Ideas",
      "Real-time Pain Points",
      "Priority Analytics",
      "Trend Detection",
      "Export to CSV",
      "Priority Support",
    ],
    cta: "UPGRADE NOW",
    highlighted: true,
    badge: "MOST POPULAR",
  },
  {
    name: "CUSTOM",
    price: "Custom",
    period: "",
    description: "For teams and enterprises",
    features: [
      "Dedicated Support",
      "API Access",
      "Custom Training",
      "Custom Integrations",
      "SLA Guarantee",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSelectPlan = (planName: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    // TODO: Integrate with Stripe
    alert(`Stripe integration coming soon for ${planName} plan!`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-lime-400/10 border border-lime-400/20 mb-6">
            <Lock className="h-7 w-7 text-lime-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Unlock Full Access
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-lg">
            Access real-time pain points and validated solutions to build your
            next big thing with our premium intelligence suite.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlighted
                  ? "border-2 border-lime-400 bg-lime-400/5"
                  : "border border-white/10 bg-white/[0.03]"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-lime-400 text-black text-xs font-bold">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan info */}
              <div className="mb-6">
                <p className={`text-xs font-bold tracking-wider mb-3 ${
                  plan.highlighted ? "text-lime-400" : "text-gray-400"
                }`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-500 text-lg">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className={`flex items-center justify-center h-5 w-5 rounded-full ${
                      plan.highlighted ? "bg-lime-400/20" : "bg-white/10"
                    }`}>
                      <Check className={`h-3 w-3 ${
                        plan.highlighted ? "text-lime-400" : "text-lime-400"
                      }`} />
                    </div>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                  plan.highlighted
                    ? "bg-lime-400 text-black hover:bg-lime-500"
                    : "border border-white/20 text-white hover:bg-white/5"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Restore / Legal */}
        <div className="text-center space-y-3">
          <button className="text-sm text-white font-semibold hover:text-lime-400 transition">
            Restore Purchase
          </button>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            By upgrading, you agree to our{" "}
            <span className="text-gray-400 hover:text-white cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="text-gray-400 hover:text-white cursor-pointer">Privacy Policy</span>
            . Subscriptions automatically renew unless canceled.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 border-t border-white/10 pt-16">
          <h2 className="text-2xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <FaqItem
              q="Can I cancel anytime?"
              a="Yes, you can cancel your subscription at any time. You'll keep access until the end of your billing period."
            />
            <FaqItem
              q="What payment methods do you accept?"
              a="We accept all major credit cards (Visa, Mastercard, Amex) through Stripe."
            />
            <FaqItem
              q="Is there a free trial?"
              a="Every new account gets 5 free idea generations. No credit card required."
            />
            <FaqItem
              q="Can I upgrade or downgrade?"
              a="Yes, you can change your plan at any time. Changes take effect immediately."
            />
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          {!user && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-lime-400 text-black hover:bg-lime-500 font-bold px-8 py-3 rounded-xl transition text-base"
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-semibold text-sm mb-2">{q}</h3>
      <p className="text-sm text-gray-500">{a}</p>
    </div>
  );
}
