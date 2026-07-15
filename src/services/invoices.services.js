import api from '../helpers/Api'
import { getApiError, unwrapResponse } from '../helpers/apiResponse'

const INVOICES_PREFIX = '/invoices'

export async function listInvoicesService(params = {}) {
  try {
    const response = await api.get(INVOICES_PREFIX, { params })
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function getInvoiceService(id) {
  try {
    const response = await api.get(`${INVOICES_PREFIX}/${id}`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function getInvoiceByNumberService(invoiceNumber) {
  try {
    const response = await api.get(
      `${INVOICES_PREFIX}/number/${encodeURIComponent(invoiceNumber)}`
    )
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function createInvoiceService(payload) {
  try {
    const response = await api.post(INVOICES_PREFIX, payload)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function returnInvoiceService(id, payload) {
  try {
    const response = await api.post(`${INVOICES_PREFIX}/${id}/return`, payload)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}
