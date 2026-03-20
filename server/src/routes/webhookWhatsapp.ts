import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { cache } from '../services/cache';
import { generateAIResponse } from '../services/ai';
import { sendWhatsAppMessage } from '../services/ycloud';
import { config } from '../utils/config';
import { BotConfig, Product } from '@prisma/client';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate webhook secret
    const webhookSecret = req.headers['x-ycloud-webhook-secret'] as string;
    if (webhookSecret !== config.ycloudWebhookSecret) {
      res.status(401).json({ error: 'Invalid webhook secret' });
      return;
    }

    const body = req.body;

    // Only process inbound messages
    if (!body.whatsappInboundMessage) {
      res.status(200).json({ ok: true });
      return;
    }

    const inbound = body.whatsappInboundMessage;
    const businessNumber: string = inbound.to;
    const senderNumber: string = inbound.from;
    const messageText: string = inbound.text?.body || '';

    if (!messageText) {
      res.status(200).json({ ok: true });
      return;
    }

    // 3. Find tenant by whatsapp number
    const tenant = await prisma.tenant.findUnique({
      where: { whatsappNumber: businessNumber },
    });

    if (!tenant) {
      console.error(`No tenant found for whatsapp number: ${businessNumber}`);
      res.status(200).json({ ok: true });
      return;
    }

    // 4. Find or create contact
    const contact = await prisma.contact.upsert({
      where: {
        tenantId_whatsappNumber: {
          tenantId: tenant.id,
          whatsappNumber: senderNumber,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        whatsappNumber: senderNumber,
      },
    });

    // 5. Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        tenantId: tenant.id,
        contactId: contact.id,
        status: 'ACTIVE',
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          tenantId: tenant.id,
          contactId: contact.id,
        },
      });
    }

    // 6. Save incoming message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: messageText,
      },
    });

    // Update lastMessageAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // 7. Respond 200 immediately
    res.status(200).json({ ok: true });

    // 8. Background processing (no await on response)
    processMessageInBackground(tenant.id, conversation.id, senderNumber, businessNumber, messageText).catch(
      (err) => console.error('Background processing error:', err)
    );
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).json({ ok: true }); // Always 200 for webhooks
  }
});

async function processMessageInBackground(
  tenantId: string,
  conversationId: string,
  senderNumber: string,
  businessNumber: string,
  messageText: string
): Promise<void> {
  // a. Get bot config (cached)
  const cacheKey = `botconfig:${tenantId}`;
  let botConfig = cache.get<BotConfig>(cacheKey);

  if (!botConfig) {
    const dbConfig = await prisma.botConfig.findUnique({
      where: { tenantId },
    });
    if (!dbConfig) {
      console.error(`No bot config for tenant: ${tenantId}`);
      return;
    }
    botConfig = dbConfig;
    cache.set(cacheKey, botConfig);
  }

  // b. Load last 15 messages
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 15,
  });

  // c. Search relevant products with ILIKE
  const words = messageText
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let products: Product[] = [];
  if (words.length > 0) {
    const conditions = words.map((word) => ({
      OR: [
        { name: { contains: word, mode: 'insensitive' as const } },
        { description: { contains: word, mode: 'insensitive' as const } },
        { category: { contains: word, mode: 'insensitive' as const } },
        { sku: { contains: word, mode: 'insensitive' as const } },
      ],
    }));

    products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: conditions,
      },
      take: 10,
    });
  }

  // d-e. Generate AI response
  const aiResponse = await generateAIResponse({
    botConfig,
    messages,
    products,
    userMessage: messageText,
  });

  // f. Save assistant message
  await prisma.message.create({
    data: {
      conversationId,
      role: 'ASSISTANT',
      content: aiResponse,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  // g. Send via YCloud
  await sendWhatsAppMessage({
    to: senderNumber,
    from: businessNumber,
    body: aiResponse,
  });
}

export default router;
