import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { NotificationProvider } from './notifications/NotificationContext'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import { HousekeepingPage } from './pages/HousekeepingPage'
import { KitchenPage } from './pages/KitchenPage'
import { ManagerPage } from './pages/ManagerPage'
import { ReceptionPage } from './pages/ReceptionPage'
import { StoreManagerPage } from './pages/StoreManagerPage'
import { WaiterPage } from './pages/WaiterPage'

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/housekeeping" element={<HousekeepingPage />} />
            <Route path="/waiter" element={<WaiterPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="/reception" element={<ReceptionPage />} />
            <Route path="/manager" element={<ManagerPage />} />
            <Route path="/store" element={<StoreManagerPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </MainLayout>
      </NotificationProvider>
    </BrowserRouter>
  )
}

export default App
