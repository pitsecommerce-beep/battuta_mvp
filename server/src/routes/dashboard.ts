import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;

    const [
      totalProducts,
      activeProducts,
      totalContacts,
      totalConversations,
      activeConversations,
      totalQuotations,
      pendingQuotations,
      recentMessages,
    ] = await Promise.all([
      prisma.product.count({ where: { tenantId } }),
      prisma.product.count({ where: { tenantId, isActive: true } }),
      prisma.contact.count({ where: { tenantId } }),
      prisma.conversation.count({ where: { tenantId } }),
      prisma.conversation.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.quotation.count({ where: { tenantId } }),
      prisma.quotation.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.message.count({
        where: {
          conversation: { tenantId },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    res.json({
      products: { total: totalProducts, active: activeProducts },
      contacts: { total: totalContacts },
      conversations: { total: totalConversations, active: activeConversations },
      quotations: { total: totalQuotations, pending: pendingQuotations },
      messagesLast24h: recentMessages,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
