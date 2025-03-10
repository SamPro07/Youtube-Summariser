import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import YouTubeForm from "@/components/youtube-form";
import SummaryHistory from "@/components/summary-history";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">YouTube Video Summarizer</h1>
            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <InfoIcon size="14" />
              <span>
                Paste any YouTube URL below to get an AI-generated summary of
                the video content
              </span>
            </div>
          </header>

          {/* YouTube Summarizer Section */}
          <section>
            <YouTubeForm />
          </section>

          {/* Summary History Section */}
          <section className="mt-8">
            <SummaryHistory />
          </section>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
