import { Menu, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuthStore()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
      >
        <Menu size={20} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <span className="text-sm text-gray-700 hidden sm:block">
            {user?.email}
          </span>
        </div>
        <button
          onClick={signOut}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
          title="Cerrar sesion"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
