import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { assertSuccess } from '../helpers/apiResponse'
import { formatCurrencyLabel, formatMoney } from '../helpers/money'
import {
  getSettingsService,
  updateSettingsService,
} from '../services/settings.services'
import { RECEIPT_WIDTH } from '../constants/receipt'

export const SETTINGS_QUERY_KEY = ['settings']

export const DEFAULT_SETTINGS = {
  storeName: 'محل البدل',
  logo: '',
  phone: '',
  address: '',
  currency: 'EGP',
  defaultTax: 0,
  receiptFooter: 'شكراً لتسوقكم معنا',
  receiptWidth: RECEIPT_WIDTH.MM_80,
  taxNumber: '',
  companyRegNumber: '',
}

function normalizeSettings(settings = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    receiptWidth:
      settings.receiptWidth === RECEIPT_WIDTH.MM_58 ||
      settings.receiptWidth === RECEIPT_WIDTH.MM_80
        ? settings.receiptWidth
        : DEFAULT_SETTINGS.receiptWidth,
  }
}

export function useSettings(options = {}) {
  return useQuery(
    SETTINGS_QUERY_KEY,
    async () => {
      const result = assertSuccess(await getSettingsService())
      return normalizeSettings(result.data?.settings ?? {})
    },
    {
      staleTime: 60_000,
      placeholderData: DEFAULT_SETTINGS,
      ...options,
    }
  )
}

/** Money formatter bound to current store currency from Settings. */
export function useFormatMoney() {
  const { data: settings } = useSettings()
  const currency = settings?.currency || DEFAULT_SETTINGS.currency
  const currencyLabel = useMemo(
    () => formatCurrencyLabel(currency),
    [currency]
  )

  const format = useCallback(
    (value) => formatMoney(value, currency),
    [currency]
  )

  return {
    settings,
    currency,
    currencyLabel,
    formatMoney: format,
  }
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload) => assertSuccess(await updateSettingsService(payload)),
    {
      onSuccess: (result) => {
        const settings = normalizeSettings(result.data?.settings ?? {})
        queryClient.setQueryData(SETTINGS_QUERY_KEY, settings)
        queryClient.invalidateQueries(SETTINGS_QUERY_KEY)
      },
    }
  )
}
