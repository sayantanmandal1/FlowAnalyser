import { Menu, MoreVertical, User, Settings, LogOut, Download, Bell, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = 'Dashboard' }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleProfileAction = (action: string) => {
    setShowDropdown(false);
    
    switch (action) {
      case 'profile':
        alert('Profile settings would open here');
        break;
      case 'settings':
        alert('Application settings would open here');
        break;
      case 'export':
        // Trigger data export
        const data = {
          timestamp: new Date().toISOString(),
          user: 'Amit Jadhav',
          type: 'analytics_export'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
      case 'notifications':
        alert('Notifications panel would open here');
        break;
      case 'help':
        window.open('https://github.com/flowbit-ai/help', '_blank');
        break;
      case 'logout':
        if (confirm('Are you sure you want to logout?')) {
          alert('Logout functionality would be implemented here');
        }
        break;
    }
  };
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
              alt="Amit Jadhav"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-900">Amit Jadhav</div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
          
          {/* Dropdown Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {showDropdown && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Amit Jadhav</p>
                    <p className="text-xs text-gray-500">amit@flowbit.com</p>
                  </div>
                  
                  <button
                    onClick={() => handleProfileAction('profile')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </button>
                  
                  <button
                    onClick={() => handleProfileAction('settings')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  
                  <button
                    onClick={() => handleProfileAction('notifications')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Bell className="w-4 h-4" />
                    Notifications
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={() => handleProfileAction('export')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  
                  <button
                    onClick={() => handleProfileAction('help')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={() => handleProfileAction('logout')}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
