import { useMutation, useQuery, useQueryClient } from 'react-query'
import { assertSuccess } from '../helpers/apiResponse'
import {
  createCategoryService,
  listCategoriesService,
} from '../services/categories.services'

export const CATEGORIES_QUERY_KEY = ['categories']

export function useCategories(params = { limit: 100 }) {
  return useQuery([...CATEGORIES_QUERY_KEY, params], async () => {
    const result = assertSuccess(await listCategoriesService(params))
    return {
      items: result.data?.items ?? [],
      pagination: result.data?.pagination ?? null,
    }
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload) => assertSuccess(await createCategoryService(payload)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CATEGORIES_QUERY_KEY)
      },
    }
  )
}
