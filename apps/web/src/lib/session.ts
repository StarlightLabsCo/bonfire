import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { NextAuthOptions, Session } from 'next-auth';

export async function getCurrentUser() {
  const session = (await getServerSession(authOptions as NextAuthOptions)) as Session;

  return session?.user;
}

export async function getSession() {
  return await getServerSession(authOptions as NextAuthOptions);
}
