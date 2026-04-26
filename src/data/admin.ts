export const mockAdminDashboard = {
  adminName: 'Alex',
  stats: {
    products: 24,
    totalOrders: 12,
    users: 8,
    totalRevenue: 5430,
  },
  transactions: [
    {
      id: '#CL-1001',
      initials: 'JD',
      customer: 'John Doe',
      product: 'Monochrome Archetype Jacket',
      date: 'Apr 23, 2026',
      amount: 895,
      status: 'DELIVERED',
      statusClass: 'orange',
    },
    {
      id: '#CL-1002',
      initials: 'AS',
      customer: 'Anna Smith',
      product: 'T1 Desktop Lamp',
      date: 'Apr 22, 2026',
      amount: 890,
      status: 'PROCESSING',
      statusClass: 'blue',
    },
  ],
}
