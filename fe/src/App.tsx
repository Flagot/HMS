import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'
import { HousekeepingPage } from './pages/HousekeepingPage'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/housekeeping" element={<HousekeepingPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
