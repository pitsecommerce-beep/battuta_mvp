import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { supabaseUserId: data.user.id },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found in system' });
      return;
    }

    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      role: user.role,
      supabaseUserId: user.supabaseUserId,
    };
    req.tenantId = user.tenantId;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
