import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { youtube_url, summary_format, summary_length, user_id } =
      await req.json();

    if (!youtube_url) {
      return new Response(
        JSON.stringify({ error: "YouTube URL is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Extract video ID from URL
    const videoId = extractVideoId(youtube_url);
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // In a real implementation, you would:
    // 1. Fetch video transcript using YouTube API or a scraping service
    // 2. Process the transcript with an AI service like OpenAI
    // 3. Format the response based on user preferences

    // For this demo, we'll return mock data
    const summaryData = generateMockSummary(
      videoId,
      summary_format || "bullets",
      summary_length || "brief",
    );

    // Store in database if user is authenticated
    if (user_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey =
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase.from("summaries").insert({
        user_id,
        youtube_url,
        video_title: summaryData.videoTitle,
        summary_text: summaryData.keyPoints.join(" "),
        key_points: summaryData.keyPoints,
        timestamps: summaryData.timestamps,
        main_takeaways: summaryData.mainTakeaways,
        summary_format: summary_format || "bullets",
        summary_length: summary_length || "brief",
      });
    }

    return new Response(JSON.stringify(summaryData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

// Mock function to generate summary data
function generateMockSummary(videoId: string, format: string, length: string) {
  // Different mock data based on video ID to simulate different videos
  const lastChar = videoId.charAt(videoId.length - 1);
  const mockIndex = parseInt(lastChar, 16) % 3; // Use last character to pick one of 3 mock datasets

  const mockData = [
    {
      videoTitle: "Introduction to Machine Learning",
      keyPoints: [
        "Machine learning is a subset of artificial intelligence",
        "It focuses on algorithms that can learn from data",
        "Supervised learning requires labeled training data",
        "Unsupervised learning works with unlabeled data",
      ],
      timestamps: [
        { time: "0:00", content: "Introduction and overview" },
        { time: "2:15", content: "What is machine learning" },
        { time: "5:30", content: "Types of machine learning algorithms" },
        { time: "10:45", content: "Supervised learning explained" },
        { time: "15:20", content: "Unsupervised learning explained" },
        { time: "20:10", content: "Real-world applications" },
        { time: "25:30", content: "Conclusion and resources" },
      ],
      mainTakeaways: [
        "Machine learning is transforming many industries",
        "Understanding the different types of algorithms is essential",
        "Choosing the right approach depends on your data and goals",
        "Getting started requires basic programming and statistics knowledge",
      ],
    },
    {
      videoTitle: "Web Development in 2023",
      keyPoints: [
        "JavaScript frameworks continue to dominate web development",
        "React remains the most popular frontend library",
        "Server-side rendering and static site generation are increasingly important",
        "WebAssembly is opening new possibilities for web performance",
      ],
      timestamps: [
        { time: "0:00", content: "Introduction to web development trends" },
        { time: "3:45", content: "Frontend frameworks overview" },
        { time: "8:20", content: "Backend technologies and trends" },
        { time: "12:50", content: "Full-stack frameworks" },
        { time: "17:15", content: "Performance optimization techniques" },
        { time: "22:30", content: "Career opportunities in web development" },
        { time: "26:10", content: "Learning resources and conclusion" },
      ],
      mainTakeaways: [
        "The web development landscape continues to evolve rapidly",
        "Full-stack knowledge is increasingly valuable",
        "Performance and user experience are critical differentiators",
        "Continuous learning is essential for web developers",
      ],
    },
    {
      videoTitle: "Digital Marketing Strategies",
      keyPoints: [
        "Content marketing remains the foundation of digital marketing",
        "Social media platforms require tailored approaches",
        "SEO is evolving with AI and voice search",
        "Data-driven decision making is essential for campaign optimization",
      ],
      timestamps: [
        { time: "0:00", content: "Introduction to digital marketing" },
        { time: "4:15", content: "Content marketing strategies" },
        { time: "9:30", content: "Social media marketing approaches" },
        { time: "14:45", content: "Search engine optimization in 2023" },
        { time: "19:20", content: "Email marketing best practices" },
        { time: "23:50", content: "Analytics and performance measurement" },
        { time: "28:15", content: "Conclusion and action steps" },
      ],
      mainTakeaways: [
        "Integrated marketing approaches yield the best results",
        "Understanding your audience is the key to effective marketing",
        "Testing and optimization should be continuous processes",
        "Building authentic connections with customers drives long-term success",
      ],
    },
  ];

  // Return the selected mock data
  return mockData[mockIndex];
}
