'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { UserManagementPage } from '@/components/pages/UserManagementPage';

export default function UsersPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="users" onTabChange={(tab) => window.location.href = `/${tab}`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="User Management" />
        
        <main className="flex-1 overflow-y-auto">
          <UserManagementPage />
        </main>
      </div>
    </div>
  );
}
