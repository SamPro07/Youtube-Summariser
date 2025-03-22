"use client";

import { Check, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";
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
  subscription?: any;
}

export default function PricingCard({ plan, isAuthenticated, subscription }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if this is the user's current plan
  const isCurrentPlan = subscription && 
    subscription.status === "active" && 
    subscription.price_id === plan.priceId;

  // Determine if this plan is an upgrade or downgrade based on price
  const getPlanAction = () => {
    if (!subscription || !subscription.amount) return null;
    
    // Extract numeric value from plan price (remove currency symbol and convert to number)
    const planPrice = parseFloat(plan.price.replace(/[^0-9.]/g, ''));
    const currentPrice = subscription.amount / 100; // Assuming amount is in cents
    
    if (planPrice > currentPrice) return "upgrade";
    if (planPrice < currentPrice) return "downgrade";
    return null;
  };
  
  const planAction = getPlanAction();

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push('/sign-up?redirect=/pricing');
      return;
    }

    setIsLoading(true);
    
    try {
      // For new subscriptions
      if (!subscription) {
        const response = await fetch(`/api/checkout?priceId=${plan.priceId}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
        
        window.location.href = data.url;
        return;
      }
      
      // For plan changes - use create-checkout-session API with proper metadata
      // This ensures the old subscription is properly handled
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          customerId: subscription.customer,
          upgradeFromSubscriptionId: subscription.stripe_id // This helps identify which subscription to cancel
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
      
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was a problem processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render appropriate button based on subscription status
  const renderButton = () => {
    if (isCurrentPlan) {
      return (
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
      );
    }
    
    if (subscription && planAction) {
      // Show upgrade/downgrade button
      return (
        <Button
          onClick={handleClick}
          disabled={isLoading}
          className={`w-full py-6 flex items-center justify-center gap-2 ${
            planAction === "upgrade"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              {planAction === "upgrade" ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Upgrade Plan
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Downgrade Plan
                </>
              )}
            </>
          )}
        </Button>
      );
    }
    
    // Default button for non-subscribers
    return (
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
    );
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
          {renderButton()}
        </div>
      </div>
    </div>
  );
}