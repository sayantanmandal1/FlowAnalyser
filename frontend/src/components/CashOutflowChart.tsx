import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const outflowData = [
  { period: '1-7 days', amount: 40 },
  { period: '8-30 days', amount: 55 },
  { period: '31-60 days', amount: 35 },
  { period: '60+ days', amount: 65 },
];

export function CashOutflowChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="mb-1">Cash Outflow Forecast</h3>
        <p className="text-xs text-gray-500">Expected payment obligations grouped by due date ranges.</p>
      </div>
      
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={outflowData}>
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              tickFormatter={(value) => `€${value}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value) => [`€${value}k`, 'Amount']}
            />
            <Bar 
              dataKey="amount" 
              fill="#1e40af"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
