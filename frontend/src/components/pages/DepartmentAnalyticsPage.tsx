import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatCard } from '@/components/StatCard';
import { Building2, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react';
import { analyticsApi } from '@/lib/api';

interface DepartmentData {
  department: string;
  total_spend: number;
  invoice_count: number;
  avg_invoice_value: number;
  budget_allocated: number;
  budget_utilized: number;
}

interface TrendData {
  month: string;
  total_amount: number;
  invoice_count: number;
}

export function DepartmentAnalyticsPage() {
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [departmentsData, trendsData] = await Promise.all([
          analyticsApi.getDepartments(),
          analyticsApi.getDepartmentTrends()
        ]);
        
        setDepartments(departmentsData);
        setTrends(trendsData);
      } catch (err) {
        console.error('Error fetching department analytics:', err);
        setError('Failed to load department analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading department analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Prepare data for charts
  const departmentSpend = departments.map(dept => ({
    name: dept.department,
    spend: dept.total_spend,
    budget: dept.budget_allocated,
    employees: Math.ceil(dept.invoice_count / 10), // Estimate employees based on invoice activity
    utilization: dept.budget_utilized
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const totalSpend = departments.reduce((sum, dept) => sum + dept.total_spend, 0);
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget_allocated, 0);
  const avgUtilization = departments.length > 0 
    ? departments.reduce((sum, dept) => sum + dept.budget_utilized, 0) / departments.length 
    : 0;
  const totalInvoices = departments.reduce((sum, dept) => sum + dept.invoice_count, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Department Analytics</h1>
        <p className="text-gray-600 mt-1">Track spending and performance across departments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Departments"
          value={departments.length}
          comparison={`${totalInvoices} invoices total`}
          trend="neutral"
        />
        <StatCard
          title="Total Budget"
          value={`€${(totalBudget / 1000).toFixed(0)}k`}
          comparison="Allocated budget"
          trend="neutral"
        />
        <StatCard
          title="Total Spend"
          value={`€${(totalSpend / 1000).toFixed(0)}k`}
          comparison={`€${(totalSpend / totalInvoices).toFixed(0)} avg per invoice`}
          trend="up"
        />
        <StatCard
          title="Avg Utilization"
          value={`${avgUtilization.toFixed(1)}%`}
          comparison="Budget utilization"
          trend={avgUtilization > 80 ? "up" : "neutral"}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Spending Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Spending vs Budget</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentSpend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, '']} />
              <Bar dataKey="spend" fill="#3B82F6" name="Actual Spend" />
              <Bar dataKey="budget" fill="#E5E7EB" name="Budget" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentSpend}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="spend"
              >
                {departmentSpend.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, 'Spend']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`€${Number(value).toLocaleString()}`, '']} />
            <Bar dataKey="total_amount" fill="#3B82F6" name="Total Spend" />
          </BarChart>
        </ResponsiveContainer>
        {trends.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No trend data available
          </div>
        )}
      </div>

      {/* Department Details Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Department Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spend per Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentSpend.map((dept, index) => (
                <tr key={dept.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {dept.employees}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    €{dept.budget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    €{dept.spend.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            dept.utilization > 90 ? 'bg-red-500' : dept.utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(dept.utilization, 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">{dept.utilization.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    €{(dept.spend / dept.employees).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      dept.utilization > 90
                        ? 'bg-red-100 text-red-800'
                        : dept.utilization > 75
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {dept.utilization > 90 ? 'Over Budget' : dept.utilization > 75 ? 'Near Limit' : 'On Track'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}