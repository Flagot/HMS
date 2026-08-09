import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'
import { HousekeepingPage } from './pages/HousekeepingPage'
import { KitchenPage } from './pages/KitchenPage'
import { WaiterPage } from './pages/WaiterPage'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/housekeeping" element={<HousekeepingPage />} />
          <Route path="/waiter" element={<WaiterPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
