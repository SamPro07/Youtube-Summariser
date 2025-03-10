"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "../../supabase/client";
import { Loader2, ExternalLink, Trash2 } from "lucide-react";

type Summary = {
  id: string;
  youtube_url: string;
  video_title: string;
  created_at: string;
};

export default function SummaryHistory() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from("summaries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSummaries(data || []);
    } catch (error) {
      console.error("Error fetching summaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSummary = async (id: string) => {
    try {
      const { error } = await supabase.from("summaries").delete().eq("id", id);

      if (error) throw error;
      setSummaries(summaries.filter((summary) => summary.id !== id));
    } catch (error) {
      console.error("Error deleting summary:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">
            No summary history yet. Try summarizing a YouTube video!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Summary History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex-1">
                <h3 className="font-medium truncate">
                  {summary.video_title || "YouTube Video"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(summary.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={summary.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSummary(summary.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
