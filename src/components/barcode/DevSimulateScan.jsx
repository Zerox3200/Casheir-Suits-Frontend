import React from 'react'
import { FiCpu } from 'react-icons/fi'
import { unlockScanAudio } from '../../helpers/scanSounds'

/** Default sample code used when the prompt is cancelled with empty leave-as-is. */
export const DEV_SAMPLE_BARCODE = '6223001000001'

/**
 * Development-only control to fake a USB barcode scanner.
 * Never rendered when `import.meta.env.DEV` is false (production builds).
 */
export default function DevSimulateScan({
  onSimulate,
  disabled = false,
  className = '',
  label = 'Simulate Scan',
  defaultCode = DEV_SAMPLE_BARCODE,
}) {
  if (!import.meta.env.DEV) return null

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return

    // Unlock audio during the user gesture (before prompt) so beeps can play later.
    await unlockScanAudio()

    const entered = window.prompt(
      'Simulate barcode / QR scan (dev only):',
      defaultCode
    )
    if (entered == null) return
    const code = String(entered).trim()
    if (!code) return
    onSimulate(code)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title="Development only — simulate USB barcode reader"
      className={
        className ||
        'inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-500/60 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40'
      }
    >
      <FiCpu size={12} />
      {label}
    </button>
  )
}
