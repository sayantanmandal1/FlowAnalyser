import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Seed endpoint - call this to populate the database
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    console.log('🌱 Starting database initialization...');

    // Check if data already exists
    const existingInvoices = await prisma.invoice.count();
    if (existingInvoices > 0) {
      return res.json({
        message: 'Database already initialized',
        invoiceCount: existingInvoices
      });
    }

    // Sample vendors
    const vendors = [
      { name: "TechCorp Solutions", email: "contact@techcorp.com", category: "Technology", country: "Germany", city: "Berlin" },
      { name: "Office Supplies Plus", email: "orders@officesupplies.com", category: "Office Supplies", country: "Netherlands", city: "Amsterdam" },
      { name: "Marketing Pro", email: "hello@marketingpro.com", category: "Marketing", country: "France", city: "Paris" },
      { name: "CloudHost Services", email: "support@cloudhost.com", category: "Technology", country: "Germany", city: "Munich" },
      { name: "Legal Associates", email: "info@legalassoc.com", category: "Legal", country: "Netherlands", city: "Rotterdam" }
    ];

    // Create vendors
    const createdVendors = await Promise.all(
      vendors.map(vendor => prisma.vendor.create({ data: vendor }))
    );
    console.log(`✅ Created ${createdVendors.length} vendors`);

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name: "FlowbitAI GmbH",
        email: "accounting@flowbitai.com",
        country: "Germany",
        city: "Berlin"
      }
    });
    console.log('✅ Created customer');

    // Create invoices
    const currentDate = new Date();
    const invoices = [];

    for (let i = 0; i < 50; i++) {
      const vendor = createdVendors[Math.floor(Math.random() * createdVendors.length)];
      
      const issueDate = new Date(currentDate);
      issueDate.setMonth(currentDate.getMonth() - Math.floor(Math.random() * 12));
      
      const dueDate = new Date(issueDate);
      dueDate.setDate(issueDate.getDate() + 30);
      
      const subtotal = Math.floor(Math.random() * 5000) + 500;
      const taxAmount = subtotal * 0.19;
      const totalAmount = subtotal + taxAmount;
      
      let status: 'PENDING' | 'PAID' | 'OVERDUE' = 'PENDING';
      let paidDate = null;
      
      if (dueDate < currentDate) {
        if (Math.random() > 0.3) {
          status = 'PAID';
          paidDate = new Date(dueDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
        } else {
          status = 'OVERDUE';
        }
      } else {
        if (Math.random() > 0.5) {
          status = 'PAID';
          paidDate = new Date(issueDate.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000);
        }
      }

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-2024-${String(i + 1).padStart(4, '0')}`,
          vendorId: vendor.id,
          customerId: customer.id,
          issueDate,
          dueDate,
          paidDate,
          subtotal,
          taxAmount,
          totalAmount,
          status,
          currency: 'EUR',
          category: vendor.category,
          description: `Services from ${vendor.name}`,
          lineItems: {
            create: [
              {
                description: `${vendor.category} Services`,
                quantity: 1,
                unitPrice: subtotal,
                totalPrice: subtotal,
                category: vendor.category
              }
            ]
          }
        }
      });

      // Create payment if paid
      if (status === 'PAID' && paidDate) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: totalAmount,
            currency: 'EUR',
            method: 'BANK_TRANSFER',
            paidDate,
            reference: `PAY-${invoice.invoiceNumber}`
          }
        });
      }

      invoices.push(invoice);
    }

    console.log(`✅ Created ${invoices.length} invoices`);

    // Create some documents
    for (let i = 0; i < 20; i++) {
      const invoice = invoices[Math.floor(Math.random() * invoices.length)];
      
      await prisma.document.create({
        data: {
          invoiceId: invoice.id,
          fileName: `${invoice.invoiceNumber}.pdf`,
          filePath: `/uploads/${invoice.invoiceNumber}.pdf`,
          fileSize: Math.floor(Math.random() * 1000000) + 100000,
          mimeType: 'application/pdf',
          type: 'INVOICE'
        }
      });
    }

    console.log('✅ Created documents');

    // Get final counts
    const counts = {
      vendors: await prisma.vendor.count(),
      customers: await prisma.customer.count(),
      invoices: await prisma.invoice.count(),
      payments: await prisma.payment.count(),
      documents: await prisma.document.count()
    };

    res.json({
      message: 'Database initialized successfully!',
      counts
    });

  } catch (error: any) {
    console.error('❌ Error initializing database:', error);
    res.status(500).json({ 
      error: 'Failed to initialize database',
      details: error.message 
    });
  }
});

// Check database status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const counts = {
      vendors: await prisma.vendor.count(),
      customers: await prisma.customer.count(),
      invoices: await prisma.invoice.count(),
      payments: await prisma.payment.count(),
      documents: await prisma.document.count()
    };

    res.json({
      status: 'connected',
      counts,
      isEmpty: counts.invoices === 0
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

export default router;
