"use client";

import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    description: string;
    features: string[];
    cta: string;
    popular: boolean;
    priceId: string;
  };
  isAuthenticated: boolean;
  subscription?: any; // Add subscription data prop
}

export default function PricingCard({ plan, isAuthenticated, subscription }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if this is the user's current plan
  const isCurrentPlan = subscription && 
    subscription.status === "active" && 
    subscription.price_id === plan.priceId;

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push('/sign-up?redirect=/pricing');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/checkout?priceId=${plan.priceId}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
      
      // Redirect to Stripe
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was a problem starting the checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden border transition-transform hover:scale-105 flex flex-col ${
        plan.popular
          ? "border-blue-500 relative md:scale-105 md:hover:scale-110"
          : "border-gray-200"
      }`}
    >
      {plan.popular && (
        <div className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 absolute right-0 top-0 rounded-bl-lg">
          MOST POPULAR
        </div>
      )}
      
      <div className="p-6 border-b bg-gray-50">
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <div className="mt-4">
          <span className="text-3xl font-bold">{plan.price}</span>
          <span className="text-gray-600">/month</span>
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-gray-600 mb-6">{plan.description}</p>
        
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="flex-shrink-0 text-green-500 mt-1">
                <Check size={18} />
              </div>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto">
          {isCurrentPlan ? (
            <div className="space-y-2">
              <Button
                disabled
                className="w-full py-6 opacity-70 cursor-not-allowed bg-gray-300 text-gray-700 hover:bg-gray-300"
              >
                Current Plan
              </Button>
              <Badge className="w-full justify-center flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle2 className="h-3 w-3" /> Active
              </Badge>
            </div>
          ) : (
            <Button
              onClick={handleClick}
              disabled={isLoading}
              className={`w-full py-6 ${
                plan.popular
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-800 hover:bg-gray-900"
              }`}
            >
              {isLoading ? "Loading..." : plan.cta}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}