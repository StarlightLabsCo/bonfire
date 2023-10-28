// Documentation: https://platform.openai.com/docs/introduction

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openai_proxy.harrishr.workers.dev',
});

export { openai };
