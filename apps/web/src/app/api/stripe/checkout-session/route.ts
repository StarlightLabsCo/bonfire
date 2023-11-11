import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

if (!process.env.STRIPE_SECRET) {
  throw new Error('STRIPE_SECRET is not set.');
}

if (!process.env.STRIPE_PRICE_ID) {
  throw new Error('STRIPE_PRICE_ID is not set.');
}

if (!process.env.STRIPE_REDIRECT_URL) {
  throw new Error('STRIPE_REDIRECT_URL is not set.');
}

import Stripe from 'stripe';
import db from '@/lib/db';
const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2023-10-16',
});

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || !session.user) {
    return new Response(null, {
      status: 401,
    });
  }

  const params = req.nextUrl.searchParams;
  const sessionId = params.get('session_id');

  if (!sessionId) {
    return new Response(null, {
      status: 400,
    });
  }

  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    return new Response(null, {
      status: 404,
    });
  }

  return new Response(
    JSON.stringify({
      status: stripeSession.status,
      customer_email: stripeSession.customer_details?.email,
    }),
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}

export async function POST(req: Request) {
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
      status: 500,
    });
  }

  if (user.stripeSubscriptionId) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId!,
      ui_mode: 'embedded',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      redirect_on_completion: 'never',
    });

    return new Response(
      JSON.stringify({
        clientSecret: stripeSession.client_secret,
      }),
      {
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  } catch (err: any) {
    console.error(err);
    return new Response(err.message || err.toString(), {
      status: 500,
    });
  }
}
