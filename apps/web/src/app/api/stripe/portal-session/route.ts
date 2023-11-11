import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

if (!process.env.STRIPE_SECRET) {
  throw new Error('STRIPE_SECRET is not set.');
}

if (!process.env.STRIPE_REDIRECT_URL) {
  throw new Error('STRIPE_REDIRECT_URL is not set.');
}

import Stripe from 'stripe';
import db from '@/lib/db';
const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || !session.user) {
    return new Response(null, {
      status: 401,
    });
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return new Response(null, {
      status: 404,
    });
  }

  if (!user.stripeCustomerId) {
    return new NextResponse('User does not have a Stripe customer ID', {
      status: 400,
    });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: process.env.STRIPE_REDIRECT_URL,
  });

  return new Response(
    JSON.stringify({
      url: portalSession.url,
    }),
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}
