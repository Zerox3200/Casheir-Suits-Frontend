import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'

/**
 * Drawer slides in from the physical left; overlay covers the full viewport via portal.
 */
export default function LeftDrawer({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[1000] bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ top: 0, right: 0, bottom: 0, left: 0 }}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[1001] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
        }`}
        style={{ top: 0, bottom: 0, height: '100dvh' }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        dir="rtl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#1e2a38]/10 px-5 py-4">
          <h2 className="text-lg font-bold text-[#1e2a38]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#5c6570] transition hover:bg-[#f7f5f2]"
            aria-label="إغلاق"
          >
            <FiX size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </>,
    document.body
  )
}
