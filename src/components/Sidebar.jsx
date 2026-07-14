import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiBox,
  FiFileText,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiPackage,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi'
import { clearAuthCookies } from '../helpers/cookies'

const navLinks = [
  { to: '/products', label: 'إدارة المنتجات', icon: FiBox },
  { to: '/orders', label: 'إدارة الأوردرات', icon: FiShoppingBag },
  { to: '/invoices', label: 'إدارة الفواتير', icon: FiFileText },
  { to: '/stock', label: 'المخزن', icon: FiPackage },
  { to: '/users', label: 'إدارة المستخدمين', icon: FiUsers },
  { to: '/stats', label: 'إحصائيات السيستم والجرد', icon: FiBarChart2 },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-[#1e2a38] text-white'
        : 'text-[#3d4654] hover:bg-[#1e2a38]/8 hover:text-[#1e2a38]'
    }`

  const handleLogout = () => {
    clearAuthCookies()
    setOpen(false)
    navigate('/login')
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {navLinks.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={linkClass}
          onClick={() => setOpen(false)}
        >
          <Icon size={18} className="shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#1e2a38]/10 bg-white/90 px-4 backdrop-blur-sm lg:hidden">
        <p className="text-sm font-bold text-[#1e2a38]">محل البدل · Suits</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-[#1e2a38]/10 p-2 text-[#1e2a38] hover:bg-[#f7f5f2]"
          aria-label="فتح القائمة"
        >
          <FiMenu size={20} />
        </button>
      </div>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="إغلاق القائمة"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-64 flex-col border-l border-[#1e2a38]/10 bg-white transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[#1e2a38]/10 px-4 py-5">
          <div>
            <p className="text-xs font-semibold text-[#9e7e3a]">محل البدل</p>
            <h1 className="text-lg font-bold text-[#1e2a38]">Suits Shop</h1>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-[#5c6570] hover:bg-[#f7f5f2] lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <FiX size={18} />
          </button>
        </header>

        {nav}

        <footer className="shrink-0 space-y-3 border-t border-[#1e2a38]/10 p-4">
          <p className="text-xs text-[#8a939e]">لوحة تحكم صاحب المحل</p>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <FiLogOut size={16} />
            تسجيل الخروج
          </button>
        </footer>
      </aside>
    </>
  )
}
