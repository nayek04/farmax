import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './ui/Layout.jsx'
import { HomePage } from './views/HomePage.jsx'
import { ProductsPage } from './views/ProductsPage.jsx'
import { ProductDetailsPage } from './views/ProductDetailsPage.jsx'
import { CartPage } from './views/CartPage.jsx'
import { CheckoutPage } from './views/CheckoutPage.jsx'
import { LoginPage } from './views/LoginPage.jsx'
import { SignupPage } from './views/SignupPage.jsx'
import { FarmerDashboard } from './views/FarmerDashboard.jsx'
import { CustomerDashboard } from './views/CustomerDashboard.jsx'
import { OrderHistory } from './views/OrderHistory.jsx'
import { RequireAuth } from './ui/RequireAuth.jsx'
import { useAuth } from './state/auth.jsx'
import { dashboardPathForRole } from './lib/dashboard.js'

function RoleDashboardRedirect() {
  const { user } = useAuth()
  return <Navigate to={dashboardPathForRole(user?.role)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth roles={['customer']}>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/farmer-dashboard"
          element={
            <RequireAuth roles={['farmer', 'admin']}>
              <FarmerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/customer-dashboard"
          element={
            <RequireAuth roles={['customer']}>
              <CustomerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth roles={['customer']}>
              <OrderHistory />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth roles={['customer', 'farmer', 'admin']}>
              <RoleDashboardRedirect />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
