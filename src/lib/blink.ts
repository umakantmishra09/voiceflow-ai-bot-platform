import { createClient } from '@blinkdotnew/sdk';

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'voiceflow-ai-bot-osn9w8te',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_cc_T2Y5p88UcebhBx8wPl7Z5gs-OV3Kr',
  auth: { mode: 'managed' }
});
