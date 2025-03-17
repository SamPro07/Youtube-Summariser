'use client';

import { useRouter } from 'next/navigation';
import YouTubeForm from "@/components/youtube-form";
import { useState } from 'react';

interface YouTubeFormWrapperProps {
  isAuthenticated: boolean;
  isSubscribed?: boolean; // New prop to check subscription status
}

export function YouTubeFormWrapper({ isAuthenticated, isSubscribed = false }: YouTubeFormWrapperProps) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    // If not authenticated, redirect to sign-up
    if (!isAuthenticated) {
      e.preventDefault();
      sessionStorage.setItem('pendingYouTubeUrl', url);
      router.push('/sign-up');
      return false;
    }
    
    // If authenticated but not subscribed, redirect to pricing
    if (!isSubscribed) {
      e.preventDefault();
      sessionStorage.setItem('pendingYouTubeUrl', url);
      router.push('/pricing');
      return false;
    }
    
    // If authenticated and subscribed, let the normal form submission happen
    return true;
  };
  
  const handleUrlChange = (value: string) => {
    setUrl(value);
  };
  
  return (
    <div>
      {/* Pass props to YouTubeForm to handle submission and track URL */}
      <YouTubeForm 
        onFormSubmit={handleSubmit}
        onUrlChange={handleUrlChange}
      />
    </div>
  );
}
