import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';
import { invalidateProducts } from '../services/cache';
import multer from 'multer';
import { Readable } from 'stream';
import readline from 'readline';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/products - List products with pagination and search
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const page = req.query.page as string | undefined;
    const limit = req.query.limit as string | undefined;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    const pageNum = Math.max(1, parseInt(page || '1'));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20')));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ error: 'Failed to list products' });
  }
});

// POST /api/products - Create product
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { name, sku, description, price, stock, category, imageUrl } = req.body;

    if (!name || !sku || price === undefined) {
      res.status(400).json({ error: 'Missing required fields: name, sku, price' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        tenantId,
        name,
        sku,
        description: description || '',
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        category: category || '',
        imageUrl: imageUrl || '',
      },
    });

    invalidateProducts(tenantId);
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const existing = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });

    invalidateProducts(tenantId);
    res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const existing = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await prisma.product.delete({ where: { id } });

    invalidateProducts(tenantId);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// POST /api/products/import - Import CSV
router.post('/import', upload.single('file'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const stream = Readable.from(file.buffer.toString());
    const rl = readline.createInterface({ input: stream });

    const products: Array<{
      tenantId: string;
      name: string;
      sku: string;
      description: string;
      price: number;
      stock: number;
      category: string;
    }> = [];

    let isHeader = true;
    let headers: string[] = [];

    for await (const line of rl) {
      if (isHeader) {
        headers = line.split(',').map((h: string) => h.trim().toLowerCase());
        isHeader = false;
        continue;
      }

      const values = line.split(',').map((v: string) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || '';
      });

      if (row.name && row.sku) {
        products.push({
          tenantId,
          name: row.name,
          sku: row.sku,
          description: row.description || '',
          price: parseFloat(row.price) || 0,
          stock: parseInt(row.stock) || 0,
          category: row.category || '',
        });
      }
    }

    if (products.length === 0) {
      res.status(400).json({ error: 'No valid products found in CSV' });
      return;
    }

    const result = await prisma.product.createMany({
      data: products,
      skipDuplicates: true,
    });

    invalidateProducts(tenantId);
    res.json({ imported: result.count, total: products.length });
  } catch (err) {
    console.error('Import CSV error:', err);
    res.status(500).json({ error: 'Failed to import products' });
  }
});

export default router;
