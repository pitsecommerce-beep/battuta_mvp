import { useEffect, useState } from 'react'
import { Save, Plus, Trash2, Lock } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import type { BotConfig, FAQ } from '../../types'

const defaultConfig: BotConfig = {
  system_prompt: '',
  greeting: 'Hola! Bienvenido a nuestra refaccionaria. ¿En que puedo ayudarte?',
  tone: 'profesional',
  business_name: '',
  address: '',
  schedule: '',
  payment_methods: '',
  shipping_info: '',
  modules: { quotation: true },
  faqs: [],
}

export function ChatbotPage() {
  const [config, setConfig] = useState<BotConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    apiFetch<BotConfig>('/api/bot-config')
      .then(setConfig)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setConfig((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addFaq = () => {
    const newFaq: FAQ = { id: crypto.randomUUID(), question: '', answer: '' }
    setConfig((prev) => ({ ...prev, faqs: [...prev.faqs, newFaq] }))
  }

  const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    setConfig((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    }))
  }

  const removeFaq = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id),
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await apiFetch('/api/bot-config', {
        method: 'PUT',
        body: JSON.stringify(config),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      /* empty */
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Configuracion del Chatbot</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Guardando...' : saved ? 'Guardado!' : 'Guardar'}
        </button>
      </div>

      {/* Personality */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personalidad del bot</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System prompt
            </label>
            <textarea
              name="system_prompt"
              value={config.system_prompt}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              placeholder="Eres un asistente de ventas para una refaccionaria..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje de saludo
            </label>
            <input
              name="greeting"
              value={config.greeting}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tono</label>
            <select
              name="tone"
              value={config.tone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="profesional">Profesional</option>
              <option value="amigable">Amigable</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
            </select>
          </div>
        </div>
      </section>

      {/* Business Info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informacion del negocio</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="business_name"
              value={config.business_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Direccion</label>
            <input
              name="address"
              value={config.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
            <input
              name="schedule"
              value={config.schedule}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formas de pago</label>
            <input
              name="payment_methods"
              value={config.payment_methods}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Efectivo, transferencia, tarjeta"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Envios</label>
            <input
              name="shipping_info"
              value={config.shipping_info}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Envio gratis en compras mayores a $500"
            />
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Modulos</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm font-medium text-gray-900">Cotizacion automatica</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.modules.quotation}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    modules: { ...prev.modules, quotation: e.target.checked },
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
          {['Cobranza', 'Prospeccion', 'Almacen'].map((mod) => (
            <div
              key={mod}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60"
            >
              <span className="text-sm font-medium text-gray-900">{mod}</span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Lock size={12} />
                Proximamente
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Preguntas frecuentes</h2>
          <button
            onClick={addFaq}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
        {config.faqs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No hay preguntas frecuentes. Agrega una para entrenar a tu bot.
          </p>
        ) : (
          <div className="space-y-3">
            {config.faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <input
                    value={faq.question}
                    onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                    placeholder="Pregunta"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <button
                    onClick={() => removeFaq(faq.id)}
                    className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                  placeholder="Respuesta"
                  rows={2}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
