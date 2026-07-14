import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowRight, FiBox, FiEdit2 } from 'react-icons/fi'
import {
  getMockProductById,
  mockCategories,
  mockSuppliers,
} from './productsMock'
import AddProductDrawer from '../../components/products/AddProductDrawer'

const formatMoney = (value) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value ?? 0)

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function DetailItem({ label, children }) {
  return (
    <div className="rounded-xl border border-[#1e2a38]/8 bg-[#f7f5f2]/60 p-4">
      <p className="mb-1 text-xs font-medium text-[#8a939e]">{label}</p>
      <div className="text-sm font-semibold text-[#1e2a38]">{children}</div>
    </div>
  )
}

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = getMockProductById(id)
  const [editOpen, setEditOpen] = useState(false)

  if (!product) {
    return (
      <div className="rounded-2xl border border-[#1e2a38]/8 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-bold text-[#1e2a38]">المنتج غير موجود</p>
        <p className="mt-2 text-sm text-[#5c6570]">
          لم يتم العثور على منتج بهذا المعرّف
        </p>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#9e7e3a] hover:underline"
        >
          <FiArrowRight size={16} />
          العودة للمنتجات
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#5c6570] transition hover:text-[#1e2a38]"
          >
            <FiArrowRight size={16} />
            العودة للمنتجات
          </button>
          <h1 className="text-2xl font-bold text-[#1e2a38]">{product.name}</h1>
          <p className="mt-1 text-sm text-[#5c6570]">
            تفاصيل المنتج · {product.sku}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e2a38] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3a4d]"
        >
          <FiEdit2 size={16} />
          تعديل المنتج
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="flex flex-col items-center justify-center rounded-2xl border border-[#1e2a38]/8 bg-white p-6 shadow-sm">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-56 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-xl bg-[#f7f5f2] text-[#8a939e]">
              <FiBox size={40} />
              <span className="text-sm">لا توجد صورة</span>
            </div>
          )}
          <span
            className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              product.isActive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {product.isActive ? 'نشط' : 'موقوف'}
          </span>
        </section>

        <section className="rounded-2xl border border-[#1e2a38]/8 bg-white p-5 shadow-sm md:p-6">
          <h2 className="mb-4 text-sm font-bold text-[#1e2a38]">بيانات المنتج</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="اسم المنتج">{product.name}</DetailItem>
            <DetailItem label="SKU">
              <span className="font-mono text-xs">{product.sku}</span>
            </DetailItem>
            <DetailItem label="الباركود">
              {product.barcode || '—'}
            </DetailItem>
            <DetailItem label="التصنيف">
              {product.categoryId?.name || '—'}
            </DetailItem>
            <DetailItem label="المورد">
              {product.supplierId?.name || '—'}
            </DetailItem>
            <DetailItem label="هاتف المورد">
              {product.supplierId?.phone || '—'}
            </DetailItem>
            <DetailItem label="سعر التكلفة">
              {formatMoney(product.costPrice)} ج.م
            </DetailItem>
            <DetailItem label="سعر البيع">
              {formatMoney(product.sellingPrice)} ج.م
            </DetailItem>
            <DetailItem label="الحد الأدنى للمخزون">
              {product.minimumQuantity ?? '—'}
            </DetailItem>
            <DetailItem label="تاريخ الإنشاء">
              {formatDate(product.createdAt)}
            </DetailItem>
            <DetailItem label="آخر تحديث">
              {formatDate(product.updatedAt)}
            </DetailItem>
            <DetailItem label="الوصف">
              <span className="font-medium leading-relaxed">
                {product.description || '—'}
              </span>
            </DetailItem>
          </div>
        </section>
      </div>

      <AddProductDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        categories={mockCategories}
        suppliers={mockSuppliers}
        product={product}
      />
    </div>
  )
}
