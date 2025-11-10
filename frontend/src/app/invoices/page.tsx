'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { InvoiceManagementPage } from '@/components/pages/InvoiceManagementPage';

export default function InvoicesPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="invoice" onTabChange={(tab) => window.location.href = `/${tab}`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Invoice Management" />
        
        <main className="flex-1 overflow-y-auto">
          <InvoiceManagementPage />
        </main>
      </div>
    </div>
  );
}
