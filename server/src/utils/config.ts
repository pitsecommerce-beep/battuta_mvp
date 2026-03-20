import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  ycloudApiKey: process.env.YCLOUD_API_KEY || '',
  ycloudWebhookSecret: process.env.YCLOUD_WEBHOOK_SECRET || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  corsOrigins: [
    'http://localhost:5173',
    'https://pitsecommerce-beep.github.io',
  ],
};
