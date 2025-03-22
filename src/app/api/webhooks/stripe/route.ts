import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/../supabase/server';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new NextResponse('Webhook Error: Missing stripe-signature header', { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Webhook Error: Missing STRIPE_WEBHOOK_SECRET env variable', { status: 500 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Add this to your webhook handler for 'customer.subscription.created' event
  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata.userId;
    
    if (userId) {
      // Cancel any other active subscriptions for this user
      await cancelPreviousSubscriptions(userId, subscription.id);
    }
    
    // ... your existing subscription creation code
  }

  return new NextResponse('Received', { status: 200 });
}

// Function to cancel previous subscriptions
async function cancelPreviousSubscriptions(userId: string, newSubscriptionId: string) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-02-24.acacia',
    });
    
    const supabase = await createClient();
    
    // Get all active subscriptions for this user except the new one
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .neq('stripe_id', newSubscriptionId);
      
    if (error) {
      console.error("Error fetching old subscriptions:", error);
      return;
    }
    
    if (subscriptions && subscriptions.length > 0) {
      console.log(`Found ${subscriptions.length} old subscriptions to cancel`);
      
      // Cancel each subscription in Stripe
      for (const sub of subscriptions) {
        try {
          // Cancel in Stripe
          await stripe.subscriptions.cancel(sub.stripe_id);
          
          // Update in database
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().getTime() / 1000,
              ends_at: sub.current_period_end // Let it expire at the end of period
            })
            .eq('id', sub.id);
            
          console.log(`Canceled subscription: ${sub.stripe_id}`);
        } catch (error: any) {
          console.error(`Failed to cancel subscription ${sub.stripe_id}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error("Error in cancelPreviousSubscriptions:", error);
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-02-24.acacia',
    });
    
    // Get all active subscriptions
    const { data: allSubscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active');
      
    if (!allSubscriptions || allSubscriptions.length === 0) {
      return NextResponse.json({ message: "No active subscriptions found" });
    }
    
    // Process data to find users with multiple subscriptions
    const userSubscriptionCounts: Record<string, number> = {};
    allSubscriptions.forEach(sub => {
      const userId = sub.user_id;
      userSubscriptionCounts[userId] = (userSubscriptionCounts[userId] || 0) + 1;
    });
    
    const usersWithMultipleSubs = Object.keys(userSubscriptionCounts)
      .filter(userId => userSubscriptionCounts[userId] > 1);
      
    if (usersWithMultipleSubs.length === 0) {
      return NextResponse.json({ message: "No users with multiple subscriptions found" });
    }
    
    const results = [];
    
    for (const userId of usersWithMultipleSubs) {
      // Get subscriptions for this user, ordered by creation date
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      // Keep only the most recent subscription
      if (subscriptions && subscriptions.length > 1) {
        const keepSub = subscriptions[0];
        const cancelSubs = subscriptions.slice(1);
        
        for (const sub of cancelSubs) {
          try {
            // Cancel in Stripe
            await stripe.subscriptions.cancel(sub.stripe_id);
            
            // Update in database
            await supabase
              .from('subscriptions')
              .update({
                status: 'canceled',
                canceled_at: new Date().getTime() / 1000,
                ends_at: sub.current_period_end
              })
              .eq('id', sub.id);
              
            results.push(`Canceled ${sub.stripe_id} for user ${userId}`);
          } catch (error: any) {
            results.push(`Error canceling ${sub.stripe_id}: ${error.message}`);
          }
        }
      }
    }
    
    return NextResponse.json({ fixed: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}