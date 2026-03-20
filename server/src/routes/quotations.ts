import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';
import { generateQuotationPDF } from '../services/pdf';

const router = Router();

// GET /api/quotations
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;

    const quotations = await prisma.quotation.findMany({
      where: { tenantId },
      include: {
        contact: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(quotations);
  } catch (err) {
    console.error('List quotations error:', err);
    res.status(500).json({ error: 'Failed to list quotations' });
  }
});

// GET /api/quotations/:id
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const quotation = await prisma.quotation.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
        items: {
          include: { product: true },
        },
        tenant: true,
      },
    });

    if (!quotation) {
      res.status(404).json({ error: 'Quotation not found' });
      return;
    }

    res.json(quotation);
  } catch (err) {
    console.error('Get quotation error:', err);
    res.status(500).json({ error: 'Failed to get quotation' });
  }
});

// GET /api/quotations/:id/pdf
router.get('/:id/pdf', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const quotation = await prisma.quotation.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
        items: {
          include: { product: true },
        },
        tenant: true,
      },
    });

    if (!quotation) {
      res.status(404).json({ error: 'Quotation not found' });
      return;
    }

    const pdfBuffer = await generateQuotationPDF(quotation);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=cotizacion-${id.slice(0, 8)}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Generate PDF error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
