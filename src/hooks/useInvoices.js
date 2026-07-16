import { useMutation, useQuery, useQueryClient } from 'react-query'
import { assertSuccess } from '../helpers/apiResponse'
import {
  createInvoiceService,
  getInvoiceByNumberService,
  getInvoiceService,
  listInvoicesService,
  returnInvoiceService,
} from '../services/invoices.services'
import { STOCK_QUERY_KEY, STOCK_MOVEMENTS_QUERY_KEY } from './useStock'
import { PRODUCTS_QUERY_KEY } from './useProducts'

export const INVOICES_QUERY_KEY = ['invoices']

export function useInvoices(params = { limit: 20 }, options = {}) {
  return useQuery(
    [...INVOICES_QUERY_KEY, params],
    async () => {
      const result = assertSuccess(await listInvoicesService(params))
      return {
        items: result.data?.items ?? [],
        pagination: result.data?.pagination ?? null,
      }
    },
    options
  )
}

export function useInvoice(id) {
  return useQuery(
    [...INVOICES_QUERY_KEY, id],
    async () => {
      const result = assertSuccess(await getInvoiceService(id))
      return result.data?.invoice ?? null
    },
    {
      enabled: Boolean(id),
    }
  )
}

export function useInvoiceByNumber(invoiceNumber, options = {}) {
  const trimmed = invoiceNumber?.trim()
  return useQuery(
    [...INVOICES_QUERY_KEY, 'number', trimmed],
    async () => {
      const result = assertSuccess(
        await getInvoiceByNumberService(trimmed)
      )
      return result.data?.invoice ?? null
    },
    {
      retry: false,
      ...options,
      enabled: Boolean(trimmed) && (options.enabled ?? true),
    }
  )
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload) => assertSuccess(await createInvoiceService(payload)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(INVOICES_QUERY_KEY)
        queryClient.invalidateQueries(STOCK_QUERY_KEY)
        queryClient.invalidateQueries(STOCK_MOVEMENTS_QUERY_KEY)
        queryClient.invalidateQueries(PRODUCTS_QUERY_KEY)
      },
    }
  )
}

export function useReturnInvoice() {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ id, returnReason }) =>
      assertSuccess(await returnInvoiceService(id, { returnReason })),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(INVOICES_QUERY_KEY)
        queryClient.invalidateQueries(STOCK_QUERY_KEY)
        queryClient.invalidateQueries(STOCK_MOVEMENTS_QUERY_KEY)
        if (variables?.id) {
          queryClient.invalidateQueries([...INVOICES_QUERY_KEY, variables.id])
        }
      },
    }
  )
}
