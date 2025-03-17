import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Youtube,
  FileText,
  Settings,
  InfoIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import YouTubeForm from "@/components/youtube-form";
import { redirect } from "next/navigation";
import { useRouter } from 'next/navigation';
import { YouTubeFormWrapper } from "../components/youtube-form-wrapper";
import SummaryHistory from "@/components/summary-history";

// New client component to handle authentication-based behavior

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  // Check if user has an active subscription
  let isSubscribed = false;
  if (user) {
    // Query your subscription data from your database
    const { data: subscription } = await supabase
      .from('subscriptions') // Use your actual table name
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
      
    isSubscribed = !!subscription;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section - Only show if not authenticated or not subscribed */}
      {(!user || !isSubscribed) && (
        <section className="relative pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
                YouTube Video{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Summarizer
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Get concise, accurate summaries of any YouTube video in seconds.
                Save time and extract key insights without watching the entire
                content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={user ? "/pricing" : "/sign-up"}
                  className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  {user ? "Upgrade Now" : "Get Started"} 
                  <ArrowUpRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* YouTube Summarizer Form - Show for everyone but handle subscription in the wrapper */}
      <div className="container mx-auto px-4 pb-16 pt-28">
        <div className="max-w-3xl mx-auto">
          {/* If user is authenticated and subscribed, show welcome message with gradient */}
          {user && isSubscribed && (
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-bold mb-2">
                Welcome back! <span className="inline-block mx-2 px-3 py-1 rounded-lg bg-gray-100/70">
                  <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </span>
                </span>
              </h2>
              <p className="text-gray-600">
                Start summarizing YouTube videos with your premium subscription.
              </p>
            </div>
          )}
        
          <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center mb-4">
            <InfoIcon size="14" />
            <span>
              Paste any YouTube URL below to get an AI-generated summary of
              the video content
            </span>
          </div>
          
          <YouTubeFormWrapper 
            isAuthenticated={!!user} 
            isSubscribed={isSubscribed} 
          />
          
          {/* Only show summary history for authenticated and subscribed users */}
          {user && isSubscribed && (
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-4">Your Recent Summaries</h3>
              <SummaryHistory />
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered summarizer offers everything you need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Time Saving",
                description:
                  "Get the essence of videos without watching the entire content",
              },
              {
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "Accurate Summaries",
                description:
                  "AI-generated summaries that capture key points and insights",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Customizable Format",
                description:
                  "Choose between bullet points or paragraph summaries",
              },
              {
                icon: <Youtube className="w-6 h-6" />,
                title: "Works with Any Video",
                description: "Compatible with all public YouTube videos",
              },
              {
                icon: <Settings className="w-6 h-6" />,
                title: "Adjustable Length",
                description:
                  "Select brief or detailed summaries based on your needs",
              },
              {
                icon: <ArrowUpRight className="w-6 h-6" />,
                title: "Easy Sharing",
                description: "Copy or share summaries with just one click",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modify this section for non-authenticated or non-subscribed users */}
      {(!user || !isSubscribed) && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Save Time?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Start summarizing YouTube videos today and extract valuable insights
              in seconds.
            </p>
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link href={user ? "/pricing" : "/sign-up"}>
                {user ? "Upgrade Now" : "Get Started"}
                <ArrowUpRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
