import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';

const router = Router();

// GET /api/contacts
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { search } = req.query;

    const where: Record<string, unknown> = { tenantId };

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { whatsappNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(contacts);
  } catch (err) {
    console.error('List contacts error:', err);
    res.status(500).json({ error: 'Failed to list contacts' });
  }
});

export default router;
