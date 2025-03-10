"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Share2, Youtube } from "lucide-react";
import { createClient } from "../../supabase/client";

type SummaryType = {
  videoTitle?: string;
  keyPoints: string[];
  timestamps: { time: string; content: string }[];
  mainTakeaways: string[];
};

export default function YouTubeForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [summaryFormat, setSummaryFormat] = useState("bullets");
  const [summaryLength, setSummaryLength] = useState("brief");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic URL validation
    if (!url) {
      setError("Please enter a YouTube URL");
      return;
    }

    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    setSummary(null);

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-summarize-video",
        {
          body: {
            youtube_url: url,
            summary_format: summaryFormat,
            summary_length: summaryLength,
            user_id: userId,
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      setSummary(data);
    } catch (err) {
      setError("Failed to generate summary. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;

    let textToCopy = "";

    if (summary.videoTitle) {
      textToCopy += `VIDEO: ${summary.videoTitle}\n\n`;
    }

    textToCopy += "KEY POINTS:\n";
    summary.keyPoints.forEach((point, index) => {
      textToCopy += `${index + 1}. ${point}\n`;
    });

    textToCopy += "\nTIMESTAMPS:\n";
    summary.timestamps.forEach(({ time, content }) => {
      textToCopy += `${time} - ${content}\n`;
    });

    textToCopy += "\nMAIN TAKEAWAYS:\n";
    summary.mainTakeaways.forEach((takeaway, index) => {
      textToCopy += `${index + 1}. ${takeaway}\n`;
    });

    navigator.clipboard.writeText(textToCopy);
    alert("Summary copied to clipboard!");
  };

  const handleShare = () => {
    if (navigator.share && summary) {
      let textToShare = "YouTube Video Summary:\n\n";

      if (summary.videoTitle) {
        textToShare += `VIDEO: ${summary.videoTitle}\n\n`;
      }

      textToShare += "KEY POINTS:\n";
      summary.keyPoints.forEach((point, index) => {
        textToShare += `${index + 1}. ${point}\n`;
      });

      textToShare += "\nMAIN TAKEAWAYS:\n";
      summary.mainTakeaways.forEach((takeaway, index) => {
        textToShare += `${index + 1}. ${takeaway}\n`;
      });

      navigator
        .share({
          title: "YouTube Video Summary",
          text: textToShare,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
        });
    } else {
      alert(
        "Sharing is not supported in your browser. You can copy the summary instead.",
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Paste YouTube URL here"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10"
                />
                <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  "Summarize"
                )}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Format:</span>
                <Tabs
                  value={summaryFormat}
                  onValueChange={setSummaryFormat}
                  className="w-[200px]"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bullets">Bullets</TabsTrigger>
                    <TabsTrigger value="paragraphs">Paragraphs</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Length:</span>
                <Tabs
                  value={summaryLength}
                  onValueChange={setSummaryLength}
                  className="w-[200px]"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="brief">Brief</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Generating summary...</p>
          <p className="text-gray-500">This may take a few moments</p>
        </div>
      )}

      {summary && !isLoading && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold">
              {summary.videoTitle ? summary.videoTitle : "Video Summary"}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Points</h3>
                  {summaryFormat === "bullets" ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {summary.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">
                      {summary.keyPoints.join(" ")}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Timestamps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {summary.timestamps.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="font-mono text-blue-600 font-medium min-w-[50px]">
                          {item.time}
                        </span>
                        <span className="text-gray-700">{item.content}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Main Takeaways</h3>
                  {summaryFormat === "bullets" ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {summary.mainTakeaways.map((takeaway, index) => (
                        <li key={index}>{takeaway}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">
                      {summary.mainTakeaways.join(" ")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
