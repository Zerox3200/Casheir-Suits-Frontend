import { useCallback, useEffect, useState } from 'react'

/** @type {BeforeInstallPromptEvent | null} */
let deferredPromptGlobal = null
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn())
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPromptGlobal = event
    notify()
  })

  window.addEventListener('appinstalled', () => {
    deferredPromptGlobal = null
    notify()
  })
}

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIosSafari() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  const isIos = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
  return isIos && isSafari
}

/**
 * Hook for PWA install availability (Chrome/Edge prompt + iOS Safari hint).
 * @returns {'accepted' | 'dismissed' | 'ios' | 'manual' | 'unavailable'}
 */
export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(
    () => Boolean(deferredPromptGlobal)
  )
  const [installed, setInstalled] = useState(() => isStandaloneDisplay())
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    const sync = () => {
      setCanInstall(Boolean(deferredPromptGlobal))
      setInstalled(isStandaloneDisplay())
    }
    listeners.add(sync)
    sync()
    return () => listeners.delete(sync)
  }, [])

  const promptInstall = useCallback(async () => {
    if (deferredPromptGlobal) {
      deferredPromptGlobal.prompt()
      const choice = await deferredPromptGlobal.userChoice
      deferredPromptGlobal = null
      notify()
      return choice?.outcome === 'accepted' ? 'accepted' : 'dismissed'
    }

    if (isIosSafari() && !isStandaloneDisplay()) {
      setIosHint(true)
      return 'ios'
    }

    return 'manual'
  }, [])

  const dismissIosHint = useCallback(() => setIosHint(false), [])

  return {
    canInstall: canInstall && !installed,
    installed,
    isIos: isIosSafari(),
    /** Show install CTA whenever the app is not already installed */
    showInstall: !installed,
    iosHint,
    promptInstall,
    dismissIosHint,
  }
}
