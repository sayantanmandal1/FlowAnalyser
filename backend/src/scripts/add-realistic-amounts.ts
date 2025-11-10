import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addRealisticAmounts() {
  console.log('🚀 Adding realistic amounts to invoices...');
  
  try {
    // Get all invoices
    const invoices = await prisma.invoice.findMany({
      include: {
        lineItems: true,
        vendor: true
      }
    });

    console.log(`📊 Found ${invoices.length} invoices to update`);

    for (const invoice of invoices) {
      // Generate realistic amounts based on vendor and invoice type
      const baseAmount = Math.floor(Math.random() * 5000) + 100; // €100 - €5100
      const subtotal = baseAmount;
      const taxRate = 0.19; // 19% German VAT
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
      const totalAmount = subtotal + taxAmount;

      // Update invoice
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          subtotal: subtotal,
          taxAmount: taxAmount,
          totalAmount: totalAmount,
          status: Math.random() > 0.3 ? 'PAID' : invoice.status, // 70% paid rate
          paidDate: Math.random() > 0.3 ? invoice.issueDate : null,
        }
      });

      // Update line items
      if (invoice.lineItems.length > 0) {
        // Distribute the subtotal among line items
        const amountPerItem = subtotal / invoice.lineItems.length;
        
        for (const lineItem of invoice.lineItems) {
          const itemAmount = Math.round(amountPerItem * 100) / 100;
          await prisma.lineItem.update({
            where: { id: lineItem.id },
            data: {
              unitPrice: itemAmount,
              totalPrice: itemAmount,
            }
          });
        }
      }

      // Add payment record if paid
      if (Math.random() > 0.3) {
        // Delete existing payments first
        await prisma.payment.deleteMany({
          where: { invoiceId: invoice.id }
        });

        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: totalAmount,
            currency: 'EUR',
            method: ['BANK_TRANSFER', 'CREDIT_CARD', 'PAYPAL'][Math.floor(Math.random() * 3)] as any,
            paidDate: invoice.issueDate,
          }
        });
      }
    }

    console.log('📈 Regenerating analytics data...');
    await generateAnalyticsData();

    console.log('✅ Successfully added realistic amounts to all invoices!');

  } catch (error) {
    console.error('❌ Error adding realistic amounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function generateAnalyticsData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Clear existing analytics
  await prisma.analytics.deleteMany();
  
  // Generate monthly aggregates for the last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const nextDate = new Date(currentYear, currentMonth - i + 1, 1);
    
    const invoices = await prisma.invoice.findMany({
      where: {
        issueDate: {
          gte: date,
          lt: nextDate
        }
      }
    });
    
    const totalSpend = invoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0);
    const invoiceCount = invoices.length;
    const avgInvoiceValue = invoiceCount > 0 ? totalSpend / invoiceCount : 0;
    
    // Store analytics data
    if (invoiceCount > 0) {
      await prisma.analytics.createMany({
        data: [
          {
            metric: 'monthly_spend',
            value: totalSpend,
            period: date,
            category: 'financial'
          },
          {
            metric: 'monthly_invoice_count',
            value: invoiceCount,
            period: date,
            category: 'operational'
          },
          {
            metric: 'avg_invoice_value',
            value: avgInvoiceValue,
            period: date,
            category: 'financial'
          }
        ],
        skipDuplicates: true
      });
    }
  }
}

// CLI runner
if (require.main === module) {
  addRealisticAmounts()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { addRealisticAmounts };