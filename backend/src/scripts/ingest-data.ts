import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AnalyticsDataItem {
  _id: string;
  name: string;
  filePath: string;
  fileSize: { $numberLong: string };
  fileType: string;
  status: string;
  organizationId: string;
  departmentId?: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  metadata: {
    docId: string;
    userId: string;
    organizationId: string;
    departmentId?: string;
    templateId?: string;
    templateName?: string;
    title: string;
    description?: string;
    uploadedAt: string;
    originalFileName: string;
    uploadedBy: string;
  };
  isValidatedByHuman?: boolean;
  uploadedById?: string;
  extractedData: {
    llmData: any; // Use any to handle both structures
  };
}

const mapInvoiceStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'PENDING',
    'paid': 'PAID',
    'overdue': 'OVERDUE',
    'cancelled': 'CANCELLED',
    'draft': 'DRAFT'
  };
  return statusMap[status.toLowerCase()] || 'PENDING';
};

const mapPaymentMethod = (method: string) => {
  const methodMap: Record<string, string> = {
    'bank_transfer': 'BANK_TRANSFER',
    'credit_card': 'CREDIT_CARD',
    'paypal': 'PAYPAL',
    'cash': 'CASH',
    'check': 'CHECK'
  };
  return methodMap[method.toLowerCase()] || 'OTHER';
};

export async function ingestAnalyticsData(filePath: string) {
  try {
    console.log('🚀 Starting data ingestion...');
    
    // Read and parse JSON file
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const analyticsData: AnalyticsDataItem[] = JSON.parse(rawData);
    
    console.log(`📊 Found ${analyticsData.length} records to process`);
    
    // Clear existing data (optional - remove in production)
    console.log('🧹 Cleaning existing data...');
    await prisma.payment.deleteMany();
    await prisma.lineItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.document.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.analytics.deleteMany();
    
    let processedCount = 0;
    let errorCount = 0;
    const usedInvoiceNumbers = new Set<string>();
    
    for (const item of analyticsData) {
      try {
        // Extract invoice data from nested structure
        const invoiceData = item.extractedData?.llmData?.invoice?.value;
        
        // Handle special case where extractedData has different structure
        if (!invoiceData) {
          // Check if this is a "Null metadata test" or similar case
          if (item.extractedData?.llmData?.summary) {
            console.log(`📝 Processing special record ${item._id} - creating default invoice structure`);
            
            // Create a default vendor
            const vendorName = 'Default Vendor';
            const vendorId = `vendor_default_${Math.random().toString(36).substring(7)}`;
            
            const vendor = await prisma.vendor.create({
              data: {
                id: vendorId,
                name: vendorName,
                email: null,
                address: null,
                category: 'General',
              }
            });
            
            // Generate unique invoice number
            let invoiceNumber = `DOC-${item._id.substring(0, 8)}`;
            let counter = 1;
            while (usedInvoiceNumbers.has(invoiceNumber)) {
              invoiceNumber = `DOC-${item._id.substring(0, 8)}-${counter}`;
              counter++;
            }
            usedInvoiceNumbers.add(invoiceNumber);
            
            // Create default invoice
            const invoice = await prisma.invoice.create({
              data: {
                id: item._id,
                invoiceNumber: invoiceNumber,
                vendorId: vendor.id,
                customerId: null,
                issueDate: new Date(item.createdAt.$date),
                dueDate: null,
                paidDate: null,
                subtotal: 0,
                taxAmount: 0,
                totalAmount: 0,
                currency: 'EUR',
                status: 'DRAFT',
                description: item.metadata.title || 'Document without invoice data',
                category: 'Document',
              }
            });

            // Create a placeholder line item
            await prisma.lineItem.create({
              data: {
                invoiceId: invoice.id,
                description: item.extractedData.llmData.summary || 'Document placeholder',
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
              }
            });

            // Create document record
            await prisma.document.create({
              data: {
                id: `doc_${item._id}`,
                invoiceId: invoice.id,
                fileName: item.name,
                filePath: item.filePath,
                fileSize: parseInt(item.fileSize.$numberLong),
                mimeType: item.fileType,
                type: item.metadata.templateName === 'Invoice' ? 'INVOICE' : 'OTHER',
                uploadedAt: new Date(item.createdAt.$date),
              }
            });

            processedCount++;
            continue;
          }
          
          console.log(`⚠️ Skipping record ${item._id} - missing invoice data`);
          errorCount++;
          continue;
        }
        
        if (!invoiceData.invoiceId?.value) {
          console.log(`⚠️ Skipping record ${item._id} - missing invoice ID`);
          errorCount++;
          continue;
        }
        
        // Create vendor with extracted data
        const vendorName = invoiceData.vendorName?.value || 'Unknown Vendor';
        const vendorId = `vendor_${vendorName.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(7)}`;
        
        const vendor = await prisma.vendor.upsert({
          where: { id: vendorId },
          update: {},
          create: {
            id: vendorId,
            name: vendorName,
            email: invoiceData.vendorEmail?.value || null,
            address: invoiceData.vendorAddress?.value || null,
            category: invoiceData.category?.value || 'General',
          }
        });
        
        // Create customer if exists
        let customer = null;
        if (invoiceData.customerName?.value) {
          const customerName = invoiceData.customerName.value;
          const customerId = `customer_${customerName.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(7)}`;
          
          customer = await prisma.customer.upsert({
            where: { id: customerId },
            update: {},
            create: {
              id: customerId,
              name: customerName,
              email: invoiceData.customerEmail?.value || null,
            }
          });
        }
        
        // Generate unique invoice number
        let invoiceNumber = invoiceData.invoiceId.value;
        let counter = 1;
        while (usedInvoiceNumbers.has(invoiceNumber)) {
          invoiceNumber = `${invoiceData.invoiceId.value}-${counter}`;
          counter++;
        }
        usedInvoiceNumbers.add(invoiceNumber);
        
        // Parse amounts with fallbacks
        const totalAmount = parseFloat(invoiceData.totalAmount?.value || '0') || 0;
        const subtotal = parseFloat(invoiceData.subtotal?.value || invoiceData.totalAmount?.value || '0') || totalAmount;
        const taxAmount = parseFloat(invoiceData.taxAmount?.value || '0') || 0;
        
        // Parse dates with fallbacks
        const issueDate = invoiceData.invoiceDate?.value 
          ? new Date(invoiceData.invoiceDate.value) 
          : new Date(item.createdAt.$date);
        
        const dueDate = invoiceData.dueDate?.value 
          ? new Date(invoiceData.dueDate.value) 
          : null;
        
        // Create invoice using document ID to ensure uniqueness
        const invoice = await prisma.invoice.create({
          data: {
            id: item._id, // Use document ID as invoice ID
            invoiceNumber: invoiceNumber,
            vendorId: vendor.id,
            customerId: customer?.id || null,
            issueDate: issueDate,
            dueDate: dueDate,
            paidDate: null, // Will be set when payment is processed
            subtotal: subtotal,
            taxAmount: taxAmount,
            totalAmount: totalAmount,
            currency: invoiceData.currency?.value || 'EUR',
            status: mapInvoiceStatus(invoiceData.status?.value || 'pending') as any,
            description: invoiceData.description?.value || item.metadata.title,
            category: invoiceData.category?.value || 'General',
          }
        });

        // Create line items if available
        if (invoiceData.lineItems && Array.isArray(invoiceData.lineItems)) {
          for (let i = 0; i < invoiceData.lineItems.length; i++) {
            const lineItem = invoiceData.lineItems[i];
            const quantity = parseFloat(lineItem.quantity?.value || '1') || 1;
            const unitPrice = parseFloat(lineItem.unitPrice?.value || '0') || 0;
            const totalPrice = parseFloat(lineItem.totalPrice?.value || '0') || (quantity * unitPrice);
            const description = lineItem.description?.value || `Line item ${i + 1}`;
            
            await prisma.lineItem.create({
              data: {
                invoiceId: invoice.id,
                description: description,
                quantity: quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
              }
            });
          }
        } else {
          // Create a single line item for the total amount if no line items exist
          const description = invoiceData.description?.value || item.metadata.title || 'Invoice total';
          await prisma.lineItem.create({
            data: {
              invoiceId: invoice.id,
              description: description,
              quantity: 1,
              unitPrice: totalAmount,
              totalPrice: totalAmount,
            }
          });
        }
        
        // Create a payment record if the invoice appears to be paid
        if (invoiceData.status?.value?.toLowerCase() === 'paid') {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: totalAmount,
              currency: invoiceData.currency?.value || 'EUR',
              method: 'BANK_TRANSFER', // Default payment method
              paidDate: issueDate, // Use issue date as fallback
            }
          });
          
          // Update invoice paid date
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { paidDate: issueDate }
          });
        }

        // Create document record for this processed file
        await prisma.document.create({
          data: {
            id: `doc_${item._id}`, // Add prefix to avoid conflicts with invoice ID
            invoiceId: invoice.id,
            fileName: item.name,
            filePath: item.filePath,
            fileSize: parseInt(item.fileSize.$numberLong),
            mimeType: item.fileType,
            type: item.metadata.templateName === 'Invoice' ? 'INVOICE' : 'OTHER',
            uploadedAt: new Date(item.createdAt.$date),
          }
        });

        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(`✅ Processed ${processedCount}/${analyticsData.length} records`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing record ${item._id}:`, error);
        errorCount++;
      }
    }
    
    // Generate analytics summary data
    console.log('📈 Generating analytics data...');
    await generateAnalyticsData();
    
    console.log(`🎉 Data ingestion completed!`);
    console.log(`✅ Successfully processed: ${processedCount} records`);
    console.log(`❌ Errors: ${errorCount} records`);
    
  } catch (error) {
    console.error('❌ Fatal error during data ingestion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function generateAnalyticsData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
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

// CLI runner
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('❌ Please provide the path to Analytics_Test_Data.json');
    console.log('Usage: npm run ingest-data <path-to-json-file>');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  ingestAnalyticsData(filePath)
    .then(() => {
      console.log('✅ Data ingestion script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Data ingestion script failed:', error);
      process.exit(1);
    });
}