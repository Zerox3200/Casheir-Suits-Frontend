import { useMutation, useQuery, useQueryClient } from 'react-query'
import { assertSuccess } from '../helpers/apiResponse'
import {
  createProductService,
  getProductService,
  listProductsService,
  scanProductByCodeService,
  updateProductService,
} from '../services/products.services'

export const PRODUCTS_QUERY_KEY = ['products']

export function useProducts(params = { limit: 100 }) {
  return useQuery([...PRODUCTS_QUERY_KEY, params], async () => {
    const result = assertSuccess(await listProductsService(params))
    return {
      items: result.data?.items ?? [],
      pagination: result.data?.pagination ?? null,
    }
  })
}

export function useProduct(id) {
  return useQuery(
    [...PRODUCTS_QUERY_KEY, id],
    async () => {
      const result = assertSuccess(await getProductService(id))
      return {
        product: result.data?.product ?? null,
        stock: result.data?.stock ?? null,
      }
    },
    {
      enabled: Boolean(id),
    }
  )
}

/** Scan barcode / QR → { product, stock } */
export function useScanProduct() {
  return useMutation(async ({ code, requireActive = false }) => {
    const result = assertSuccess(
      await scanProductByCodeService(code, { requireActive })
    )
    return {
      product: result.data?.product ?? null,
      stock: result.data?.stock ?? null,
      message: result.message,
    }
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload) => assertSuccess(await createProductService(payload)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(PRODUCTS_QUERY_KEY)
      },
    }
  )
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ id, payload }) =>
      assertSuccess(await updateProductService(id, payload)),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(PRODUCTS_QUERY_KEY)
        if (variables?.id) {
          queryClient.invalidateQueries([...PRODUCTS_QUERY_KEY, variables.id])
        }
      },
    }
  )
}
