import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

// Sample data
const sampleVendors = [
  {
    name: "TechCorp Solutions",
    email: "contact@techcorp.com", 
    category: "Technology",
    country: "Germany",
    city: "Berlin"
  },
  {
    name: "Office Supplies Plus",
    email: "orders@officesupplies.com",
    category: "Office Supplies", 
    country: "Netherlands",
    city: "Amsterdam"
  },
  {
    name: "Marketing Pro",
    email: "hello@marketingpro.com",
    category: "Marketing",
    country: "France", 
    city: "Paris"
  },
  {
    name: "CloudHost Services",
    email: "support@cloudhost.com",
    category: "Technology",
    country: "Germany",
    city: "Munich"
  },
  {
    name: "Legal Associates",
    email: "info@legalassoc.com", 
    category: "Legal",
    country: "Netherlands",
    city: "Rotterdam"
  }
];

const sampleCustomers = [
  {
    name: "FlowbitAI GmbH",
    email: "accounting@flowbitai.com",
    country: "Germany",
    city: "Berlin"
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.payment.deleteMany();
    await prisma.lineItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.document.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.customer.deleteMany();
    
    console.log('🧹 Cleared existing data');

    // Create vendors
    const createdVendors = await Promise.all(
      sampleVendors.map(vendor => prisma.vendor.create({ data: vendor }))
    );
    console.log(`✅ Created ${createdVendors.length} vendors`);

    // Create customers
    const createdCustomers = await Promise.all(
      sampleCustomers.map(customer => prisma.customer.create({ data: customer }))
    );
    console.log(`✅ Created ${createdCustomers.length} customers`);

    // Create invoices with line items
    const invoicesData = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 50; i++) {
      const vendor = createdVendors[Math.floor(Math.random() * createdVendors.length)];
      const customer = createdCustomers[0]; // Use the first customer
      
      // Random date within the last 12 months
      const issueDate = new Date(currentDate);
      issueDate.setMonth(currentDate.getMonth() - Math.floor(Math.random() * 12));
      
      const dueDate = new Date(issueDate);
      dueDate.setDate(issueDate.getDate() + 30); // 30 days payment term
      
      const subtotal = Math.floor(Math.random() * 5000) + 500; // 500-5500
      const taxAmount = subtotal * 0.19; // 19% VAT
      const totalAmount = subtotal + taxAmount;
      
      // Determine status based on due date
      let status: 'PENDING' | 'PAID' | 'OVERDUE' = 'PENDING';
      let paidDate = null;
      
      if (dueDate < currentDate) {
        if (Math.random() > 0.3) { // 70% chance it's paid even if overdue
          status = 'PAID';
          paidDate = new Date(dueDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
        } else {
          status = 'OVERDUE';
        }
      } else {
        if (Math.random() > 0.5) { // 50% chance it's already paid
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

      // Create payment if invoice is paid
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

      invoicesData.push(invoice);
    }

    console.log(`✅ Created ${invoicesData.length} invoices with line items and payments`);

    // Create some documents
    const documents = [];
    for (let i = 0; i < 20; i++) {
      const invoice = invoicesData[Math.floor(Math.random() * invoicesData.length)];
      
      const document = await prisma.document.create({
        data: {
          invoiceId: invoice.id,
          fileName: `${invoice.invoiceNumber}.pdf`,
          filePath: `/uploads/${invoice.invoiceNumber}.pdf`,
          fileSize: Math.floor(Math.random() * 1000000) + 100000, // 100KB - 1MB
          mimeType: 'application/pdf',
          type: 'INVOICE',
          uploadedAt: invoice.issueDate
        }
      });

      documents.push(document);
    }

    console.log(`✅ Created ${documents.length} documents`);

    // Create analytics entries
    const analytics = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - month);
      
      const monthlySpend = invoicesData
        .filter(inv => {
          const invMonth = inv.issueDate.getMonth();
          const invYear = inv.issueDate.getFullYear();
          return invMonth === date.getMonth() && invYear === date.getFullYear() && inv.status === 'PAID';
        })
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

      if (monthlySpend > 0) {
        analytics.push(
          await prisma.analytics.create({
            data: {
              metric: 'monthly_spend',
              value: monthlySpend,
              category: 'finance',
              period: date,
              metadata: {
                currency: 'EUR',
                month: date.getMonth() + 1,
                year: date.getFullYear()
              }
            }
          })
        );
      }
    }

    console.log(`✅ Created ${analytics.length} analytics entries`);

    console.log('🎉 Database seeding completed successfully!');
    
    // Print summary
    const counts = await Promise.all([
      prisma.vendor.count(),
      prisma.customer.count(), 
      prisma.invoice.count(),
      prisma.payment.count(),
      prisma.document.count(),
      prisma.analytics.count()
    ]);

    console.log('\n📊 Database Summary:');
    console.log(`   Vendors: ${counts[0]}`);
    console.log(`   Customers: ${counts[1]}`);
    console.log(`   Invoices: ${counts[2]}`);
    console.log(`   Payments: ${counts[3]}`);
    console.log(`   Documents: ${counts[4]}`);
    console.log(`   Analytics: ${counts[5]}\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedDatabase;