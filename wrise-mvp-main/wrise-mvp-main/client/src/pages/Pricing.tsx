import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom"; 
import { supabase } from "@/lib/supabaseClient";

// const stripePromise = loadStripe("pk_test_51RT7ID2USteSvmCY8FXJUeHAfA47YE0FXWFwxdVPXTKf4tANeJKAF2QMCpWpcaoY6RuBde4eUdKSNWNKxhBBS2y6005IjyqudW");
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY || "");
type PricingTier = {
  monthly: string;
  yearly: string;
};

type Plan = {
  name: string;
  description: string;
  cta: string;
  popular?: boolean;
  price: PricingTier;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Starter",
    description: "Perfect for creators just starting out",
    cta: "Choose Starter",
    price: { monthly: "$0", yearly: "$0" },
    features: [
      "Connect YouTube & Instagram",
      "Basic fan interactions",
      "Manual content syncing",
      "Limited analytics",
    ],
    popular: false,
  },
  {
    name: "Growth",
    description: "For creators ready to monetize their audience",
    cta: "Choose Growth",
    price: { monthly: "$29", yearly: "$290" },
    features: [
      "Everything in Starter",
      "Fan subscription setup",
      "Automated content syncing",
      "Comment triggers & auto-replies",
      "Full analytics dashboard",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Pro",
    description: "For established creators scaling their business",
    cta: "Choose Pro",
    price: { monthly: "$79", yearly: "$790" },
    features: [
      "Everything in Growth",
      "Custom branding & domain",
      "API access",
      "Multiple fan hubs",
      "Team member accounts",
      "Dedicated support manager",
    ],
    popular: false,
  },
];

export default function PricingPage() {
  const [pricingTier, setPricingTier] = useState<"monthly" | "yearly">("monthly");

  const togglePricingTier = () => {
    setPricingTier(pricingTier === "monthly" ? "yearly" : "monthly");
  };

  const handlePlanSelect = async (planName: string, price: PricingTier) => {
    if (planName === "Starter") {
      window.location.href = "/onboarding";
      return;
    }

    // const supabaseUser = await supabase.auth.getUser();
    // const userId = supabaseUser.data.user?.id;
    // if(userId) {
    //   localStorage.setItem("userId", userId);
    //   localStorage.setItem("selectedPlan", planName);
    //   localStorage.setItem("selectedTier", pricingTier);
    // }
    
    try {
      const stripe = await stripePromise;
      const supabaseUser = await supabase.auth.getUser();
      const userId = supabaseUser.data.user?.id;

      const res = await fetch("https://clonark.onrender.com/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName, tier: pricingTier, userId }),
      });

      const data = await res.json();

      if (data.url && stripe) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout session.");
      }
    } catch (error) {
      console.error("Stripe error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

    const handleConnectStripe = async () => {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;

    if (!userId) {
      alert("Please sign in first.");
      return;
    }

    const clientId = "ca_So769sMEcdJwXnSXSDrshmcXill26vn0";
    const redirectUri = encodeURIComponent("https://clonark.onrender.com/api/oauth/callback");
    const state = encodeURIComponent(userId);
    const connectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${redirectUri}&state=${state}`;

    // const connectUrl = `https://connect.stripe.com/oauth/authorize?client_id=${clientId}&state=${state}&redirect_uri=${redirectUri}`;

    window.location.href = connectUrl;
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing for Creators
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Choose the plan that's right for your creator journey. Scale as your audience grows.
          </p>
          <div className="bg-white rounded-full p-1 inline-flex">
            <button
              onClick={togglePricingTier}
              className={`px-5 py-2 rounded-full text-sm ${
                pricingTier === "monthly" ? "bg-wrise-primary text-white" : "text-gray-600"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={togglePricingTier}
              className={`px-5 py-2 rounded-full text-sm ${
                pricingTier === "yearly" ? "bg-wrise-primary text-white" : "text-gray-600"
              }`}
            >
              Yearly (Save 15%)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-8 transition-all ${
                plan.popular
                  ? "ring-2 ring-wrise-primary shadow-lg scale-105 md:scale-110"
                  : "border shadow-sm hover:shadow"
              }`}
            >
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-4">{plan.description}</p>
              <div className="text-4xl font-bold mb-4">{plan.price[pricingTier]}</div>
              <ul className="mb-6 space-y-2 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handlePlanSelect(plan.name, plan.price)}
                className={`w-full ${
                  plan.popular ? "btn-gradient" : "bg-gray-800 hover:bg-gray-900 text-white"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Custom Solution Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="md:flex items-center justify-between">
              <div className="mb-6 md:mb-0 md:pr-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Need a custom solution?
                </h2>
                <p className="text-lg text-gray-600">
                  For creators with large audiences or special requirements, we offer tailored plans.
                </p>
              </div>
              <Link to="/onboarding">
                <Button
                  className="px-8 h-12 bg-gray-800 hover:bg-gray-900 text-white">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Setup Payment Method Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Setup Your Payment Method
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              To start receiving payments from your fans, connect your Stripe account and configure your payment settings.
            </p>
              <Button
                onClick={handleConnectStripe}
                className="px-8 h-12 bg-orange-500 text-white hover:bg-orange-600"
              >
                Setup Payment Method
              </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "How does the fan subscription pricing work?",
                answer:
                  "You set the price for fan subscriptions (typically $4.99-$9.99 per month). Wrise takes a 5% platform fee, and payment processors take 2.9% + $0.30 per transaction. The rest goes directly to you as the creator.",
              },
              {
                question: "Can I cancel my Wrise plan anytime?",
                answer:
                  "Yes, all plans can be canceled at any time. For monthly plans, you'll have access until the end of your billing period. For annual plans, we don't provide partial refunds.",
              },
              {
                question: "How often is content synced from my social accounts?",
                answer:
                  "For Growth and Pro plans, content is synced automatically every 24 hours. For Starter plans, you'll need to manually trigger syncs. You can always trigger an immediate sync from your dashboard at any time.",
              },
              {
                question: "Is there a limit to how many fans can subscribe?",
                answer:
                  "There's no limit to how many fans can subscribe to your fan hub. Our infrastructure scales automatically as your audience grows.",
              },
              {
                question: "Do fans need to create a Wrise account to access my hub?",
                answer:
                  "Fans can browse your public content without an account, but they'll need to create a free Wrise account to subscribe to premium content or ask questions.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your Fan Hub?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Connect your accounts, set your price, and launch within minutes.
            No technical skills required.
          </p>
          <Link to="/onboarding">
            <Button className="bg-white text-wrise-primary hover:bg-white/90 text-lg rounded-full px-8 py-6 h-auto">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

