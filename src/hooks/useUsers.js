import { useMutation, useQuery, useQueryClient } from 'react-query'
import { assertSuccess } from '../helpers/apiResponse'
import {
  createUserService,
  listUsersService,
  updateUserPasswordService,
} from '../services/auth.services'

export const USERS_QUERY_KEY = ['users']

export function useUsers() {
  return useQuery(USERS_QUERY_KEY, async () => {
    const result = assertSuccess(await listUsersService())
    return result.data?.users ?? []
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload) => assertSuccess(await createUserService(payload)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(USERS_QUERY_KEY)
      },
    }
  )
}

export function useUpdateUserPassword() {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ userId, password, confirmpassword }) =>
      assertSuccess(
        await updateUserPasswordService(userId, { password, confirmpassword })
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(USERS_QUERY_KEY)
      },
    }
  )
}
