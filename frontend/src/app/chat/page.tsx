'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ChatWithData } from '@/components/ChatWithData';

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="chat" onTabChange={(tab) => window.location.href = `/${tab}`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Chat with Data" />
        
        <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="h-full max-w-[1400px] mx-auto">
            <ChatWithData />
          </div>
        </main>
      </div>
    </div>
  );
}
