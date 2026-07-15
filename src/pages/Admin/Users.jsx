import React, { useMemo, useState } from 'react'
import { FiPlus, FiUsers, FiFilter, FiUser, FiKey } from 'react-icons/fi'
import { ROLES } from '../../constants/roles'
import { useUsers } from '../../hooks/useUsers'
import AddUserDrawer from '../../components/users/AddUserDrawer'
import UpdatePasswordDrawer from '../../components/users/UpdatePasswordDrawer'
import ScrollableTable, { stickyTheadClass } from '../../components/ScrollableTable'

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function Users() {
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [passwordUser, setPasswordUser] = useState(null)

  const { data: users = [], isLoading, isError, error, refetch } = useUsers()

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (statusFilter === 'active' && u.isFrozen) return false
      if (statusFilter === 'frozen' && !u.isFrozen) return false
      return true
    })
  }, [users, roleFilter, statusFilter])

  const counts = useMemo(() => {
    const admins = users.filter((u) => u.role === ROLES.ADMIN).length
    const cashiers = users.filter((u) => u.role === ROLES.CASHIER).length
    const frozen = users.filter((u) => u.isFrozen).length
    const active = users.filter((u) => !u.isFrozen).length
    return {
      all: users.length,
      admins,
      cashiers,
      frozen,
      active,
    }
  }, [users])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e2a38]">إدارة المستخدمين</h1>
          <p className="mt-1 text-sm text-[#5c6570]">
            إنشاء حسابات · المسؤول والكاشير · حالة التجميد
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e2a38] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
        >
          <FiPlus size={16} />
          إضافة مستخدم
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8a939e]">إجمالي المستخدمين</p>
          <p className="mt-1 text-2xl font-bold text-[#1e2a38]">{counts.all}</p>
        </div>
        <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8a939e]">كاشير</p>
          <p className="mt-1 text-2xl font-bold text-[#1e2a38]">
            {counts.cashiers}
          </p>
        </div>
        <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8a939e]">مجمّد</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{counts.frozen}</p>
        </div>
      </div>

      {/* RTL: table right, filters left */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
              <FiUsers size={16} />
              المستخدمون
            </h2>
            <span className="text-xs text-[#8a939e]">
              {filtered.length} مستخدم
            </span>
          </div>

          {isLoading ? (
            <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
              جاري تحميل المستخدمين...
            </div>
          ) : isError ? (
            <div className="space-y-3 px-4 py-12 text-center">
              <p className="text-sm text-red-600" role="alert">
                {error?.message || 'تعذر تحميل المستخدمين'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg bg-[#1e2a38] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-[#5c6570]">
              لا يوجد مستخدمون مطابقون للفلتر
            </div>
          ) : (
            <ScrollableTable>
              <table className="w-full min-w-[720px] text-right text-sm">
                <thead className={stickyTheadClass}>
                  <tr>
                    <th className="px-4 py-3 font-semibold">الاسم</th>
                    <th className="px-4 py-3 font-semibold">البريد</th>
                    <th className="px-4 py-3 font-semibold">الهاتف</th>
                    <th className="px-4 py-3 font-semibold">الدور</th>
                    <th className="px-4 py-3 font-semibold">الحالة</th>
                    <th className="px-4 py-3 font-semibold">تاريخ الإنشاء</th>
                    <th className="px-4 py-3 font-semibold">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2a38]/6">
                  {filtered.map((user) => (
                    <tr key={user._id} className="transition hover:bg-[#f7f5f2]/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1e2a38]/5 text-[#1e2a38]">
                            <FiUser size={16} />
                          </div>
                          <p className="font-medium text-[#1e2a38]">{user.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#3d4654]">{user.email}</td>
                      <td className="px-4 py-3 text-[#3d4654]">{user.phone}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            user.role === ROLES.ADMIN
                              ? 'bg-[#9e7e3a]/15 text-[#7a6230]'
                              : 'bg-sky-50 text-sky-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            user.isFrozen
                              ? 'bg-red-50 text-red-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {user.isFrozen ? 'مجمّد' : 'نشط'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#5c6570]">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setPasswordUser(user)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2a38]/10 px-2.5 py-1.5 text-xs font-semibold text-[#1e2a38] transition hover:bg-[#f7f5f2]"
                          title="تحديث كلمة المرور"
                        >
                          <FiKey size={14} />
                          كلمة المرور
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableTable>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
              <FiFilter size={14} />
              الدور
            </h2>
            <ul className="space-y-1.5">
              {[
                { key: 'all', label: 'الكل', count: counts.all },
                {
                  key: ROLES.ADMIN,
                  label: ROLES.ADMIN,
                  count: counts.admins,
                },
                {
                  key: ROLES.CASHIER,
                  label: ROLES.CASHIER,
                  count: counts.cashiers,
                },
              ].map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => setRoleFilter(item.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                      roleFilter === item.key
                        ? 'bg-[#1e2a38] font-semibold text-white'
                        : 'text-[#3d4654] hover:bg-[#f7f5f2]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={
                        roleFilter === item.key
                          ? 'text-white/70'
                          : 'text-[#8a939e]'
                      }
                    >
                      {item.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#1e2a38]">الحالة</h2>
            <ul className="space-y-1.5">
              {[
                { key: 'all', label: 'الكل', count: counts.all },
                { key: 'active', label: 'نشط', count: counts.active },
                { key: 'frozen', label: 'مجمّد', count: counts.frozen },
              ].map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => setStatusFilter(item.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                      statusFilter === item.key
                        ? 'bg-[#1e2a38] font-semibold text-white'
                        : 'text-[#3d4654] hover:bg-[#f7f5f2]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={
                        statusFilter === item.key
                          ? 'text-white/70'
                          : 'text-[#8a939e]'
                      }
                    >
                      {item.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <AddUserDrawer open={createOpen} onClose={() => setCreateOpen(false)} />
      <UpdatePasswordDrawer
        open={Boolean(passwordUser)}
        onClose={() => setPasswordUser(null)}
        user={passwordUser}
      />
    </div>
  )
}
