import { NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const { priceId, customerId, upgradeFromSubscriptionId } = await request.json();
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }
    
    // If upgrading from an existing subscription, cancel the old one immediately
    if (upgradeFromSubscriptionId) {
      console.log(`Canceling previous subscription immediately: ${upgradeFromSubscriptionId}`);
      
      try {
        // Cancel immediately instead of at period end
        await stripe.subscriptions.cancel(upgradeFromSubscriptionId);
        
        // Update the subscription in the database
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: Math.floor(Date.now() / 1000)
          })
          .eq('stripe_id', upgradeFromSubscriptionId);
          
        console.log('Previous subscription canceled immediately');
      } catch (error: any) {
        console.error('Error canceling previous subscription:', error.message);
        // Continue with new subscription creation even if cancellation fails
      }
    }
    
    // Fixed checkout session parameters
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings?subscriptionUpdated=true`,
      metadata: {
        userId: user.id,
        upgradeFrom: upgradeFromSubscriptionId || 'new_subscription',
      },
    });
    
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session: ' + error.message },
      { status: 500 }
    );
  }
} 