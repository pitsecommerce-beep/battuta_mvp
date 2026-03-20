import { useEffect, useState } from 'react'
import { Download, X, ChevronLeft } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import type { Quote } from '../../types'

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aceptada: 'bg-green-100 text-green-800',
  rechazada: 'bg-red-100 text-red-800',
}

export function CotizacionesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<Quote[]>('/api/quotes')
      .then(setQuotes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDownloadPDF = async (quoteId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/api/quotes/${quoteId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cotizacion-${quoteId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      /* empty */
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Fecha
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Contacto
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Total
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Estatus
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No hay cotizaciones
                  </td>
                </tr>
              ) : (
                quotes.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => setSelectedQuote(q)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {new Date(q.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {q.contact_name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900 text-right">
                      ${q.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[q.status]}`}
                      >
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadPDF(q.id)
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                        title="Descargar PDF"
                      >
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft size={18} />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  Detalle de cotizacion
                </h2>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Contacto:</span>
                <span className="font-medium">{selectedQuote.contact_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fecha:</span>
                <span>{new Date(selectedQuote.created_at).toLocaleDateString('es-MX')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estatus:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedQuote.status]}`}
                >
                  {selectedQuote.status.charAt(0).toUpperCase() + selectedQuote.status.slice(1)}
                </span>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Producto</th>
                  <th className="text-center py-2 text-gray-500 font-medium">Cant.</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Precio</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedQuote.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2">{item.product_name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">
                      ${item.unit_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 text-right font-medium">
                      ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td colSpan={3} className="py-2 text-right font-semibold">
                    Total:
                  </td>
                  <td className="py-2 text-right font-bold text-primary">
                    ${selectedQuote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
            <button
              onClick={() => handleDownloadPDF(selectedQuote.id)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
            >
              <Download size={16} />
              Descargar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
