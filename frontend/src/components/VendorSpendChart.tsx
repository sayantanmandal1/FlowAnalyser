import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const vendorData = [
  { vendor: 'AmzaDots', value: 4500 },
  { vendor: 'Test Solution', value: 8500 },
  { vendor: 'Infomedics', value: 6200 },
  { vendor: 'DataServices', value: 5800 },
  { vendor: 'OmegaLtd', value: 15000 },
  { vendor: 'Global Supply', value: 8679 },
  { vendor: 'Vendor Spend', value: 8679 },
  { vendor: 'OmegaInc', value: 4200 },
  { vendor: 'OmegaLtd', value: 3800 },
];

export function VendorSpendChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="mb-1">Spend by Vendor (Top 10)</h3>
        <p className="text-xs text-gray-500">Vendor spend with cumulative percentage distribution.</p>
      </div>
      
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={vendorData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category" 
              dataKey="vendor" 
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              width={80}
            />
            <Bar 
              dataKey="value" 
              fill="#1e40af"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
