"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, AlertCircle, RefreshCw, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface SubscriptionSettingsProps {
  user: User;
  subscription: any | null;
}

export default function SubscriptionSettings({ user, subscription }: SubscriptionSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  const supabaseClient = createClientComponentClient();
  const router = useRouter();
  
  useEffect(() => {
    console.log("Subscription data in component:", subscription);
  }, [subscription]);
  
  // Check if subscription is active (not canceled or past due)
  const hasActiveSubscription = !!subscription && subscription.status === "active";
  const isCanceled = !!subscription && subscription.status === "canceled";
  
  // Use direct subscription data without relying on joined tables
  const planName = subscription 
    ? `Premium Plan (£${(subscription.amount / 100).toFixed(2)} / ${subscription.interval})`
    : "No subscription";
    
  const planPrice = subscription 
    ? new Intl.NumberFormat('en-GB', { 
        style: 'currency', 
        currency: subscription.currency || 'GBP'
      }).format(subscription.amount / 100)
    : "";
    
  const renewalDate = subscription && subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString() 
    : "";
  
  // Define available upgrade plans - replace with your actual plans
  const upgradePlans = [
    {
      name: "Pro Plan",
      price: "£24/month",
      priceId: "price_1234567890", // Replace with your actual Stripe Price ID
      features: ["All Basic features", "Advanced analytics", "Priority support"]
    },
  ];

  // Function to handle direct checkout for upgrade
  const handleUpgradeCheckout = async (priceId: string) => {
    setLoading(true);
    
    try {
      // Call your checkout API with the selected plan's price ID
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId,
          customerId: subscription?.customer, // Pass customer ID for upgrading existing subscription
          upgradeFromSubscriptionId: subscription?.stripe_id // Pass current subscription ID
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Could not create checkout session');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      toast.error("Error creating checkout: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  const handleManageSubscription = (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log("Safari button clicked, attempting navigation");
    
    // Use Next.js router instead of window.location
    router.push('/pricing');
    
    // Log after navigation attempt
    console.log("Navigation triggered");
  };
  
  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features.")) {
      return;
    }
    
    setCancelLoading(true);
    
    try {
      console.log("Canceling subscription:", subscription?.stripe_id);
      
      // Check if stripe_id exists
      if (!subscription?.stripe_id) {
        throw new Error("No subscription ID found");
      }
      
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_id
        })
      });
      
      console.log("Cancel response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Cancel response data:", data);
      
      // Now update the subscription in the database from the client
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({ 
          status: 'canceled',
          canceled_at: Math.floor(Date.now() / 1000)
        })
        .eq('stripe_id', subscription.stripe_id);
        
      if (updateError) {
        console.error("Error updating subscription in database:", updateError);
        // Show warning but don't fail - Stripe cancellation was successful
        toast.warning("Subscription canceled in Stripe, but database update failed.");
      } else {
        toast.success("Subscription canceled successfully");
      }
      
      // Refresh the page to show updated subscription status
      window.location.reload();
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      toast.error("Error canceling subscription: " + (error.message || "Unknown error"));
    } finally {
      setCancelLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {hasActiveSubscription ? (
        <>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center">
            <div>
              <h3 className="font-medium">Current Plan:</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{planName}</span>
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                {subscription.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center">
            <div>
              <h3 className="font-medium">Price:</h3>
            </div>
            <div>
              <span>{planPrice} / {subscription.interval}</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center">
            <div>
              <h3 className="font-medium">Next Billing Date:</h3>
            </div>
            <div>
              <span>{renewalDate}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <Button 
              onClick={handleManageSubscription} 
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Manage Plan
            </Button>
            
            <Button 
              onClick={handleCancelSubscription} 
              disabled={cancelLoading}
              variant="destructive"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700" // More prominent styling
            >
              {cancelLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Visit the pricing page to upgrade, downgrade, or view available plans.
          </p>
        </>
      ) : isCanceled ? (
        <>
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Subscription Canceled</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your subscription has been canceled but will remain active until {renewalDate}.
              After this date, you will lose access to premium features.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center">
            <div>
              <h3 className="font-medium">Current Plan:</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{planName}</span>
              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                Canceled
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center">
            <div>
              <h3 className="font-medium">Access Until:</h3>
            </div>
            <div>
              <span>{renewalDate}</span>
            </div>
          </div>
          
          <Button asChild>
            <a href="/pricing" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              View Plans
            </a>
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No active subscription</AlertTitle>
            <AlertDescription>
              You don't have an active subscription. Subscribe to a plan to use our premium features.
            </AlertDescription>
          </Alert>
          
          <Button asChild>
            <a href="/pricing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              View Pricing Plans
            </a>
          </Button>
        </div>
      )}
    </div>
  );
} 