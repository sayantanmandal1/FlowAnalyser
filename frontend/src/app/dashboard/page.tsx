'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { InvoiceVolumeChart } from '@/components/InvoiceVolumeChart';
import { VendorSpendChart } from '@/components/VendorSpendChart';
import { CategorySpendChart } from '@/components/CategorySpendChart';
import { CashOutflowChart } from '@/components/CashOutflowChart';
import { InvoicesTable } from '@/components/InvoicesTable';
import { useApi, ApiErrorBoundary } from '@/hooks/useApi';
import { analyticsApi, formatCurrency } from '@/lib/api';

export default function DashboardPage() {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(
    analyticsApi.getStats,
    []
  );

  const generateMockSparkline = (value: number, trend: 'up' | 'down' | 'neutral') => {
    const baseValue = value / 7;
    const variance = baseValue * 0.1;
    
    return Array.from({ length: 7 }, (_, i) => {
      let trendValue = 0;
      if (trend === 'up') trendValue = (i * variance) / 6;
      else if (trend === 'down') trendValue = -(i * variance) / 6;
      
      const randomVariance = (Math.random() - 0.5) * variance * 0.3;
      return { value: Math.max(0, baseValue + trendValue + randomVariance) };
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="dashboard" onTabChange={(tab) => window.location.href = `/${tab}`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Analytics Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <InvoiceVolumeChart />
            <VendorSpendChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            <CategorySpendChart />
            <CashOutflowChart />
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/documents'}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-gray-900">Upload Documents</div>
                  <div className="text-sm text-gray-600">Add new invoices or receipts</div>
                </button>
                <button 
                  className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  onClick={() => window.location.href = '/chat'}>
                  <div className="font-medium text-blue-900">Ask Questions</div>
                  <div className="text-sm text-blue-600">Chat with your data using AI</div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <InvoicesTable />
          </div>
        </main>
      </div>
    </div>
  );
}
