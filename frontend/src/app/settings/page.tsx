'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SettingsPage } from '@/components/pages/SettingsPage';

export default function Settings() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="settings" onTabChange={(tab) => window.location.href = `/${tab}`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Settings" />
        
        <main className="flex-1 overflow-y-auto">
          <SettingsPage />
        </main>
      </div>
    </div>
  );
}
