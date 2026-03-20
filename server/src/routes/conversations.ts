import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';
import { sendWhatsAppMessage } from '../services/ycloud';

const router = Router();

// GET /api/conversations
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = { tenantId };
    if (status) {
      where.status = status;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    res.json(conversations);
  } catch (err) {
    console.error('List conversations error:', err);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const conversation = await prisma.conversation.findFirst({
      where: { id, tenantId },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// POST /api/conversations/:id/send - Send message as agent
router.post('/:id/send', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;
    const content = req.body.content as string | undefined;

    if (!content) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
        tenant: true,
      },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Save message
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        role: 'AGENT',
        content,
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    // Send via YCloud
    await sendWhatsAppMessage({
      to: conversation.contact.whatsappNumber,
      from: conversation.tenant.whatsappNumber,
      body: content,
    });

    res.json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
