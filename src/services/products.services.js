import api from '../helpers/Api'
import { getApiError, unwrapResponse } from '../helpers/apiResponse'

const PRODUCTS_PREFIX = '/products'

/** Build multipart body for create/update (field name: `image`). */
export function buildProductFormData(payload = {}) {
  const formData = new FormData()
  const { image, ...fields } = payload

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (typeof value === 'boolean') {
      formData.append(key, value ? 'true' : 'false')
      return
    }
    formData.append(key, String(value))
  })

  if (image instanceof File) {
    formData.append('image', image)
  }

  return formData
}

export async function listProductsService(params = {}) {
  try {
    const response = await api.get(PRODUCTS_PREFIX, { params })
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function getProductService(id) {
  try {
    const response = await api.get(`${PRODUCTS_PREFIX}/${id}`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

/** Lookup product by barcode / QR / SKU / id */
export async function scanProductByCodeService(code, options = {}) {
  try {
    const response = await api.post(`${PRODUCTS_PREFIX}/scan`, {
      barcode: String(code || '').trim(),
      requireActive: options.requireActive === true,
    })
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function createProductService(payload) {
  try {
    const body =
      payload instanceof FormData ? payload : buildProductFormData(payload)
    const response = await api.post(PRODUCTS_PREFIX, body)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function updateProductService(id, payload) {
  try {
    const body =
      payload instanceof FormData ? payload : buildProductFormData(payload)
    const response = await api.put(`${PRODUCTS_PREFIX}/${id}`, body)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function updateProductStockService(id, payload) {
  try {
    const response = await api.patch(`${PRODUCTS_PREFIX}/${id}/stock`, payload)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function deactivateProductService(id) {
  try {
    const response = await api.patch(`${PRODUCTS_PREFIX}/${id}/deactivate`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function restoreProductService(id) {
  try {
    const response = await api.patch(`${PRODUCTS_PREFIX}/${id}/restore`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}
