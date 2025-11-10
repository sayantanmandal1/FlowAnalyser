import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

// Mock invoice data - replace with API call to /invoices
const mockInvoices = [
  { id: 'INV-001', vendor: 'Phunli GmbH', date: '2025-10-15', amount: 738.78, status: 'Paid' },
  { id: 'INV-002', vendor: 'AmzaDots', date: '2025-10-18', amount: 4500.00, status: 'Pending' },
  { id: 'INV-003', vendor: 'Test Solution', date: '2025-10-20', amount: 8500.00, status: 'Paid' },
  { id: 'INV-004', vendor: 'Infomedics', date: '2025-10-22', amount: 6200.00, status: 'Overdue' },
  { id: 'INV-005', vendor: 'DataServices', date: '2025-10-25', amount: 5800.00, status: 'Paid' },
  { id: 'INV-006', vendor: 'OmegaLtd', date: '2025-10-28', amount: 15000.00, status: 'Pending' },
  { id: 'INV-007', vendor: 'Global Supply', date: '2025-11-01', amount: 8679.25, status: 'Paid' },
  { id: 'INV-008', vendor: 'OmegaInc', date: '2025-11-03', amount: 4200.00, status: 'Pending' },
  { id: 'INV-009', vendor: 'Phunli GmbH', date: '2025-11-05', amount: 738.78, status: 'Paid' },
  { id: 'INV-010', vendor: 'Test Solution', date: '2025-11-07', amount: 3800.00, status: 'Overdue' },
  { id: 'INV-011', vendor: 'AmzaDots', date: '2025-11-08', amount: 2100.00, status: 'Paid' },
  { id: 'INV-012', vendor: 'DataServices', date: '2025-11-09', amount: 7200.00, status: 'Pending' },
];

type SortField = 'vendor' | 'date' | 'amount' | 'status' | 'id';
type SortDirection = 'asc' | 'desc' | null;

export function InvoicesTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = mockInvoices.filter(
      (invoice) =>
        invoice.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'date') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [searchQuery, sortField, sortDirection]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="mb-1">Invoices</h3>
        <p className="text-xs text-gray-500">All invoices with vendor details and status</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by vendor, invoice number, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-2">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs text-gray-600">Invoice #</span>
                  <SortIcon field="id" />
                </button>
              </th>
              <th className="text-left py-3 px-2">
                <button
                  onClick={() => handleSort('vendor')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs text-gray-600">Vendor</span>
                  <SortIcon field="vendor" />
                </button>
              </th>
              <th className="text-left py-3 px-2">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs text-gray-600">Date</span>
                  <SortIcon field="date" />
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-1 ml-auto hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs text-gray-600">Amount</span>
                  <SortIcon field="amount" />
                </button>
              </th>
              <th className="text-left py-3 px-2">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs text-gray-600">Status</span>
                  <SortIcon field="status" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="py-3 px-2 text-sm">{invoice.id}</td>
                <td className="py-3 px-2 text-sm">{invoice.vendor}</td>
                <td className="py-3 px-2 text-sm">
                  {new Date(invoice.date).toLocaleDateString('en-GB')}
                </td>
                <td className="py-3 px-2 text-sm text-right">
                  € {invoice.amount.toFixed(2)}
                </td>
                <td className="py-3 px-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedInvoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No invoices found matching your search.
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        Showing {filteredAndSortedInvoices.length} of {mockInvoices.length} invoices
      </div>
    </div>
  );
}
