import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const categoryData = [
  { name: 'Operations', value: 1000, color: '#1e40af' },
  { name: 'Marketing', value: 7250, color: '#f97316' },
  { name: 'Facilities', value: 1000, color: '#60a5fa' },
];

export function CategorySpendChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="mb-1">Spend by Category</h3>
        <p className="text-xs text-gray-500">Distribution of spending across different categories.</p>
      </div>
      
      <div className="h-64 sm:h-72 flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height="70%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2 w-full">
          {categoryData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <span>${item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
