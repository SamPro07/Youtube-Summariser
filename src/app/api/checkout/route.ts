import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';
import Stripe from 'stripe';

// Make sure you have a valid Stripe API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// Get base URL with fallback for localhost
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://your-production-domain.com');
};

export async function GET(request: NextRequest) {
  // Get the price ID from the URL
  const { searchParams } = new URL(request.url);
  const priceId = searchParams.get('priceId');
  
  if (!priceId) {
    return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
  }

  try {
    // Get the user from Supabase auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const baseUrl = getBaseUrl();
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session: ' + error.message },
      { status: 500 }
    );
  }
} 