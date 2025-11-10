import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { LoadingSkeleton } from '@/hooks/useApi';

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  comparison?: string;
  trend?: 'up' | 'down' | 'neutral';
  sparklineData?: Array<{ value: number }>;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
}

export function StatCard({ 
  title, 
  subtitle, 
  value, 
  comparison, 
  trend,
  sparklineData,
  loading = false,
  prefix = '',
  suffix = ''
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <LoadingSkeleton className="h-4 w-20 mb-2" />
            <LoadingSkeleton className="h-3 w-16" />
          </div>
          <LoadingSkeleton className="w-16 h-8" />
        </div>
        <div className="flex items-end justify-between">
          <LoadingSkeleton className="h-8 w-24" />
          <LoadingSkeleton className="h-4 w-20" />
        </div>
      </div>
    );
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      case 'neutral':
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getSparklineColor = () => {
    switch (trend) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      case 'neutral':
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
          {subtitle && (
            <div className="text-xs text-gray-500">{subtitle}</div>
          )}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-16 h-8 ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getSparklineColor()}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-2xl sm:text-3xl font-semibold text-gray-900">
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix}
        </div>
        
        {comparison && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{comparison}</span>
          </div>
        )}
      </div>
    </div>
  );
}
