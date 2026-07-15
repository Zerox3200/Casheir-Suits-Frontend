import api from '../helpers/Api'
import { getApiError, unwrapResponse } from '../helpers/apiResponse'

const SETTINGS_PREFIX = '/settings'

export async function getSettingsService() {
  try {
    const response = await api.get(SETTINGS_PREFIX)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

/** Admin-only. Accepts plain object or FormData (logo file). */
export async function updateSettingsService(payload) {
  try {
    const body =
      payload instanceof FormData ? payload : buildSettingsFormData(payload)
    const response = await api.put(SETTINGS_PREFIX, body)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export function buildSettingsFormData(payload = {}) {
  const form = new FormData()
  const fields = [
    'storeName',
    'phone',
    'address',
    'currency',
    'defaultTax',
    'receiptFooter',
    'receiptWidth',
    'taxNumber',
    'companyRegNumber',
  ]
  fields.forEach((key) => {
    if (payload[key] === undefined || payload[key] === null) return
    form.append(key, String(payload[key]))
  })
  if (payload.logo instanceof File) {
    form.append('logo', payload.logo)
  }
  return form
}
