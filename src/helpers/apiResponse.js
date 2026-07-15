export function getApiError(error) {
  const status = error?.response?.status
  const message =
    error?.response?.data?.message ||
    error?.message ||
    'حدث خطأ. حاول مرة أخرى.'
  return { success: false, message, status, data: null }
}

export function unwrapResponse(response) {
  const body = response.data
  return {
    success: body?.success !== false,
    message: body?.message ?? 'تمت العملية بنجاح',
    data: body?.data ?? null,
  }
}

/** Throw when a service result is unsuccessful so React Query can track errors. */
export function assertSuccess(result) {
  if (!result?.success) {
    const error = new Error(result?.message || 'حدث خطأ. حاول مرة أخرى.')
    error.status = result?.status
    throw error
  }
  return result
}
