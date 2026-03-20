import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './utils/config';
import { prisma } from './utils/prisma';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Route imports
import webhookWhatsappRouter from './routes/webhookWhatsapp';
import webhookStripeRouter from './routes/webhookStripe';
import onboardingRouter from './routes/onboarding';
import dashboardRouter from './routes/dashboard';
import productsRouter from './routes/products';
import botConfigRouter from './routes/botConfig';
import conversationsRouter from './routes/conversations';
import contactsRouter from './routes/contacts';
import quotationsRouter from './routes/quotations';

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(morgan('combined'));
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);

// Stripe webhook needs raw body
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

// JSON parser for everything else
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Webhook Routes (no auth) ---
app.use('/webhook/whatsapp', webhookWhatsappRouter);
app.use('/webhook/stripe', webhookStripeRouter);

// --- Onboarding (own auth logic) ---
app.use('/api/onboarding', onboardingRouter);

// --- Protected API Routes ---
app.use('/api/dashboard', authMiddleware, dashboardRouter);
app.use('/api/products', authMiddleware, productsRouter);
app.use('/api/bot-config', authMiddleware, botConfigRouter);
app.use('/api/conversations', authMiddleware, conversationsRouter);
app.use('/api/contacts', authMiddleware, contactsRouter);
app.use('/api/quotations', authMiddleware, quotationsRouter);

// --- Error Handler ---
app.use(errorHandler);

// --- Start Server ---
async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
