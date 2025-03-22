'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function SubscriptionUpdatedAlert() {
  const router = useRouter();

  useEffect(() => {
    // Clear the query parameter after showing the alert
    const timeoutId = setTimeout(() => {
      // Remove the query parameter
      window.location.href = window.location.pathname;
    }, 5000); 

    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <div className="bg-green-100 text-green-800 p-4 flex items-center justify-center gap-2">
      <CheckCircle2 className="h-5 w-5" />
      <p>Your subscription has been successfully updated!</p>
    </div>
  );
} 