import api from '../helpers/Api'
import { getApiError, unwrapResponse } from '../helpers/apiResponse'

const SUPPLIERS_PREFIX = '/suppliers'

export async function listSuppliersService(params = {}) {
  try {
    const response = await api.get(SUPPLIERS_PREFIX, { params })
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function getSupplierService(id) {
  try {
    const response = await api.get(`${SUPPLIERS_PREFIX}/${id}`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function createSupplierService(payload) {
  try {
    const response = await api.post(SUPPLIERS_PREFIX, payload)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function updateSupplierService(id, payload) {
  try {
    const response = await api.put(`${SUPPLIERS_PREFIX}/${id}`, payload)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function deleteSupplierService(id) {
  try {
    const response = await api.delete(`${SUPPLIERS_PREFIX}/${id}`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function restoreSupplierService(id) {
  try {
    const response = await api.patch(`${SUPPLIERS_PREFIX}/${id}/restore`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}
