import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PwaInstallButton from '../components/pwa/PwaInstallButton'
import { useSettings } from '../hooks/useSettings'

export default function MainLayOut() {
  // Prefetch store settings for sidebar, currency, POS tax, receipts, etc.
  useSettings()

  return (
    <div
      dir="rtl"
      lang="ar"
      className="flex h-dvh overflow-hidden bg-[#f7f5f2] print:hidden"
      style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
    >
      <Sidebar />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-14 lg:ms-64 lg:pt-0">
        <div className="hidden border-b border-[#1e2a38]/8 bg-white/70 px-4 py-2.5 lg:flex lg:items-center lg:justify-end print:hidden">
          <PwaInstallButton variant="button" />
        </div>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
