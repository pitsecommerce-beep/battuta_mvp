import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { Building2 } from 'lucide-react'

export function OnboardingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    business_name: '',
    whatsapp_number: '',
    address: '',
    schedule: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiFetch('/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configura tu negocio
          </h1>
          <p className="text-gray-500 mt-2">
            Cuentanos sobre tu refaccionaria para personalizar tu chatbot.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del negocio
              </label>
              <input
                name="business_name"
                value={form.business_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Refaccionaria Lopez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero de WhatsApp
              </label>
              <input
                name="whatsapp_number"
                value={form.whatsapp_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direccion
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Av. Insurgentes 1234, CDMX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horario de atencion
              </label>
              <input
                name="schedule"
                value={form.schedule}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Lun-Vie 9:00-18:00, Sab 9:00-14:00"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Guardando...' : 'Continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
