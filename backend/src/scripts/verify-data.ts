import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  try {
    console.log('🔍 Verifying imported data...\n');
    
    // Count records in each table
    const vendorCount = await prisma.vendor.count();
    const customerCount = await prisma.customer.count();
    const invoiceCount = await prisma.invoice.count();
    const lineItemCount = await prisma.lineItem.count();
    const paymentCount = await prisma.payment.count();
    const documentCount = await prisma.document.count();
    const analyticsCount = await prisma.analytics.count();

    console.log('📊 Database Summary:');
    console.log(`Vendors: ${vendorCount}`);
    console.log(`Customers: ${customerCount}`);
    console.log(`Invoices: ${invoiceCount}`);
    console.log(`Line Items: ${lineItemCount}`);
    console.log(`Payments: ${paymentCount}`);
    console.log(`Documents: ${documentCount}`);
    console.log(`Analytics: ${analyticsCount}\n`);

    // Sample data
    console.log('📋 Sample Vendors:');
    const vendors = await prisma.vendor.findMany({ take: 3 });
    vendors.forEach((vendor: any) => console.log(`- ${vendor.name} (${vendor.email})`));

    console.log('\n📋 Sample Invoices:');
    const invoices = await prisma.invoice.findMany({ 
      take: 3, 
      include: { vendor: true } 
    });
    invoices.forEach((invoice: any) => {
      console.log(`- ${invoice.invoiceNumber}: $${invoice.totalAmount} from ${invoice.vendor.name}`);
    });

    console.log('\n✅ Data verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();