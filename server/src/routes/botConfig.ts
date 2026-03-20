import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';
import { invalidateBotConfig } from '../services/cache';

const router = Router();

// GET /api/bot-config
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;

    const botConfig = await prisma.botConfig.findUnique({
      where: { tenantId },
    });

    if (!botConfig) {
      res.status(404).json({ error: 'Bot config not found' });
      return;
    }

    res.json(botConfig);
  } catch (err) {
    console.error('Get bot config error:', err);
    res.status(500).json({ error: 'Failed to get bot config' });
  }
});

// PUT /api/bot-config
router.put('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;

    const botConfig = await prisma.botConfig.update({
      where: { tenantId },
      data: req.body,
    });

    // Invalidate cache
    invalidateBotConfig(tenantId);

    res.json(botConfig);
  } catch (err) {
    console.error('Update bot config error:', err);
    res.status(500).json({ error: 'Failed to update bot config' });
  }
});

export default router;
