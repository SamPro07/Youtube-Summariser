import { NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log("API called with user:", user?.id);
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // First get subscription data - query all columns to see what's available
    const { data: subscriptionData, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    console.log("Full subscription data:", subscriptionData);
    console.log("Query error:", error);
    
    // Check if we found a subscription and try to determine the customer ID
    let customerId;
    
    if (subscriptionData) {
      // Try different possible field names for the customer ID
      customerId = subscriptionData.stripe_customer_id || 
                  subscriptionData.customer_id || 
                  subscriptionData.customer;
                  
      console.log("Using customer ID:", customerId);
    }
    
    if (!customerId) {
      // If we don't have a customer ID, try to create one
      // Replace this with your actual implementation
      return NextResponse.json(
        { error: 'Customer ID not found in subscription data. Available fields: ' + 
          Object.keys(subscriptionData || {}).join(', ') },
        { status: 404 }
      );
    }
    
    // Create Stripe portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings`,
    });
    
    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Error creating portal link:', error);
    return NextResponse.json(
      { error: 'Error creating portal link: ' + error.message },
      { status: 500 }
    );
  }
} 