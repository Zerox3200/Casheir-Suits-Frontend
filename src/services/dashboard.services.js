import api from '../helpers/Api'
import { getApiError, unwrapResponse } from '../helpers/apiResponse'

export async function getDashboardService() {
  try {
    const response = await api.get('/dashboard')
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}
