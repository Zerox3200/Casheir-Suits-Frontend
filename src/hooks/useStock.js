import { useMutation, useQuery, useQueryClient } from 'react-query'
import { assertSuccess } from '../helpers/apiResponse'
import {
  adjustStockService,
  getLowStockService,
  listStockMovementsService,
  listStockService,
} from '../services/stock.services'

export const STOCK_QUERY_KEY = ['stock']
export const STOCK_MOVEMENTS_QUERY_KEY = ['stock-movements']
export const LOW_STOCK_QUERY_KEY = ['stock', 'low']

export function useStock(params = { limit: 100 }) {
  return useQuery([...STOCK_QUERY_KEY, params], async () => {
    const result = assertSuccess(await listStockService(params))
    return {
      items: result.data?.items ?? [],
      pagination: result.data?.pagination ?? null,
    }
  })
}

export function useLowStock() {
  return useQuery(LOW_STOCK_QUERY_KEY, async () => {
    const result = assertSuccess(await getLowStockService())
    return result.data?.items ?? []
  })
}

export function useStockMovements(params = { limit: 100 }) {
  return useQuery([...STOCK_MOVEMENTS_QUERY_KEY, params], async () => {
    const result = assertSuccess(await listStockMovementsService(params))
    return {
      items: result.data?.items ?? [],
      pagination: result.data?.pagination ?? null,
    }
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ productId, quantity, reason }) =>
      assertSuccess(
        await adjustStockService(productId, { quantity, reason })
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(STOCK_QUERY_KEY)
        queryClient.invalidateQueries(STOCK_MOVEMENTS_QUERY_KEY)
        queryClient.invalidateQueries(LOW_STOCK_QUERY_KEY)
      },
    }
  )
}
