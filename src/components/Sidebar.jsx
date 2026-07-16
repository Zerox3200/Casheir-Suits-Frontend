import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiBox,
  FiFileText,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiTrendingUp,
  FiPackage,
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings,
} from 'react-icons/fi'
import { clearAuthSession } from '../services/auth.services'
import { resolveMediaUrl } from '../helpers/Api'
import { getAuthUser } from '../helpers/cookies'
import { isAdmin } from '../helpers/roles'
import { DEFAULT_SETTINGS, useSettings } from '../hooks/useSettings'
import PwaInstallButton from './pwa/PwaInstallButton'

const navLinks = [
  { to: '/products', label: 'إدارة المنتجات', icon: FiBox },
  { to: '/orders', label: 'إدارة الأوردرات', icon: FiShoppingBag },
  { to: '/invoices', label: 'إدارة الفواتير', icon: FiFileText },
  { to: '/stock', label: 'المخزن', icon: FiPackage },
  { to: '/users', label: 'إدارة المستخدمين', icon: FiUsers, adminOnly: true },
  {
    to: '/profits',
    label: 'الأرباح اليومية',
    icon: FiTrendingUp,
    adminOnly: true,
  },
  {
    to: '/stats',
    label: 'إحصائيات السيستم والجرد',
    icon: FiBarChart2,
    adminOnly: true,
  },
  {
    to: '/settings',
    label: 'إعدادات المتجر',
    icon: FiSettings,
    adminOnly: true,
  },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: settings } = useSettings()
  const user = getAuthUser()
  const admin = isAdmin(user)

  const visibleLinks = navLinks.filter((link) => admin || !link.adminOnly)

  const storeName = settings?.storeName?.trim() || DEFAULT_SETTINGS.storeName
  const logoUrl = resolveMediaUrl(settings?.logo)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-[#1e2a38] text-white'
        : 'text-[#3d4654] hover:bg-[#1e2a38]/8 hover:text-[#1e2a38]'
    }`

  const handleLogout = () => {
    clearAuthSession()
    setOpen(false)
    navigate('/login', { replace: true })
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {visibleLinks.map(({ to, label, icon: Icon }) => (
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
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-[#1e2a38]/10 bg-white/90 px-3 backdrop-blur-sm lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-8 w-8 shrink-0 rounded object-contain"
            />
          ) : null}
          <p className="truncate text-sm font-bold text-[#1e2a38]">{storeName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <PwaInstallButton variant="icon" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-[#1e2a38]/10 p-2 text-[#1e2a38] hover:bg-[#f7f5f2]"
            aria-label="فتح القائمة"
          >
            <FiMenu size={20} />
          </button>
        </div>
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
          <div className="flex min-w-0 items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-[#1e2a38]/8 object-contain"
              />
            ) : null}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#9e7e3a]">المتجر</p>
              <h1 className="truncate text-lg font-bold text-[#1e2a38]">
                {storeName}
              </h1>
            </div>
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
          {(settings?.phone || settings?.address) && (
            <div className="space-y-0.5 text-[11px] leading-relaxed text-[#8a939e]">
              {settings.phone ? <p>{settings.phone}</p> : null}
              {settings.address ? <p className="line-clamp-2">{settings.address}</p> : null}
            </div>
          )}
          <p className="text-xs text-[#8a939e]">
            {admin ? 'لوحة تحكم المسؤول' : 'لوحة الكاشير'}
          </p>
          <PwaInstallButton variant="sidebar" />
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
