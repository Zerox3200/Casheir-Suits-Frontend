import api from '../helpers/Api'
import { getApiError, unwrapResponse } from '../helpers/apiResponse'

const PROFITS_PREFIX = '/profits'

/**
 * GET /profits?from=&to=
 * @param {{ from?: string, to?: string }} [params] ISO dates YYYY-MM-DD
 */
export async function getDailyProfitsService(params = {}) {
  try {
    const response = await api.get(PROFITS_PREFIX, { params })
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}
