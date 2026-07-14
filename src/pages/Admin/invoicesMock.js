import { mockProducts } from './productsMock'

export const INVOICE_STATUS = {
  COMPLETED: 'مكتملة',
  RETURNED: 'مرتجعة',
}

export const PAYMENT_METHODS = {
  CASH: 'نقدي',
  VISA: 'فيزا',
}

const cashier = {
  _id: '6a562c56a87075994d568c41',
  name: 'أحمد الكاشير',
  email: 'cashier@suits.com',
  role: 'كاشير',
}

const admin = {
  _id: '6a562c56a87075994d568c42',
  name: 'صاحب المحل',
  email: 'admin@suits.com',
  role: 'مسؤول',
}

const p1 = mockProducts[1]
const p2 = mockProducts[0]

export const mockInvoices = [
  {
    _id: '6b1000000000000000000001',
    invoiceNumber: 'INV-20260714-001',
    customerName: 'محمد علي',
    customerPhone: '01098765432',
    items: [
      {
        productId: p1._id,
        sku: p1.sku,
        barcode: p1.barcode || '',
        name: p1.name,
        quantity: 1,
        unitPrice: p1.sellingPrice,
        unitCost: p1.costPrice,
        lineTotal: p1.sellingPrice * 1,
      },
      {
        productId: p2._id,
        sku: p2.sku,
        barcode: p2.barcode || '',
        name: p2.name,
        quantity: 2,
        unitPrice: p2.sellingPrice,
        unitCost: p2.costPrice,
        lineTotal: p2.sellingPrice * 2,
      },
    ],
    subTotal: p1.sellingPrice + p2.sellingPrice * 2,
    discount: 100,
    tax: 0,
    total: p1.sellingPrice + p2.sellingPrice * 2 - 100,
    paymentMethod: PAYMENT_METHODS.CASH,
    notes: 'عميل دائم',
    status: INVOICE_STATUS.COMPLETED,
    createdBy: cashier,
    returnedAt: null,
    returnedBy: null,
    returnReason: null,
    createdAt: '2026-07-14T14:10:00.000Z',
    updatedAt: '2026-07-14T14:10:00.000Z',
  },
  {
    _id: '6b1000000000000000000002',
    invoiceNumber: 'INV-20260714-002',
    customerName: '',
    customerPhone: '',
    items: [
      {
        productId: p1._id,
        sku: p1.sku,
        barcode: p1.barcode || '',
        name: p1.name,
        quantity: 1,
        unitPrice: p1.sellingPrice,
        unitCost: p1.costPrice,
        lineTotal: p1.sellingPrice,
      },
    ],
    subTotal: p1.sellingPrice,
    discount: 0,
    tax: 75,
    total: p1.sellingPrice + 75,
    paymentMethod: PAYMENT_METHODS.VISA,
    notes: '',
    status: INVOICE_STATUS.COMPLETED,
    createdBy: cashier,
    returnedAt: null,
    returnedBy: null,
    returnReason: null,
    createdAt: '2026-07-14T15:22:00.000Z',
    updatedAt: '2026-07-14T15:22:00.000Z',
  },
  {
    _id: '6b1000000000000000000003',
    invoiceNumber: 'INV-20260713-008',
    customerName: 'سارة محمود',
    customerPhone: '01122334455',
    items: [
      {
        productId: p2._id,
        sku: p2.sku,
        barcode: p2.barcode || '',
        name: p2.name,
        quantity: 1,
        unitPrice: p2.sellingPrice,
        unitCost: p2.costPrice,
        lineTotal: p2.sellingPrice,
      },
    ],
    subTotal: p2.sellingPrice,
    discount: 0,
    tax: 0,
    total: p2.sellingPrice,
    paymentMethod: PAYMENT_METHODS.CASH,
    notes: 'تم الإرجاع بعد يوم',
    status: INVOICE_STATUS.RETURNED,
    createdBy: cashier,
    returnedAt: '2026-07-14T11:00:00.000Z',
    returnedBy: admin,
    returnReason: 'المقاس غير مناسب',
    createdAt: '2026-07-13T18:40:00.000Z',
    updatedAt: '2026-07-14T11:00:00.000Z',
  },
]

export const getMockInvoiceById = (id) =>
  mockInvoices.find((inv) => inv._id === id) || null
