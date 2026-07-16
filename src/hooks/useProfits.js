import { useQuery } from 'react-query'
import { assertSuccess } from '../helpers/apiResponse'
import { getDailyProfitsService } from '../services/profits.services'

export const PROFITS_QUERY_KEY = ['profits']

const emptyProfits = {
  from: null,
  to: null,
  days: [],
  summary: {
    salesCount: 0,
    salesSubTotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    salesTotal: 0,
    returnsCount: 0,
    returnsTotal: 0,
    costTotal: 0,
    netRevenue: 0,
    profitTotal: 0,
    daysCount: 0,
  },
}

/**
 * @param {{ from?: string, to?: string }} params YYYY-MM-DD
 */
export function useDailyProfits(params = {}) {
  const queryParams = {
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
  }

  return useQuery(
    [...PROFITS_QUERY_KEY, queryParams],
    async () => {
      const result = assertSuccess(await getDailyProfitsService(queryParams))
      return {
        ...emptyProfits,
        ...(result.data ?? {}),
        summary: {
          ...emptyProfits.summary,
          ...(result.data?.summary ?? {}),
        },
        days: result.data?.days ?? [],
      }
    },
    {
      keepPreviousData: true,
    }
  )
}
