"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "../../supabase/client";
import { toast } from "sonner";

interface ProfileSettingsProps {
  user: User;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const supabase = createClient();
  const [name, setName] = useState(user.user_metadata?.name || "");
  const [loading, setLoading] = useState(false);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name }
      });
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={user.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Your email cannot be changed
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  );
} 