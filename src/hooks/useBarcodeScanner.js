import { useCallback, useRef, useState } from 'react'

/**
 * Shared keyboard-wedge barcode/QR scanner logic (USB readers only).
 * Enter or Tab suffixes trigger onScan after trim; empty values are ignored.
 */
export function useBarcodeScanner({
  onScan,
  disabled = false,
  clearOnScan = true,
  blurOnScan = false,
} = {}) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)
  const onScanRef = useRef(onScan)

  onScanRef.current = onScan

  const focusInput = useCallback(() => {
    // Defer so clear/disabled updates apply first
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  const runScan = useCallback(
    async (raw) => {
      const code = String(raw ?? '').trim()
      if (!code || busy || disabled) return

      setBusy(true)
      try {
        await onScanRef.current?.(code)
      } finally {
        if (clearOnScan) setValue('')
        if (blurOnScan) {
          inputRef.current?.blur()
        } else {
          focusInput()
        }
        setBusy(false)
      }
    },
    [busy, disabled, clearOnScan, blurOnScan, focusInput]
  )

  const handleKeyDown = useCallback(
    (e) => {
      if (disabled || busy) return
      if (e.key !== 'Enter' && e.key !== 'Tab') return

      e.preventDefault()
      e.stopPropagation()

      // Prefer live input value (covers controlled + uncontrolled timing)
      const raw = e.currentTarget?.value ?? value
      runScan(raw)
    },
    [disabled, busy, value, runScan]
  )

  const handleChange = useCallback((e) => {
    setValue(e.target.value)
  }, [])

  return {
    value,
    setValue,
    busy,
    inputRef,
    focusInput,
    runScan,
    handleKeyDown,
    handleChange,
  }
}

/**
 * Key handler for Formik (or plain) barcode fields inside larger forms.
 * Enter/Tab prevent form submit; keep the scanned value; optionally blur.
 */
export function handleBarcodeFieldKeyDown(e, { blur = true } = {}) {
  if (e.key !== 'Enter' && e.key !== 'Tab') return
  e.preventDefault()
  e.stopPropagation()
  if (blur) {
    e.currentTarget?.blur()
  }
}
