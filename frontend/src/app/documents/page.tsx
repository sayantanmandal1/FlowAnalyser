'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DocumentManagementPage } from '@/components/pages/DocumentManagementPage';

export default function DocumentsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="other-files" onTabChange={(tab) => window.location.href = `/${tab}`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Document Management" />
        
        <main className="flex-1 overflow-y-auto">
          <DocumentManagementPage />
        </main>
      </div>
    </div>
  );
}
