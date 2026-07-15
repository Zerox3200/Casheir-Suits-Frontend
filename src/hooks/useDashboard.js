import { useQuery } from 'react-query'
import { assertSuccess } from '../helpers/apiResponse'
import { getDashboardService } from '../services/dashboard.services'

export const DASHBOARD_QUERY_KEY = ['dashboard']

export function useDashboard() {
  return useQuery(DASHBOARD_QUERY_KEY, async () => {
    const result = assertSuccess(await getDashboardService())
    return (
      result.data ?? {
        todaySales: { amount: 0, invoiceCount: 0 },
        monthlySales: { amount: 0, invoiceCount: 0 },
        totalRevenue: 0,
        totalProfit: 0,
        totalProducts: 0,
        totalInvoices: 0,
        recentInvoices: [],
        outOfStock: { count: 0, products: [] },
        lowStock: { count: 0, products: [] },
      }
    )
  })
}
