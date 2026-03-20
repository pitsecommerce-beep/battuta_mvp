import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import type { Conversation, Message } from '../../types'

export function ConversacionesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMsg, setSendingMsg] = useState(false)

  useEffect(() => {
    apiFetch<Conversation[]>('/api/conversations')
      .then((data) => {
        setConversations(data)
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    apiFetch<Message[]>(`/api/conversations/${selectedId}/messages`)
      .then(setMessages)
      .catch(() => {})
  }, [selectedId])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedId) return
    setSendingMsg(true)
    try {
      await apiFetch(`/api/conversations/${selectedId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: newMessage }),
      })
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversation_id: selectedId,
          content: newMessage,
          sender: 'agent',
          created_at: new Date().toISOString(),
        },
      ])
      setNewMessage('')
    } catch {
      /* empty */
    } finally {
      setSendingMsg(false)
    }
  }

  const selected = conversations.find((c) => c.id === selectedId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Left Panel */}
      <div className={`w-full sm:w-80 border-r border-gray-200 flex flex-col ${selectedId ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              No hay conversaciones
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  conv.id === selectedId ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {conv.contact_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(conv.last_message_at).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className={`flex-1 flex flex-col ${!selectedId ? 'hidden sm:flex' : 'flex'}`}>
        {selected ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <button
                onClick={() => setSelectedId(null)}
                className="sm:hidden text-sm text-primary"
              >
                Volver
              </button>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {selected.contact_name}
                </h3>
                <p className="text-xs text-gray-400">{selected.contact_phone}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'client' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      msg.sender === 'client'
                        ? 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        : msg.sender === 'bot'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-accent text-white rounded-br-sm'
                    }`}
                  >
                    {msg.content}
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.sender === 'client' ? 'text-gray-400' : 'text-white/60'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  rows={1}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={sendingMsg || !newMessage.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Selecciona una conversacion
          </div>
        )}
      </div>
    </div>
  )
}
