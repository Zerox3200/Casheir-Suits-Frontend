import { useMutation, useQuery, useQueryClient } from 'react-query'
import { assertSuccess } from '../helpers/apiResponse'
import {
  createSupplierService,
  listSuppliersService,
} from '../services/suppliers.services'

export const SUPPLIERS_QUERY_KEY = ['suppliers']

export function useSuppliers(params = { limit: 100 }) {
  return useQuery([...SUPPLIERS_QUERY_KEY, params], async () => {
    const result = assertSuccess(await listSuppliersService(params))
    return {
      items: result.data?.items ?? [],
      pagination: result.data?.pagination ?? null,
    }
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload) => assertSuccess(await createSupplierService(payload)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(SUPPLIERS_QUERY_KEY)
      },
    }
  )
}
