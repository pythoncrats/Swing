import { Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

function Sidebar({ items }) {
  const location = useLocation()
  const { logout } = useAuthStore()

  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar w-64 min-h-screen fixed left-0 top-16">
      <nav className="p-6 space-y-2">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded transition ${
              isActive(item.path)
                ? 'bg-swing-primary text-white'
                : 'text-swing-dark hover:bg-swing-light'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 w-56">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded bg-red-100 hover:bg-red-200 text-red-700 transition font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
