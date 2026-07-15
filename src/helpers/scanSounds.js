const SETTINGS_KEY = 'suits.scanSounds.enabled'

/** Whether scan beeps are enabled (default: true). Can be toggled from Settings later. */
export function areScanSoundsEnabled() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw === null) return true
    return raw === 'true'
  } catch {
    return true
  }
}

export function setScanSoundsEnabled(enabled) {
  try {
    localStorage.setItem(SETTINGS_KEY, enabled ? 'true' : 'false')
  } catch {
    // ignore
  }
}

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  return audioCtx
}

/**
 * Call from a click/keydown handler so the browser allows audio.
 * Safe to call repeatedly.
 */
export async function unlockScanAudio() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return null
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    return ctx
  } catch {
    return null
  }
}

async function playTone({ frequency, durationMs, type = 'sine', volume = 0.18 }) {
  if (!areScanSoundsEnabled()) return

  try {
    const ctx = await unlockScanAudio()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    const now = ctx.currentTime
    const end = now + durationMs / 1000
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.start(now)
    oscillator.stop(end + 0.02)
  } catch {
    // Audio may be blocked; fail silently
  }
}

/** Short success beep after a valid scan. */
export function playScanSuccess() {
  return playTone({ frequency: 980, durationMs: 120, type: 'sine', volume: 0.22 })
}

/** Distinct error beep when product/code is not found. */
export function playScanError() {
  return playTone({ frequency: 180, durationMs: 220, type: 'square', volume: 0.16 })
}
