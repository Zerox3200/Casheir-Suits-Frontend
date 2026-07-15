import React, { useEffect } from 'react'
import LeftDrawer from './LeftDrawer'
import ProductForm from './ProductForm'

export default function AddProductDrawer({
  open,
  onClose,
  categories = [],
  suppliers = [],
  product = null,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!product?._id) return null

  return (
    <LeftDrawer open={open} onClose={onClose} title="تعديل منتج">
      {open && (
        <ProductForm
          mode="edit"
          product={product}
          categories={categories}
          suppliers={suppliers}
          onSuccess={() => onClose()}
        />
      )}
    </LeftDrawer>
  )
}
