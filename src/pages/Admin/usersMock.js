export const ROLES = {
  ADMIN: 'مسؤول',
  CASHIER: 'كاشير',
}

/** Response shape mirrors ListUsers (password excluded) */
export const mockUsers = [
  {
    _id: '6a562c56a87075994d568c42',
    name: 'صاحب المحل',
    email: 'admin@suits.com',
    phone: '01000000001',
    role: ROLES.ADMIN,
    isFrozen: false,
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-14T10:00:00.000Z',
  },
  {
    _id: '6a562c56a87075994d568c41',
    name: 'أحمد الكاشير',
    email: 'cashier@suits.com',
    phone: '01098765432',
    role: ROLES.CASHIER,
    isFrozen: false,
    createdAt: '2026-07-05T12:00:00.000Z',
    updatedAt: '2026-07-14T09:00:00.000Z',
  },
  {
    _id: '6a562c56a87075994d568c43',
    name: 'سارة محمود',
    email: 'sara@suits.com',
    phone: '01122334455',
    role: ROLES.CASHIER,
    isFrozen: true,
    createdAt: '2026-07-10T08:30:00.000Z',
    updatedAt: '2026-07-13T16:00:00.000Z',
  },
]
