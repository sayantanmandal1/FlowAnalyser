import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Get all documents
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, type } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    
    if (search) {
      where.fileName = {
        contains: search as string,
        mode: 'insensitive'
      };
    }

    if (type && type !== 'all') {
      where.fileType = {
        contains: type as string,
        mode: 'insensitive'
      };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: {
          uploadedAt: 'desc'
        }
      }),
      prisma.document.count({ where })
    ]);

    res.json({
      data: documents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload document
router.post('/upload', upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = await prisma.document.create({
      data: {
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        fileType: path.extname(req.file.originalname).toLowerCase(),
        uploadedAt: new Date(),
        processingStatus: 'UPLOADED'
      }
    });

    res.json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get document stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalDocuments,
      processedThisMonth,
      totalSize,
      byType
    ] = await Promise.all([
      prisma.document.count(),
      prisma.document.count({
        where: {
          uploadedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.document.aggregate({
        _sum: {
          fileSize: true
        }
      }),
      prisma.document.groupBy({
        by: ['type'],
        _count: {
          type: true
        }
      })
    ]);

    res.json({
      total: totalDocuments,
      byType: byType.map((item: any) => ({
        type: item.type,
        count: item._count.type
      })),
      byStatus: [
        { status: 'processed', count: processedThisMonth },
        { status: 'pending', count: totalDocuments - processedThisMonth }
      ],
      totalSize: totalSize._sum.fileSize || 0
    });
  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({ error: 'Failed to fetch document statistics' });
  }
});

// Delete document
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.document.delete({
      where: { id }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;