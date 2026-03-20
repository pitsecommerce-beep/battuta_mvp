import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Bot,
  MessageSquare,
  FileText,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/chatbot', label: 'Chatbot', icon: Bot },
  { to: '/conversaciones', label: 'Conversaciones', icon: MessageSquare },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: FileText },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-primary-dark text-white transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-xl font-bold">Battuta</span>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
