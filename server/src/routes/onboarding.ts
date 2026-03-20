import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { supabaseAdmin } from '../utils/supabase';

const router = Router();

router.post('/', async (req, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing authorization' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { supabaseUserId: data.user.id },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already onboarded' });
      return;
    }

    const { businessName, slug, whatsappNumber } = req.body;

    if (!businessName || !slug || !whatsappNumber) {
      res.status(400).json({ error: 'Missing required fields: businessName, slug, whatsappNumber' });
      return;
    }

    // Check slug uniqueness
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      res.status(400).json({ error: 'Slug already taken' });
      return;
    }

    // Create tenant + user + bot config in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: businessName,
          slug,
          whatsappNumber,
          plan: 'FREE',
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.user!.email || '',
          name: data.user!.user_metadata?.name || businessName,
          role: 'ADMIN',
          supabaseUserId: data.user!.id,
        },
      });

      const botConfig = await tx.botConfig.create({
        data: {
          tenantId: tenant.id,
          businessName,
          systemPrompt:
            'Eres un asistente de ventas de autopartes. Ayudas a los clientes a encontrar las piezas que necesitan.',
          greeting: `¡Hola! Bienvenido a ${businessName}. ¿En qué puedo ayudarte?`,
          tone: 'FRIENDLY',
        },
      });

      return { tenant, user, botConfig };
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

export default router;
