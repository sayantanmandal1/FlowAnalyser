import { Request, Response, NextFunction } from 'express';

export const dbErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  // Handle Prisma connection errors
  if (error.code === 'P1001' || error.message?.includes('too many connections')) {
    console.error('Database connection pool exhausted');
    return res.status(503).json({
      error: 'Database temporarily unavailable',
      message: 'Please try again in a moment'
    });
  }

  // Handle other Prisma errors
  if (error.code?.startsWith('P')) {
    console.error('Prisma error:', error.code, error.message);
    return res.status(500).json({
      error: 'Database error',
      code: error.code
    });
  }

  next(error);
};
