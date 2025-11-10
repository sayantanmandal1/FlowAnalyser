'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { InvoiceVolumeChart } from '@/components/InvoiceVolumeChart';
import { VendorSpendChart } from '@/components/VendorSpendChart';
import { CategorySpendChart } from '@/components/CategorySpendChart';
import { CashOutflowChart } from '@/components/CashOutflowChart';
import { InvoicesTable } from '@/components/InvoicesTable';
import { ChatWithData } from '@/components/ChatWithData';
import { InvoiceManagementPage } from '@/components/pages/InvoiceManagementPage';
import { DocumentManagementPage } from '@/components/pages/DocumentManagementPage';
import { DepartmentAnalyticsPage } from '@/components/pages/DepartmentAnalyticsPage';
import { UserManagementPage } from '@/components/pages/UserManagementPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { useApi, ApiErrorBoundary } from '@/hooks/useApi';
import { analyticsApi, formatCurrency, generateSparklineData } from '@/lib/api';

// Helper function to get page title
const getPageTitle = (activeTab: string) => {
  const titles: Record<string, string> = {
    dashboard: 'Analytics Dashboard',
    chat: 'Chat with Data',
    invoice: 'Invoice Management',
    'other-files': 'Document Management',
    departments: 'Department Analytics',
    users: 'User Management',
    settings: 'Settings'
  };
  return titles[activeTab] || 'Analytics Dashboard';
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch overview statistics
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(
    analyticsApi.getStats,
    []
  );

  // Generate mock trend data for sparklines (you could fetch this from API too)
  const generateMockSparkline = (value: number, trend: 'up' | 'down' | 'neutral') => {
    const baseValue = value / 7; // Divide by 7 for weekly data
    const variance = baseValue * 0.1; // 10% variance
    
    return Array.from({ length: 7 }, (_, i) => {
      let trendValue = 0;
      if (trend === 'up') {
        trendValue = (i * variance) / 6;
      } else if (trend === 'down') {
        trendValue = -(i * variance) / 6;
      }
      
      const randomVariance = (Math.random() - 0.5) * variance * 0.3;
      return {
        value: Math.max(0, baseValue + trendValue + randomVariance)
      };
    });
  };

  // Render page content based on active tab
  const renderPageContent = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return (
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statsError ? (
                <div className="col-span-full">
                  <ApiErrorBoundary error={statsError} onRetry={refetchStats} />
                </div>
              ) : (
                <>
                  <StatCard
                    title="Total Spend"
                    subtitle="(YTD)"
                    value={stats ? formatCurrency(stats.totalSpend) : '€ 0'}
                    comparison="+12% from last month"
                    trend="up"
                    sparklineData={stats ? generateMockSparkline(stats.totalSpend, 'up') : undefined}
                    loading={statsLoading}
                  />
                  <StatCard
                    title="Total Invoices Processed"
                    value={stats?.totalInvoices || 0}
                    comparison="+8% from last month"
                    trend="up"
                    sparklineData={stats ? generateMockSparkline(stats.totalInvoices, 'up') : undefined}
                    loading={statsLoading}
                  />
                  <StatCard
                    title="Documents Uploaded"
                    subtitle="This Month"
                    value={stats?.documentsUploaded || 0}
                    comparison="-3% from last month"
                    trend="down"
                    sparklineData={stats ? generateMockSparkline(stats.documentsUploaded, 'down') : undefined}
                    loading={statsLoading}
                  />
                  <StatCard
                    title="Average Invoice Value"
                    value={stats ? formatCurrency(stats.averageInvoiceValue) : '€ 0'}
                    comparison="+5% from last month"
                    trend="up"
                    sparklineData={stats ? generateMockSparkline(stats.averageInvoiceValue, 'up') : undefined}
                    loading={statsLoading}
                  />
                </>
              )}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <InvoiceVolumeChart />
              <VendorSpendChart />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
              <CategorySpendChart />
              <div className="lg:col-span-1 xl:col-span-1">
                <CashOutflowChart />
              </div>
              <div className="lg:col-span-1 xl:col-span-1">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveTab('other-files')}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="font-medium text-gray-900">Upload Documents</div>
                      <div className="text-sm text-gray-600">Add new invoices or receipts</div>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="font-medium text-gray-900">Export Data</div>
                      <div className="text-sm text-gray-600">Download reports and analytics</div>
                    </button>
                    <button 
                      className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      onClick={() => setActiveTab('chat')}
                    >
                      <div className="font-medium text-blue-900">Ask Questions</div>
                      <div className="text-sm text-blue-600">Chat with your data using AI</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Width Invoices Table */}
            <div className="mt-6">
              <InvoicesTable />
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="h-full p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
            <div className="h-full">
              <ChatWithData />
            </div>
          </div>
        );

      case 'invoice':
        return <InvoiceManagementPage />;

      case 'other-files':
        return <DocumentManagementPage />;

      case 'departments':
        return <DepartmentAnalyticsPage />;

      case 'users':
        return <UserManagementPage />;

      case 'settings':
        return <SettingsPage />;

      default:
        return (
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h2 className="text-xl text-gray-600 mb-2">Coming Soon</h2>
              <p className="text-gray-500">This section is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50 lg:hidden">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          title={getPageTitle(activeTab)}
        />
        
        <main className="flex-1 overflow-y-auto">
          {renderPageContent(activeTab)}
        </main>
      </div>
    </div>
  );
}