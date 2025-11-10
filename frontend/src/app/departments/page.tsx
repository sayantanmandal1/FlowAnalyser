'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DepartmentAnalyticsPage } from '@/components/pages/DepartmentAnalyticsPage';

export default function DepartmentsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="departments" onTabChange={(tab) => window.location.href = `/${tab}`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Department Analytics" />
        
        <main className="flex-1 overflow-y-auto">
          <DepartmentAnalyticsPage />
        </main>
      </div>
    </div>
  );
}
