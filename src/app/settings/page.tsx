import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProfileSettings from "@/components/profile-settings";    
import SubscriptionSettings from "@/components/subscription-settings";
import { AlertCircle } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect("/sign-in?redirect=/settings");
  }
  
  // Use the first query's subscription data directly if it exists
  let subscription = null;
  
  try {
    // Log the user ID for debugging
    console.log("Checking subscription for user ID:", user.id);
    
    // Get subscription data
    const { data: subscriptionData, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
      
    if (error) {
      console.error("Subscription query error:", error);
    } else if (subscriptionData) {
      // We have the subscription - use it directly
      subscription = subscriptionData;
      console.log("Using subscription data:", subscription);
    }
  } catch (error) {
    console.error("Error fetching subscription:", error);
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-background border">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileSettings user={user} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>
                    Manage your subscription plan and billing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionSettings user={user} subscription={subscription} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 