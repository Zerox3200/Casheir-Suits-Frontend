import api from '../helpers/Api'
import { getApiError, unwrapResponse } from '../helpers/apiResponse'

const STOCK_PREFIX = '/stock'
const STOCK_MOVEMENTS_PREFIX = '/stock-movements'

export async function listStockService(params = {}) {
  try {
    const response = await api.get(STOCK_PREFIX, { params })
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function getLowStockService() {
  try {
    const response = await api.get(`${STOCK_PREFIX}/low`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function getStockByProductService(productId) {
  try {
    const response = await api.get(`${STOCK_PREFIX}/${productId}`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function adjustStockService(productId, payload) {
  try {
    const response = await api.patch(`${STOCK_PREFIX}/${productId}`, payload)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function listStockMovementsService(params = {}) {
  try {
    const response = await api.get(STOCK_MOVEMENTS_PREFIX, { params })
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}
