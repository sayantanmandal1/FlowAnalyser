import { 
  LayoutDashboard, 
  FileText, 
  Files, 
  Building2, 
  Users, 
  Settings,
  MessageSquare 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat with Data', icon: MessageSquare },
    { id: 'invoice', label: 'Invoice', icon: FileText },
    { id: 'other-files', label: 'Other files', icon: Files },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#f8f9fc] border-r border-gray-200 flex flex-col h-screen">
      {/* Logo/Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white">B</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate">buchhaltung</div>
            <div className="text-xs text-gray-500 truncate">by flowbit</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="text-xs uppercase text-gray-400 mb-4 tracking-wide">General</div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Flowbit AI Branding */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
          </div>
          <span>Flowbit AI</span>
        </div>
      </div>
    </div>
  );
}
