import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.scss'
import MainLayOut from './pages/MainLayOut'
import Login from './pages/Auth/Login'
import Products from './pages/Admin/Products'
import CreateProduct from './pages/Admin/CreateProduct'
import ProductDetails from './pages/Admin/ProductDetails'
import Invoices from './pages/Admin/Invoices'
import InvoiceDetails from './pages/Admin/InvoiceDetails'
import InvoiceReceipt from './pages/Admin/InvoiceReceipt'
import Orders from './pages/Admin/Orders'
import Stock from './pages/Admin/Stock'
import Users from './pages/Admin/Users'
import Stats from './pages/Admin/Stats'
import Profits from './pages/Admin/Profits'
import ProfitDayDetails from './pages/Admin/ProfitDayDetails'
import ActivityLog from './pages/Admin/ActivityLog'
import Settings from './pages/Admin/Settings'
import RequireAuth from './Protectors/RequireAuth'
import RequireAdmin from './Protectors/RequireAdmin'

function App() {
  const routes = createBrowserRouter([
    {
      path: '',
      element: <RequireAuth />,
      children: [
        {
          element: <MainLayOut />,
          children: [
            { path: 'products', element: <Products /> },
            { path: 'products/new', element: <CreateProduct /> },
            { path: 'products/:id', element: <ProductDetails /> },
            { path: 'orders', element: <Orders /> },
            { path: 'invoices', element: <Invoices /> },
            { path: 'invoices/:id', element: <InvoiceDetails /> },
            { path: 'stock', element: <Stock /> },
            {
              element: <RequireAdmin />,
              children: [
                { path: 'users', element: <Users /> },
                { path: 'stats', element: <Stats /> },
                { path: 'profits', element: <Profits /> },
                { path: 'profits/:date', element: <ProfitDayDetails /> },
                { path: 'activity-log', element: <ActivityLog /> },
                { path: 'settings', element: <Settings /> },
              ],
            },
          ],
        },
        // Isolated print surface — no sidebar / dashboard chrome
        {
          path: 'invoices/:id/receipt',
          element: <InvoiceReceipt />,
        },
      ],
    },
    {
      path: '/login',
      element: <Login />,
    },
  ])

  return <RouterProvider router={routes} />
}

export default App
