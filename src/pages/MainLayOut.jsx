import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function MainLayOut() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="flex h-dvh overflow-hidden bg-[#f7f5f2]"
      style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
    >
      <Sidebar />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-14 lg:ms-64 lg:pt-0">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
