import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all vendors with pagination and search
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          _count: {
            select: { invoices: true }
          },
          invoices: {
            select: {
              totalAmount: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: {
          [sortBy as string]: sortOrder
        }
      }),
      prisma.vendor.count({ where })
    ]);

    // Calculate total spend for each vendor
    const vendorsWithSpend = vendors.map((vendor: any) => ({
      ...vendor,
      totalSpend: vendor.invoices.reduce((sum: number, invoice: any) => sum + Number(invoice.totalAmount), 0),
      invoices: undefined // Remove detailed invoices from response
    }));

    res.json({
      data: vendorsWithSpend,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Get single vendor by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { issueDate: 'desc' },
          take: 10 // Last 10 invoices
        },
        _count: {
          select: { invoices: true }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// Create new vendor
router.post('/', async (req: Request, res: Response) => {
  try {
    const vendorData = req.body;

    const vendor = await prisma.vendor.create({
      data: vendorData
    });

    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// Update vendor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData
    });

    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// Delete vendor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if vendor has invoices
    const invoiceCount = await prisma.invoice.count({
      where: { vendorId: id }
    });

    if (invoiceCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete vendor with existing invoices' 
      });
    }

    await prisma.vendor.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

export default router;
