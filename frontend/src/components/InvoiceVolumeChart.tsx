import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const monthlyData = [
  { month: 'Jan', value: 45, volume: 35 },
  { month: 'Feb', value: 75, volume: 52 },
  { month: 'Mar', value: 65, volume: 48 },
  { month: 'Apr', value: 55, volume: 42 },
  { month: 'May', value: 48, volume: 38 },
  { month: 'Jun', value: 40, volume: 32 },
  { month: 'Jul', value: 52, volume: 40 },
  { month: 'Aug', value: 62, volume: 46 },
  { month: 'Sep', value: 58, volume: 44 },
  { month: 'Oct', value: 42, volume: 67 },
  { month: 'Nov', value: 35, volume: 28 },
  { month: 'Dec', value: 25, volume: 20 },
];

export function InvoiceVolumeChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="mb-1">Invoice Volume + Value Trend</h3>
        <p className="text-xs text-gray-500">Invoice count and total spent over 12 months.</p>
      </div>
      
      <div className="relative">
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#6366f1" 
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* October 2025 Popup */}
        <div className="absolute top-8 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm hidden sm:block">
          <div className="text-xs text-gray-500 mb-1">October 2025</div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-500">Invoice count:</div>
              <div className="text-blue-600">67</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Spend:</div>
              <div>€ 8,679.25</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
