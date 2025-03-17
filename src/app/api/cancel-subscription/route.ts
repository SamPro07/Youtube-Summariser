import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    console.log("Cancel subscription API called");
    
    // Parse request body
    let subscriptionId = null;
    try {
      const body = await request.json();
      subscriptionId = body.subscriptionId;
      console.log("Subscription ID from request:", subscriptionId);
    } catch (e) {
      console.log("No request body or invalid JSON");
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    if (!subscriptionId) {
      return NextResponse.json({ error: 'No subscription ID provided' }, { status: 400 });
    }
    
    // Cancel in Stripe directly
    try {
      console.log("Cancelling Stripe subscription:", subscriptionId);
      const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
      console.log("Stripe cancellation response:", canceledSubscription);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription canceled successfully',
        status: canceledSubscription.status
      });
    } catch (error: any) {
      console.error('Stripe error:', error);
      return NextResponse.json(
        { error: 'Stripe error: ' + error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
} 