import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiBox, FiTag, FiUsers, FiEdit2, FiEye } from 'react-icons/fi'
import {
  mockCategories,
  mockProducts,
  mockSuppliers,
} from './productsMock'
import AddProductDrawer from '../../components/products/AddProductDrawer'
import AddCategoryDrawer from '../../components/products/AddCategoryDrawer'
import AddSupplierDrawer from '../../components/products/AddSupplierDrawer'

const formatMoney = (value) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value)

export default function Products() {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [productOpen, setProductOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [supplierOpen, setSupplierOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === 'all') return mockProducts
    return mockProducts.filter((p) => p.categoryId?._id === selectedCategoryId)
  }, [selectedCategoryId])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e2a38]">إدارة المنتجات</h1>
          <p className="mt-1 text-sm text-[#5c6570]">
            تصنيفات على اليسار · جدول المنتجات على اليمين
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setProductOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1e2a38] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
          >
            <FiPlus size={16} />
            إضافة منتج
          </button>
          <button
            type="button"
            onClick={() => setCategoryOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1e2a38]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#1e2a38] transition hover:bg-[#f7f5f2]"
          >
            <FiTag size={16} />
            إضافة نوع منتج
          </button>
          <button
            type="button"
            onClick={() => setSupplierOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#9e7e3a]/40 bg-[#9e7e3a]/10 px-3.5 py-2.5 text-sm font-semibold text-[#7a6230] transition hover:bg-[#9e7e3a]/20"
          >
            <FiPlus size={16} />
            إضافة مورد
          </button>
        </div>
      </div>

      {/* In RTL grid: first column = right → products right, categories left */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
              <FiBox size={16} />
              المنتجات
            </h2>
            <span className="text-xs text-[#8a939e]">
              {filteredProducts.length} منتج
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="bg-[#f7f5f2] text-xs text-[#5c6570]">
                <tr>
                  <th className="px-4 py-3 font-semibold">المنتج</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">التصنيف</th>
                  <th className="px-4 py-3 font-semibold">المورد</th>
                  <th className="px-4 py-3 font-semibold">التكلفة</th>
                  <th className="px-4 py-3 font-semibold">البيع</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a38]/6">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="transition hover:bg-[#f7f5f2]/70">
                    <td className="px-4 py-3">
                      <Link
                        to={`/products/${product._id}`}
                        className="flex items-center gap-3 transition hover:opacity-80"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1e2a38]/5 text-[#1e2a38]">
                          <FiBox size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#1e2a38]">
                            {product.name}
                          </p>
                          <p className="truncate text-xs text-[#8a939e]">
                            {product.description}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#3d4654]">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 text-[#3d4654]">
                      {product.categoryId?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-[#3d4654]">
                      {product.supplierId?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-[#3d4654]">
                      {formatMoney(product.costPrice)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1e2a38]">
                      {formatMoney(product.sellingPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          product.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {product.isActive ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/products/${product._id}`}
                          className="rounded-lg p-2 text-[#5c6570] transition hover:bg-[#1e2a38]/5 hover:text-[#1e2a38]"
                          aria-label="عرض التفاصيل"
                          title="عرض التفاصيل"
                        >
                          <FiEye size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditProduct(product)}
                          className="rounded-lg p-2 text-[#9e7e3a] transition hover:bg-[#9e7e3a]/10"
                          aria-label="تعديل المنتج"
                          title="تعديل المنتج"
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1e2a38]">أنواع المنتجات</h2>
            <button
              type="button"
              onClick={() => setCategoryOpen(true)}
              className="rounded-md p-1.5 text-[#9e7e3a] hover:bg-[#9e7e3a]/10"
              aria-label="إضافة نوع منتج"
            >
              <FiPlus size={16} />
            </button>
          </div>

          <ul className="space-y-1.5">
            <li>
              <button
                type="button"
                onClick={() => setSelectedCategoryId('all')}
                className={`w-full rounded-lg px-3 py-2.5 text-right text-sm transition ${
                  selectedCategoryId === 'all'
                    ? 'bg-[#1e2a38] font-semibold text-white'
                    : 'text-[#3d4654] hover:bg-[#f7f5f2]'
                }`}
              >
                الكل ({mockProducts.length})
              </button>
            </li>
            {mockCategories.map((cat) => {
              const count = mockProducts.filter(
                (p) => p.categoryId?._id === cat._id
              ).length
              return (
                <li key={cat._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(cat._id)}
                    className={`w-full rounded-lg px-3 py-2.5 text-right transition ${
                      selectedCategoryId === cat._id
                        ? 'bg-[#1e2a38] text-white'
                        : 'hover:bg-[#f7f5f2]'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span
                        className={`text-[11px] ${
                          selectedCategoryId === cat._id
                            ? 'text-white/70'
                            : 'text-[#8a939e]'
                        }`}
                      >
                        {count}
                      </span>
                    </span>
                    {cat.description && (
                      <span
                        className={`mt-0.5 block truncate text-[11px] ${
                          selectedCategoryId === cat._id
                            ? 'text-white/60'
                            : 'text-[#8a939e]'
                        }`}
                      >
                        {cat.description}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1e2a38]/8 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#1e2a38]">
            <FiUsers size={16} />
            التجار والموردين
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8a939e]">
              {mockSuppliers.length} مورد
            </span>
            <button
              type="button"
              onClick={() => setSupplierOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#9e7e3a] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#b08f4a]"
            >
              <FiPlus size={14} />
              إضافة مورد
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="bg-[#f7f5f2] text-xs text-[#5c6570]">
              <tr>
                <th className="px-4 py-3 font-semibold">الاسم</th>
                <th className="px-4 py-3 font-semibold">الهاتف</th>
                <th className="px-4 py-3 font-semibold">العنوان</th>
                <th className="px-4 py-3 font-semibold">ملاحظات</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a38]/6">
              {mockSuppliers.map((s) => (
                <tr key={s._id} className="transition hover:bg-[#f7f5f2]/70">
                  <td className="px-4 py-3 font-medium text-[#1e2a38]">
                    {s.name}
                  </td>
                  <td className="px-4 py-3 text-[#3d4654]">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-[#3d4654]">
                    {s.address || '—'}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-[#8a939e]">
                    {s.notes || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        s.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {s.isActive ? 'نشط' : 'موقوف'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AddProductDrawer
        open={productOpen}
        onClose={() => setProductOpen(false)}
        categories={mockCategories}
        suppliers={mockSuppliers}
      />
      <AddProductDrawer
        open={Boolean(editProduct)}
        onClose={() => setEditProduct(null)}
        categories={mockCategories}
        suppliers={mockSuppliers}
        product={editProduct}
      />
      <AddCategoryDrawer
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
      />
      <AddSupplierDrawer
        open={supplierOpen}
        onClose={() => setSupplierOpen(false)}
      />
    </div>
  )
}
