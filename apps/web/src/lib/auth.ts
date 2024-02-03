import db from '@/lib/db';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';

if (!process.env.APPLE_CLIENT_ID || !process.env.APPLE_CLIENT_SECRET) {
  throw new Error('Missing APPLE_ID and APPLE_SECRET environment variables.');
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
}

if (!process.env.STRIPE_SECRET) {
  throw new Error('STRIPE_SECRET is not set.');
}

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2023-10-16',
});

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: async ({ session, user }: { session: Session; user: User }) => {
      if (session?.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },
  events: {
    createUser: async ({ user }: { user: User }) => {
      if (!user.email) {
        console.log('[Auth] No email provided for user on creation.');
        return;
      }

      // Stripe (payments)
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        });

        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            stripeCustomerId: customer.id,
          },
        });
      } catch (error) {
        console.error('[Auth] Failed to create Stripe customer.');
        console.error(error);
      }

      // Loops (email)
      try {
        const response = await fetch('https://app.loops.so/api/v1/contacts/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            name: user.name,
          }),
        });

        if (response.status !== 200) {
          console.error('[Auth] Failed to create contact in Loops.');
          console.error(await response.text());
        }
      } catch (error) {
        console.error('[Auth] Failed to create contact in Loops.');
        console.error(error);
      }
    },
  },
  cookies: {
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },
};
