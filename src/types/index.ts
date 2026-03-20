export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  created_at: string
}

export interface Conversation {
  id: string
  contact_name: string
  contact_phone: string
  last_message: string
  last_message_at: string
  unread_count: number
}

export interface Message {
  id: string
  conversation_id: string
  content: string
  sender: 'client' | 'bot' | 'agent'
  created_at: string
}

export interface Quote {
  id: string
  conversation_id: string
  contact_name: string
  total: number
  status: 'pendiente' | 'aceptada' | 'rechazada'
  created_at: string
  items: QuoteItem[]
}

export interface QuoteItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface DashboardStats {
  conversations: number
  messages_today: number
  quotes: number
  contacts: number
  conversations_by_day: { date: string; count: number }[]
  recent_conversations: Conversation[]
}

export interface BotConfig {
  system_prompt: string
  greeting: string
  tone: string
  business_name: string
  address: string
  schedule: string
  payment_methods: string
  shipping_info: string
  modules: { quotation: boolean }
  faqs: FAQ[]
}

export interface FAQ {
  id: string
  question: string
  answer: string
}

export interface OnboardingData {
  business_name: string
  whatsapp_number: string
  address: string
  schedule: string
}
