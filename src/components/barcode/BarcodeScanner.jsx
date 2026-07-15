import React from 'react'
import { FiSearch } from 'react-icons/fi'
import { RiBarcodeLine } from 'react-icons/ri'
import { unlockScanAudio } from '../../helpers/scanSounds'
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'
import DevSimulateScan from './DevSimulateScan'

/**
 * Reusable USB barcode/QR scanner input (keyboard wedge only — no camera).
 *
 * Scanner types into the focused field then sends Enter or Tab.
 * In development, "Simulate Scan" appears to fake a reader without hardware.
 */
export default function BarcodeScanner({
  onScan,
  placeholder = 'امسح بجهاز القارئ ثم Enter...',
  autoFocus = true,
  disabled = false,
  className = '',
  showSubmitButton = true,
  inputClassName = '',
  /** When false, hides the DEV simulate control (default: true in DEV). */
  allowSimulate = true,
}) {
  const { value, busy, inputRef, runScan, handleKeyDown, handleChange } =
    useBarcodeScanner({
      onScan,
      disabled,
      clearOnScan: true,
      blurOnScan: false,
    })

  const handleSubmit = (e) => {
    e.preventDefault()
    unlockScanAudio()
    runScan(value)
  }

  const unlockOnGesture = () => {
    unlockScanAudio()
  }

  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      <form onSubmit={handleSubmit} className="relative flex gap-2">
        <div className="relative min-w-0 flex-1">
          <RiBarcodeLine
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9e7e3a]"
            size={16}
          />
          <input
            ref={inputRef}
            type="text"
            name="barcode-scanner"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            autoFocus={autoFocus}
            disabled={disabled || busy}
            value={value}
            onChange={handleChange}
            onKeyDown={(e) => {
              unlockOnGesture()
              handleKeyDown(e)
            }}
            onPointerDown={unlockOnGesture}
            onFocus={unlockOnGesture}
            placeholder={placeholder}
            aria-label={placeholder}
            className={
              inputClassName ||
              'w-full rounded-lg border border-[#9e7e3a]/35 bg-[#9e7e3a]/5 py-2 pr-9 pl-3 text-sm text-[#1e2a38] outline-none transition placeholder:text-[#a0a8b0] focus:border-[#9e7e3a] focus:ring-1 focus:ring-[#9e7e3a]/30 disabled:opacity-60'
            }
          />
        </div>
        {showSubmitButton && (
          <button
            type="submit"
            disabled={disabled || busy || !value.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#9e7e3a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#b08f4a] disabled:cursor-not-allowed disabled:opacity-40"
            title="تأكيد المسح"
          >
            <FiSearch size={14} />
            {busy ? '...' : 'مسح'}
          </button>
        )}
      </form>
      {allowSimulate && (
        <DevSimulateScan
          disabled={disabled || busy}
          onSimulate={(code) => runScan(code)}
        />
      )}
    </div>
  )
}
