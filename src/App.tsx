import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LandingPage } from './pages/landing/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { OnboardingPage } from './pages/onboarding/OnboardingPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ProductosPage } from './pages/productos/ProductosPage'
import { ChatbotPage } from './pages/chatbot/ChatbotPage'
import { ConversacionesPage } from './pages/conversaciones/ConversacionesPage'
import { CotizacionesPage } from './pages/cotizaciones/CotizacionesPage'

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/conversaciones" element={<ConversacionesPage />} />
          <Route path="/cotizaciones" element={<CotizacionesPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
