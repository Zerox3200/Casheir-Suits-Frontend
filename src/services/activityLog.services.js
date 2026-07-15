import api from '../helpers/Api'
import { getApiError, unwrapResponse } from '../helpers/apiResponse'

export async function listActivityLogsService(params = {}) {
  try {
    const response = await api.get('/activity-logs', { params })
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}
