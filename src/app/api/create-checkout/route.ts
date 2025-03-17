import { NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const priceId = searchParams.get('priceId');
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in?redirect=/pricing', request.url));
    }
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }
    
    console.log("Creating checkout for user:", user.id, "price:", priceId);
    
    // Get current subscription to find customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    let customerId = subscription?.customer;
    
    // If no customer ID found, create a new customer
    if (!customerId) {
      console.log("No existing customer, creating new Stripe customer");
      
      const newCustomer = await stripe.customers.create({
        email: user.email || profile?.email,
        metadata: {
          userId: user.id
        }
      });
      
      customerId = newCustomer.id;
      console.log("Created new customer:", customerId);
      
      // Save the customer ID to profiles if that table exists
      if (profile) {
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);
      }
    }
    
    console.log("Using customer ID:", customerId);
    
    // Create checkout session
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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings?upgraded=true`,
      metadata: {
        userId: user.id,
      },
    });
    
    console.log("Created checkout session:", session.id);
    
    // Redirect to checkout
    return NextResponse.redirect(session.url!);
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout: ' + error.message },
      { status: 500 }
    );
  }
} 