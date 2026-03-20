import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { config } from '../utils/config';
import { prisma } from '../utils/prisma';

const stripe = new Stripe(config.stripeSecretKey);
const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenantId;
      const plan = session.metadata?.plan;

      if (tenantId && plan) {
        await prisma.tenant.update({
          where: { id: tenantId },
          data: { plan: plan as 'FREE' | 'BASIC' | 'PRO' },
        });
        console.log(`Tenant ${tenantId} upgraded to ${plan}`);
      }
      break;
    }
    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

export default router;
