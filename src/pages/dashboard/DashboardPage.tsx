import { useEffect, useState } from 'react'
import { MessageSquare, Mail, FileText, Users } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { apiFetch } from '../../lib/api'
import type { DashboardStats } from '../../types'

const defaultStats: DashboardStats = {
  conversations: 0,
  messages_today: 0,
  quotes: 0,
  contacts: 0,
  conversations_by_day: [],
  recent_conversations: [],
}

const statCards = [
  { key: 'conversations' as const, label: 'Conversaciones', icon: MessageSquare, color: 'bg-blue-500' },
  { key: 'messages_today' as const, label: 'Mensajes hoy', icon: Mail, color: 'bg-green-500' },
  { key: 'quotes' as const, label: 'Cotizaciones', icon: FileText, color: 'bg-purple-500' },
  { key: 'contacts' as const, label: 'Contactos', icon: Users, color: 'bg-orange-500' },
]

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<DashboardStats>('/api/dashboard/stats')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{card.label}</span>
              <div
                className={`w-9 h-9 ${card.color} rounded-lg flex items-center justify-center`}
              >
                <card.icon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats[card.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Conversaciones (ultimos 7 dias)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.conversations_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1B4F72" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Conversations Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Ultimas conversaciones
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Contacto
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Ultimo mensaje
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_conversations.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No hay conversaciones aun
                  </td>
                </tr>
              ) : (
                stats.recent_conversations.map((conv) => (
                  <tr
                    key={conv.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {conv.contact_name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {conv.last_message}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400">
                      {new Date(conv.last_message_at).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
