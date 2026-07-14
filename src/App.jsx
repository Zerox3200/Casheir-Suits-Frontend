import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.scss'
import MainLayOut from './pages/MainLayOut'
import Home from './pages/user/Home/Home'
import Login from './pages/Auth/Login'
import Products from './pages/Admin/Products'
import ProductDetails from './pages/Admin/ProductDetails'
import Invoices from './pages/Admin/Invoices'
import InvoiceDetails from './pages/Admin/InvoiceDetails'
import Orders from './pages/Admin/Orders'
import Stock from './pages/Admin/Stock'
import Users from './pages/Admin/Users'
import Stats from './pages/Admin/Stats'

function App() {
  const routes = createBrowserRouter([
    {
      path: '',
      element: <MainLayOut />,
      children: [
        { index: true, element: <Home /> },
        { path: 'products', element: <Products /> },
        { path: 'products/:id', element: <ProductDetails /> },
        { path: 'orders', element: <Orders /> },
        { path: 'invoices', element: <Invoices /> },
        { path: 'invoices/:id', element: <InvoiceDetails /> },
        { path: 'stock', element: <Stock /> },
        { path: 'users', element: <Users /> },
        { path: 'stats', element: <Stats /> },
      ],
    },
    {
      path: '/login',
      element: <Login />,
    },
  ])

  return (
    <>
      <RouterProvider router={routes} />
    </>
  )
}

export default App
