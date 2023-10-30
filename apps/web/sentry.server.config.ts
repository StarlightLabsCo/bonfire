// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://54c5466057edabf3ef9456a6f70811ed@o4506103705174016.ingest.sentry.io/4506103706812416',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
  profilesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
