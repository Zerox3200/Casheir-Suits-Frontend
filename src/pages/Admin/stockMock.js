import { mockProducts } from './productsMock'

export const STOCK_MOVEMENT_TYPE = {
  IN: 'دخول',
  OUT: 'خروج',
}

export const STOCK_ADJUST_REASON = {
  PURCHASE: 'شراء',
  DAMAGED: 'تالف',
  LOST: 'مفقود',
  MANUAL: 'يدوي',
  CORRECTION: 'تصحيح',
  RETURN: 'إرجاع',
}

export const STOCK_MOVEMENT_REASON = {
  PURCHASE: 'شراء',
  INVOICE: 'فاتورة',
  RETURN: 'إرجاع',
  MANUAL: 'يدوي',
  DAMAGED: 'تالف',
  LOST: 'مفقود',
  CORRECTION: 'تصحيح',
}

export const STOCK_REFERENCE_TYPE = {
  INVOICE: 'فاتورة',
  MANUAL: 'يدوي',
  PURCHASE: 'شراء',
  ADJUSTMENT: 'تعديل',
}

const user = {
  _id: '6a562c56a87075994d568c42',
  name: 'صاحب المحل',
  email: 'admin@suits.com',
}

export const mockStock = mockProducts.map((p, i) => {
  const qty = [0, 18, 4, 12][i] ?? 10
  return {
    _id: `6c100000000000000000000${i + 1}`,
    productId: p,
    quantity: qty,
    minimumQuantity: p.minimumQuantity ?? 5,
    lastUpdated: '2026-07-14T16:00:00.000Z',
    createdAt: '2026-07-14T10:00:00.000Z',
    updatedAt: '2026-07-14T16:00:00.000Z',
  }
})

export const mockStockMovements = [
  {
    _id: '6d1000000000000000000001',
    productId: { _id: mockProducts[1]._id, name: mockProducts[1].name, sku: mockProducts[1].sku },
    quantity: 1,
    type: STOCK_MOVEMENT_TYPE.OUT,
    reason: STOCK_MOVEMENT_REASON.INVOICE,
    referenceId: '6b1000000000000000000001',
    referenceType: STOCK_REFERENCE_TYPE.INVOICE,
    createdBy: user,
    createdAt: '2026-07-14T14:10:00.000Z',
  },
  {
    _id: '6d1000000000000000000002',
    productId: { _id: mockProducts[2]._id, name: mockProducts[2].name, sku: mockProducts[2].sku },
    quantity: 20,
    type: STOCK_MOVEMENT_TYPE.IN,
    reason: STOCK_MOVEMENT_REASON.PURCHASE,
    referenceId: null,
    referenceType: STOCK_REFERENCE_TYPE.PURCHASE,
    createdBy: user,
    createdAt: '2026-07-14T12:00:00.000Z',
  },
  {
    _id: '6d1000000000000000000003',
    productId: { _id: mockProducts[3]._id, name: mockProducts[3].name, sku: mockProducts[3].sku },
    quantity: 2,
    type: STOCK_MOVEMENT_TYPE.OUT,
    reason: STOCK_MOVEMENT_REASON.DAMAGED,
    referenceId: null,
    referenceType: STOCK_REFERENCE_TYPE.ADJUSTMENT,
    createdBy: user,
    createdAt: '2026-07-14T13:15:00.000Z',
  },
  {
    _id: '6d1000000000000000000004',
    productId: { _id: mockProducts[1]._id, name: mockProducts[1].name, sku: mockProducts[1].sku },
    quantity: 5,
    type: STOCK_MOVEMENT_TYPE.IN,
    reason: STOCK_MOVEMENT_REASON.RETURN,
    referenceId: '6b1000000000000000000003',
    referenceType: STOCK_REFERENCE_TYPE.INVOICE,
    createdBy: user,
    createdAt: '2026-07-14T11:00:00.000Z',
  },
  {
    _id: '6d1000000000000000000005',
    productId: { _id: mockProducts[0]._id, name: mockProducts[0].name, sku: mockProducts[0].sku },
    quantity: 3,
    type: STOCK_MOVEMENT_TYPE.OUT,
    reason: STOCK_MOVEMENT_REASON.MANUAL,
    referenceId: null,
    referenceType: STOCK_REFERENCE_TYPE.MANUAL,
    createdBy: user,
    createdAt: '2026-07-13T17:40:00.000Z',
  },
]

export const mockLowStock = mockStock.filter(
  (s) => s.quantity > 0 && s.quantity <= s.minimumQuantity
)

export const mockOutOfStock = mockStock.filter((s) => s.quantity === 0)
