import { NextResponse } from 'next/server';
import db from '@/lib/db';

if (!process.env.STRIPE_SECRET) {
  throw new Error('STRIPE_SECRET is not set.');
}

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const rawBody = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers.get('stripe-signature') as string,
      process.env.STRIPE_WEBHOOK_SECRET_KEY as string,
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message: 'Webhook signature verification failed',
      },
      {
        status: 400,
      },
    );
  }

  const handler = stripeEventHandlers[event.type as keyof typeof stripeEventHandlers];
  if (!handler) {
    return new Response(null, {
      status: 500,
    });
  }

  handler(event);
  return new Response(null, {
    status: 200,
  });
}

const stripeEventHandlers = {
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'customer.subscription.paused': handleSubscriptionPaused,
  'customer.subscription.resumed': handleSubscriptionResumed,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'invoice.created': handleInvoiceCreated,
  'invoice.finalized': handleInvoiceFinalized,
  'invoice.finalization_failed': handleInvoiceFinalizationFailed,
  'invoice.paid': handleInvoicePaid,
  'invoice.payment_action_required': handleInvoicePaymentActionRequired,
  'invoice.payment_failed': handleInvoicePaymentFailed,
  'invoice.upcoming': handleInvoiceUpcoming,
  'invoice.updated': handleInvoiceUpdated,
  'payment_intent.created': handlePaymentIntentCreated,
  'payment_intent.succeeded': handlePaymentIntentSucceeded,
};

// Subscription
async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  await db.user.update({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
    },
  });
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  await db.user.update({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
    data: {
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
    },
  });
}

// TODO: what is paused?
async function handleSubscriptionPaused(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  // TODO
}

// TODO: what is resumed?
async function handleSubscriptionResumed(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  // TODO
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  await db.user.update({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
    },
  });
}

// Invoices
async function handleInvoiceCreated(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  // TODO
}

async function handleInvoiceFinalized(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  // TODO
}

async function handleInvoiceFinalizationFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  // TODO
}

async function handleInvoicePaid(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  // TODO
}

async function handleInvoicePaymentActionRequired(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  // TODO
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  // TODO
}

async function handleInvoiceUpcoming(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  // TODO
}

async function handleInvoiceUpdated(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  // TODO
}

// Payment Intents
async function handlePaymentIntentCreated(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // TODO
}

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // TODO
}
