import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Check as LucideCheck, ChevronUp, ChevronDown } from "lucide-react";

// Define plan tiers for comparison
const PLAN_TIERS: Record<string, number> = {
  "free": 0,
  "basic": 1,
  "pro": 2,
  "enterprise": 3
};

// Define Plan interface
interface Plan {
  name: string;
  tier: number;
  price: string;
  interval: string;
  priceId: string | null;
  features: string[];
  popular: boolean;
  description: string;
  period: string;
}

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get subscription data if user is logged in
  let subscription = null;
  let currentPlanTier = 0; // Default to free tier
  
  if (user) {
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
      
    subscription = subscriptionData;
    console.log("Found subscription data:", subscriptionData);
    
    // Determine current plan tier based on subscription
    if (subscription) {
      // Extract price ID from subscription and match it directly to plans
      const priceId = subscription.price_id;
      
      if (priceId === "price_1OOC9JH4bzAqxCRRxYZhIkBq") {
        currentPlanTier = 1; // Basic
      } else if (priceId === "price_1OOC9KH4bzAqxCRRh7Mjmkb0") {
        currentPlanTier = 2; // Pro
      } else if (priceId === "price_1OOC9NH4bzAqxCRRqkGGmIvF") {
        currentPlanTier = 3; // Enterprise
      } else {
        currentPlanTier = 0; // Free
      }
      
      console.log("Current plan tier:", currentPlanTier);
    }
  }
  
  // Pricing plans
  const plans = [
    {
      name: "Basic Plan",
      price: "£1.00",
      period: "per month",
      description: "Get fast, AI-generated summaries for short YouTube videos up to 15 minutes long. Ideal for quick insights into educational clips, news, and tutorials.",
      features: [
        "Summarize YouTube videos up to 15 minutes",
        "AI-powered quick insights",
        "Bullet-point summaries",
        "Ideal for short educational clips, news, or tutorials"
      ],
      priceId: "price_1R1qvqEA8X51ZZ0PgR6R9vDc", // Your Stripe price ID
      popular: false
    },
    {
      name: "Standard Plan",
      price: "£12.00",
      period: "per month",
      description: "Need more in-depth summaries? This plan lets you process videos up to 30 minutes long, perfect for podcasts, interviews, and detailed tutorials. Get structured summaries with key takeaways.",
      features: [
        "Summarize YouTube videos up to 30 minutes",
        "AI-powered summaries with key takeaways",
        "Paragraph-based summaries for better understanding",
        "Ideal for podcasts, interviews, and longer tutorials",
        "Priority processing for faster results"
      ],
      priceId: "price_1R1qoBEA8X51ZZ0PYvGOQKMi", // Your Stripe price ID
      popular: true
    },
    {
      name: "Pro Plan",
      price: "£24.00",
      period: "per month",
      description: "For power users who want full-length video summaries! Get structured breakdowns of lectures, documentaries, and long-form content with chapter-wise segmentation and priority processing.",
      features: [
        "Summarize YouTube videos of ANY length (60+ minutes included)",
        "AI-powered, detailed breakdowns",
        "Chapter-wise segmentation for longer videos",
        "Perfect for documentaries, lectures, and full-length courses",
        "Highest priority processing for the fastest results",
        "Early access to new AI features"
      ],
      priceId: "price_1R1qwZEA8X51ZZ0P0rgXMakQ", // Your Stripe price ID
      popular: false
    }
  ];
  
  // Helper function with typed parameters
  const renderPlanButton = (plan: Plan, isSignedIn: boolean, currentTier: number) => {
    if (!isSignedIn) {
      return (
        <Button asChild className="w-full">
          <Link href={`/sign-in?redirect=/pricing?plan=${plan.priceId}`}>Sign up</Link>
        </Button>
      );
    }
    
    if (plan.tier === currentTier) {
      return (
        <Button disabled className="w-full bg-green-100 text-green-800 hover:bg-green-100">
          Current Plan
        </Button>
      );
    }
    
    if (plan.tier > currentTier) {
      // Upgrade button
      return (
        <Button asChild className="w-full">
          <Link href={`/api/create-checkout?priceId=${plan.priceId}`} className="flex items-center justify-center gap-1">
            <ChevronUp className="h-4 w-4" />
            Upgrade
          </Link>
        </Button>
      );
    }
    
    // Downgrade button
    return (
      <Button variant="outline" asChild className="w-full">
        <Link href={`/api/create-checkout?priceId=${plan.priceId}`} className="flex items-center justify-center gap-1">
          <ChevronDown className="h-4 w-4" />
          Downgrade
        </Link>
      </Button>
    );
  };
  
  // Replace with your Stripe checkout initialization function
  const handleSubscription = async (priceId: string) => {
    // Implement your subscription logic here
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600">
              Get AI-powered YouTube video summaries that save you time and help you extract key insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border transition-transform hover:scale-[1.02] flex flex-col ${
                  plan.popular ? 'border-blue-500 ring-1 ring-blue-500 transform scale-[1.02]' : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-2 font-medium">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8 flex flex-col flex-grow">
                  <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-8">
                    {plan.description}
                  </p>
                  <div className="space-y-4 flex-grow">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <Button 
                      className={`w-full py-6 ${
                        plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''
                      }`}
                      asChild
                    >
                      <Link href={user ? `/api/create-checkout?priceId=${plan.priceId}` : '/sign-up'}>
                        {user ? 'Subscribe Now' : 'Sign Up & Subscribe'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}