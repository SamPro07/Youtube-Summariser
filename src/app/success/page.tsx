import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Subscription Successful!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for subscribing to our service.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <p className="text-center text-muted-foreground">
              Your premium subscription is now active. You can now enjoy unlimited access to our YouTube video summarization service.
            </p>
            <div className="w-full">
              <Button asChild className="w-full py-6">
                <Link href="/">Start Summarizing Videos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
