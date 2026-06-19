import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, User, Bell, Check, Sparkles } from 'lucide-react'

function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // --- 🔔 LIVE BELL NOTIFICATION DROPDOWN STATE ---
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: '1', text: 'New trainee registration received from Mbabazi Joan.', unread: true },
    { id: '2', text: 'Trainer Luutu Joseph submitted a performance milestone report.', unread: true },
    { id: '3', text: 'System Update: MariaDB connection synced on port 3306.', unread: false }
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          
          {/* Branding Left Side */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-swing-primary">
              Swing<span className="text-xs ml-1 font-semibold text-gray-400">| {user?.role || 'Portal'}</span>
            </h1>
          </div>

          {/* Interactive Right Controls Panel */}
          <div className="flex items-center space-x-6 relative">
            
            {/* 🔔 ACTIVE NOTIFICATION BELL ROW */}
            <div 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative cursor-pointer hover:bg-swing-light p-2 rounded transition select-none"
            >
              <Bell size={24} className="text-swing-primary" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* --- LIVE DROP-DOWN DRAWER POPUP OVERLAY --- */}
            {showNotifications && (
              <div className="absolute right-48 top-12 bg-white w-80 rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden text-left">
                <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">Alerts Notification Feed</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }} 
                      className="text-xs text-swing-primary hover:underline font-semibold flex items-center space-x-1"
                    >
                      <Check size={12} />
                      <span>Clear all</span>
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-3.5 text-xs transition ${n.unread ? 'bg-swing-light/40 font-medium text-gray-900' : 'text-gray-500'}`}
                    >
                      <div className="flex items-start space-x-2">
                        {n.unread && <span className="w-1.5 h-1.5 bg-swing-primary rounded-full mt-1.5 shrink-0" />}
                        <p className="leading-relaxed">{n.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-2 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-400 flex items-center justify-center space-x-1">
                  <Sparkles size={11} className="text-amber-500" />
                  <span>Real-time Sync Active</span>
                </div>
              </div>
            )}

            {/* User Profile Info Tag */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-swing-light rounded">
              <User size={20} className="text-swing-primary" />
              <span className="text-sm font-medium text-swing-dark">{user?.name || 'User'}</span>
            </div>

            {/* Main Action Call Out Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 btn-primary"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header