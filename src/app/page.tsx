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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              YouTube Video
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 ml-2">
                Summarizer
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Get concise, accurate summaries of any YouTube video in seconds.
              Save time and extract key insights without watching the entire
              content.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={user ? "/dashboard" : "/sign-up"}
                className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Try It Now
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>5 free summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Instant results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get video summaries in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Youtube className="w-8 h-8" />,
                title: "Paste YouTube URL",
                description:
                  "Simply copy and paste any YouTube video URL into our tool",
              },
              {
                icon: <Settings className="w-8 h-8" />,
                title: "Customize Options",
                description:
                  "Choose summary length and format based on your preferences",
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: "Get Summary",
                description:
                  "Receive a concise summary with key points and timestamps",
              },
            ].map((step, index) => (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-8">
                  <div className="bg-blue-100 text-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
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

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save Time?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start summarizing YouTube videos today and extract valuable insights
            in seconds.
          </p>
          <Button asChild size="lg" className="px-8 py-6 text-lg">
            <Link href={user ? "/dashboard" : "/sign-up"}>
              Get Started Now
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
