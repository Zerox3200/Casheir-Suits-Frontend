import { mockInvoices } from './invoicesMock'
import { mockLowStock, mockOutOfStock } from './stockMock'
import { mockProducts } from './productsMock'

export const ACTIVITY_ACTIONS = {
  CREATED_PRODUCT: 'إنشاء منتج',
  UPDATED_PRODUCT: 'تحديث منتج',
  CREATED_SUPPLIER: 'إنشاء مورد',
  UPDATED_SUPPLIER: 'تحديث مورد',
  CREATED_CATEGORY: 'إنشاء تصنيف',
  UPDATED_CATEGORY: 'تحديث تصنيف',
  ADJUSTED_STOCK: 'تعديل مخزون',
  CREATED_INVOICE: 'إنشاء فاتورة',
  RETURNED_INVOICE: 'إرجاع فاتورة',
  CREATED_USER: 'إنشاء مستخدم',
  UPDATED_SETTINGS: 'تحديث الإعدادات',
}

export const ACTIVITY_ENTITIES = {
  PRODUCT: 'منتج',
  SUPPLIER: 'مورد',
  CATEGORY: 'تصنيف',
  STOCK: 'مخزون',
  INVOICE: 'فاتورة',
  USER: 'مستخدم',
  SETTINGS: 'إعدادات',
}

const admin = {
  _id: '6a562c56a87075994d568c42',
  name: 'صاحب المحل',
  email: 'admin@suits.com',
  role: 'مسؤول',
}

const cashier = {
  _id: '6a562c56a87075994d568c41',
  name: 'أحمد الكاشير',
  email: 'cashier@suits.com',
  role: 'كاشير',
}

export const mockActivityLogs = [
  {
    _id: '6e1000000000000000000001',
    user: cashier,
    action: ACTIVITY_ACTIONS.CREATED_INVOICE,
    entity: ACTIVITY_ENTITIES.INVOICE,
    entityId: mockInvoices[0]._id,
    description: `تم إنشاء فاتورة ${mockInvoices[0].invoiceNumber}`,
    createdAt: '2026-07-14T14:10:00.000Z',
  },
  {
    _id: '6e1000000000000000000002',
    user: admin,
    action: ACTIVITY_ACTIONS.ADJUSTED_STOCK,
    entity: ACTIVITY_ENTITIES.STOCK,
    entityId: '6c1000000000000000000003',
    description: 'تم تعديل مخزون SHIRT-100 إلى 4 · سبب: تصحيح',
    createdAt: '2026-07-14T13:20:00.000Z',
  },
  {
    _id: '6e1000000000000000000003',
    user: admin,
    action: ACTIVITY_ACTIONS.RETURNED_INVOICE,
    entity: ACTIVITY_ENTITIES.INVOICE,
    entityId: mockInvoices[2]._id,
    description: `تم إرجاع فاتورة ${mockInvoices[2].invoiceNumber}`,
    createdAt: '2026-07-14T11:00:00.000Z',
  },
  {
    _id: '6e1000000000000000000004',
    user: admin,
    action: ACTIVITY_ACTIONS.UPDATED_PRODUCT,
    entity: ACTIVITY_ENTITIES.PRODUCT,
    entityId: mockProducts[0]._id,
    description: 'تم تحديث منتج Classic Navy Suit Updated',
    createdAt: '2026-07-14T13:06:55.000Z',
  },
  {
    _id: '6e1000000000000000000005',
    user: admin,
    action: ACTIVITY_ACTIONS.CREATED_CATEGORY,
    entity: ACTIVITY_ENTITIES.CATEGORY,
    entityId: '6a562e8873a605349002b44d',
    description: 'تم إنشاء تصنيف قمصان',
    createdAt: '2026-07-14T10:30:00.000Z',
  },
  {
    _id: '6e1000000000000000000006',
    user: cashier,
    action: ACTIVITY_ACTIONS.CREATED_INVOICE,
    entity: ACTIVITY_ENTITIES.INVOICE,
    entityId: mockInvoices[1]._id,
    description: `تم إنشاء فاتورة ${mockInvoices[1].invoiceNumber}`,
    createdAt: '2026-07-14T15:22:00.000Z',
  },
]

const completed = mockInvoices.filter((i) => i.status === 'مكتملة')
const todayAmount = completed.reduce((s, i) => s + i.total, 0)
const profit = completed.reduce(
  (sum, inv) =>
    sum +
    inv.items.reduce(
      (line, item) => line + (item.unitPrice - item.unitCost) * item.quantity,
      0
    ),
  0
)

/** Shape mirrors dashboard.service getDashboardStats */
export const mockDashboard = {
  todaySales: {
    amount: todayAmount,
    invoiceCount: completed.length,
  },
  monthlySales: {
    amount: todayAmount + 4200,
    invoiceCount: completed.length + 8,
  },
  totalRevenue: todayAmount + 12400,
  totalProfit: profit + 3100,
  totalProducts: mockProducts.filter((p) => p.isActive).length,
  totalInvoices: mockInvoices.length,
  recentInvoices: mockInvoices.slice(0, 5),
  outOfStock: {
    count: mockOutOfStock.length,
    products: mockOutOfStock,
  },
  lowStock: {
    count: mockLowStock.length,
    products: mockLowStock,
  },
}
