import { useQuery } from 'react-query'
import { assertSuccess } from '../helpers/apiResponse'
import { listActivityLogsService } from '../services/activityLog.services'

export const ACTIVITY_LOGS_QUERY_KEY = ['activity-logs']

export function useActivityLogs(params = { limit: 50 }) {
  return useQuery([...ACTIVITY_LOGS_QUERY_KEY, params], async () => {
    const result = assertSuccess(await listActivityLogsService(params))
    return {
      items: result.data?.items ?? [],
      pagination: result.data?.pagination ?? null,
    }
  })
}
