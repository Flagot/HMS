import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import { HotelBrandProvider } from './hotel/HotelBrandContext'
import { NotificationProvider } from './notifications/NotificationContext'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import { HousekeepingPage } from './pages/HousekeepingPage'
import { KitchenPage } from './pages/KitchenPage'
import { LoginPage } from './pages/LoginPage'
import { ManagerPage } from './pages/ManagerPage'
import { ReceptionPage } from './pages/ReceptionPage'
import { StoreManagerPage } from './pages/StoreManagerPage'
import { WaiterPage } from './pages/WaiterPage'

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <HotelBrandProvider>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/housekeeping"
                element={
                  <ProtectedRoute roles={['housekeeping']}>
                    <HousekeepingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waiter"
                element={
                  <ProtectedRoute roles={['waiter']}>
                    <WaiterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute roles={['kitchen']}>
                    <KitchenPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reception"
                element={
                  <ProtectedRoute roles={['reception']}>
                    <ReceptionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager"
                element={
                  <ProtectedRoute roles={['manager']}>
                    <ManagerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/store"
                element={
                  <ProtectedRoute roles={['store']}>
                    <StoreManagerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </HotelBrandProvider>
      </NotificationProvider>
    </BrowserRouter>
  )
}

export default App
