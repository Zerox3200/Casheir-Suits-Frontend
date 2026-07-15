import api from '../helpers/Api'
import { getApiError, unwrapResponse } from '../helpers/apiResponse'

const CATEGORIES_PREFIX = '/categories'

export async function listCategoriesService(params = {}) {
  try {
    const response = await api.get(CATEGORIES_PREFIX, { params })
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function getCategoryService(id) {
  try {
    const response = await api.get(`${CATEGORIES_PREFIX}/${id}`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function createCategoryService(payload) {
  try {
    const response = await api.post(CATEGORIES_PREFIX, payload)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function updateCategoryService(id, payload) {
  try {
    const response = await api.put(`${CATEGORIES_PREFIX}/${id}`, payload)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function deleteCategoryService(id) {
  try {
    const response = await api.delete(`${CATEGORIES_PREFIX}/${id}`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}

export async function restoreCategoryService(id) {
  try {
    const response = await api.patch(`${CATEGORIES_PREFIX}/${id}/restore`)
    return unwrapResponse(response)
  } catch (error) {
    return getApiError(error)
  }
}
