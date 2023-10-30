import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db';

import GoogleProvider from 'next-auth/providers/google';
import { Session, User } from 'next-auth';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    'Missing GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables. Did you forget to run `cp .env.local.example .env.local`?',
  );
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async ({ session, user }: { session: Session; user: User }) => {
      if (session?.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },
};
