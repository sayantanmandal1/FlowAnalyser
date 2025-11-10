export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response.text() as unknown as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// API service functions
export const analyticsApi = {
  // Get overview statistics
  getStats: () =>
    apiRequest<{
      totalSpend: number;
      totalInvoices: number;
      documentsUploaded: number;
      averageInvoiceValue: number;
    }>('/analytics/stats'),

  // Get invoice trends (monthly data)
  getInvoiceTrends: () =>
    apiRequest<Array<{
      year: number;
      month: number;
      invoice_count: number;
      total_value: number;
    }>>('/analytics/invoice-trends'),

  // Get top vendors by spend
  getTopVendors: () =>
    apiRequest<Array<{
      id: string;
      name: string;
      category: string;
      totalSpend: number;
    }>>('/analytics/vendors/top10'),

  // Get spend by category
  getCategorySpend: () =>
    apiRequest<Array<{
      category: string;
      _sum: { totalAmount: number };
    }>>('/analytics/category-spend'),

  // Get cash outflow forecast
  getCashOutflow: () =>
    apiRequest<Array<{
      due_date: string;
      total_amount: number;
      invoice_count: number;
    }>>('/analytics/cash-outflow'),

  // Get department analytics
  getDepartments: () =>
    apiRequest<Array<{
      department: string;
      total_spend: number;
      invoice_count: number;
      avg_invoice_value: number;
      budget_allocated: number;
      budget_utilized: number;
    }>>('/analytics/departments'),

  // Get department trends
  getDepartmentTrends: (department?: string) =>
    apiRequest<Array<{
      month: string;
      total_amount: number;
      invoice_count: number;
    }>>(`/analytics/departments/trends${department ? `?department=${department}` : ''}`),
};

export const invoicesApi = {
  // Get invoices with pagination and filters
  getInvoices: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    vendor?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    return apiRequest<{
      data: Array<{
        id: string;
        invoiceNumber: string;
        vendor: {
          id: string;
          name: string;
          category: string;
        };
        customer?: {
          id: string;
          name: string;
        };
        issueDate: string;
        dueDate?: string;
        paidDate?: string;
        totalAmount: number;
        status: string;
        category?: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/invoices${query ? `?${query}` : ''}`);
  },

  // Get single invoice by ID
  getInvoice: (id: string) =>
    apiRequest<{
      id: string;
      invoiceNumber: string;
      vendor: any;
      customer?: any;
      lineItems: any[];
      payments: any[];
      issueDate: string;
      dueDate?: string;
      paidDate?: string;
      totalAmount: number;
      status: string;
    }>(`/invoices/${id}`),
};

export const vendorsApi = {
  // Get all vendors
  getVendors: () =>
    apiRequest<Array<{
      id: string;
      name: string;
      email?: string;
      category?: string;
      city?: string;
      country?: string;
    }>>('/vendors'),
};

export const chatApi = {
  // Send chat message to AI
  sendMessage: (question: string, context?: any) =>
    apiRequest<{
      question: string;
      sql?: string;
      data?: any[];
      chart_config?: any;
      error?: string;
      explanation?: string;
    }>('/chat/chat-with-data', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
    }),

  // Get chat history (if implemented)
  getChatHistory: () =>
    apiRequest<{
      conversations: any[];
      message: string;
    }>('/chat/history'),
};

export const documentsApi = {
  // Get all documents with pagination and filters
  getDocuments: (params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    return apiRequest<{
      data: Array<{
        id: string;
        filename: string;
        originalName: string;
        type: string;
        size: number;
        status: string;
        uploadedAt: string;
        processedAt?: string;
        metadata?: any;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/documents${query ? `?${query}` : ''}`);
  },

  // Upload a new document
  uploadDocument: (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('document', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return apiRequest<{
      id: string;
      filename: string;
      originalName: string;
      type: string;
      size: number;
      status: string;
      uploadedAt: string;
      message: string;
    }>('/documents/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  },

  // Get document by ID
  getDocument: (id: string) =>
    apiRequest<{
      id: string;
      filename: string;
      originalName: string;
      type: string;
      size: number;
      status: string;
      uploadedAt: string;
      processedAt?: string;
      metadata?: any;
    }>(`/documents/${id}`),

  // Delete document
  deleteDocument: (id: string) =>
    apiRequest<{ message: string }>(`/documents/${id}`, {
      method: 'DELETE',
    }),

  // Get document statistics
  getStats: () =>
    apiRequest<{
      total: number;
      byType: Array<{ type: string; count: number }>;
      byStatus: Array<{ status: string; count: number }>;
      totalSize: number;
    }>('/documents/stats'),
};

export const usersApi = {
  // Get all users with pagination and filters
  getUsers: (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    department?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    return apiRequest<{
      data: Array<{
        id: string;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
        role: string;
        department?: string;
        isActive: boolean;
        lastLoginAt?: string;
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/users${query ? `?${query}` : ''}`);
  },

  // Create new user
  createUser: (userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: string;
    department?: string;
  }) =>
    apiRequest<{
      id: string;
      username: string;
      email: string;
      message: string;
    }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Get user by ID
  getUser: (id: string) =>
    apiRequest<{
      id: string;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: string;
      department?: string;
      isActive: boolean;
      lastLoginAt?: string;
      createdAt: string;
      updatedAt: string;
    }>(`/users/${id}`),

  // Update user
  updateUser: (id: string, userData: Partial<{
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    department?: string;
    isActive: boolean;
  }>) =>
    apiRequest<{
      id: string;
      username: string;
      email: string;
      message: string;
    }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  // Delete user
  deleteUser: (id: string) =>
    apiRequest<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Get user statistics
  getStats: () =>
    apiRequest<{
      total: number;
      byRole: Array<{ role: string; count: number }>;
      byDepartment: Array<{ department: string; count: number }>;
      activeUsers: number;
      recentLogins: number;
    }>('/users/stats'),
};

// Utility functions for data formatting
export const formatCurrency = (
  amount: number, 
  currency: string = 'EUR',
  locale: string = 'de-DE'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Data transformation utilities
export const calculateTrend = (current: number, previous: number): {
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
} => {
  if (previous === 0) {
    return { percentage: 0, direction: 'neutral' };
  }
  
  const percentage = ((current - previous) / previous) * 100;
  const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
  
  return { percentage: Math.abs(percentage), direction };
};

export const generateSparklineData = (values: number[]): Array<{ value: number }> => {
  return values.map(value => ({ value }));
};

// Status color mapping
export const getStatusColor = (status: string): {
  text: string;
  background: string;
  border: string;
} => {
  const statusColors: Record<string, { text: string; background: string; border: string }> = {
    PAID: {
      text: 'text-green-700',
      background: 'bg-green-50',
      border: 'border-green-200',
    },
    PENDING: {
      text: 'text-yellow-700',
      background: 'bg-yellow-50',
      border: 'border-yellow-200',
    },
    OVERDUE: {
      text: 'text-red-700',
      background: 'bg-red-50',
      border: 'border-red-200',
    },
    CANCELLED: {
      text: 'text-gray-700',
      background: 'bg-gray-50',
      border: 'border-gray-200',
    },
    DRAFT: {
      text: 'text-blue-700',
      background: 'bg-blue-50',
      border: 'border-blue-200',
    },
  };

  return statusColors[status] || statusColors.PENDING;
};