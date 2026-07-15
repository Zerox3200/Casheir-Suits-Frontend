import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiBox } from 'react-icons/fi'
import { useCategories } from '../../hooks/useCategories'
import { useSuppliers } from '../../hooks/useSuppliers'
import ProductForm from '../../components/products/ProductForm'

export default function CreateProduct() {
  const navigate = useNavigate()
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    limit: 100,
  })
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({
    limit: 100,
  })

  const categories = categoriesData?.items ?? []
  const suppliers = suppliersData?.items ?? []
  const loadingLists = categoriesLoading || suppliersLoading

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/products"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#5c6570] transition hover:text-[#1e2a38]"
        >
          <FiArrowRight size={16} />
          العودة للمنتجات
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1e2a38]">
          <FiBox size={24} />
          إضافة منتج جديد
        </h1>
        <p className="mt-1 text-sm text-[#5c6570]">
          أدخل بيانات المنتج · امسح الباركود/QR بجهاز القارئ على حقل الباركود
        </p>
      </div>

      <section className="rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm sm:p-6">
        {loadingLists ? (
          <p className="py-10 text-center text-sm text-[#5c6570]">
            جاري تحميل التصنيفات والموردين...
          </p>
        ) : (
          <ProductForm
            mode="create"
            categories={categories}
            suppliers={suppliers}
            onSuccess={(result) => {
              const id = result?.data?.product?._id
              if (id) navigate(`/products/${id}`)
              else navigate('/products')
            }}
          />
        )}
      </section>
    </div>
  )
}
