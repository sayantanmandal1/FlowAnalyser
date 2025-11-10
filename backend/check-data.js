const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log("=== DATABASE COUNTS ===");
    
    const invoiceCount = await prisma.invoice.count();
    console.log("Invoices:", invoiceCount);
    
    const documentCount = await prisma.document.count(); 
    console.log("Documents:", documentCount);
    
    const userCount = await prisma.user.count();
    console.log("Users:", userCount);
    
    console.log("=====================");
    
    // Check invoice categories for departments
    console.log("\n=== INVOICE CATEGORIES (for departments) ===");
    const categories = await prisma.invoice.findMany({
      select: {
        category: true,
        totalAmount: true
      },
      distinct: ['category'],
      take: 10
    });
    console.table(categories);
    
    // Check if we have any non-null categories
    const categoryCounts = await prisma.invoice.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      where: {
        category: {
          not: null
        }
      }
    });
    console.log("\n=== CATEGORY COUNTS ===");
    console.table(categoryCounts);
    
    // Also show some sample data
    if (invoiceCount > 0) {
      console.log("\n=== SAMPLE INVOICES ===");
      const sampleInvoices = await prisma.invoice.findMany({
        take: 3,
        select: {
          invoiceNumber: true,
          totalAmount: true,
          status: true,
          category: true,
          vendor: {
            select: {
              name: true
            }
          }
        }
      });
      console.table(sampleInvoices);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
