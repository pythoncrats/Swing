import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Header from '../../components/Header'
import { GraduationCap, Users, Settings } from 'lucide-react'

function DashboardSelector() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const dashboards = [
    {
      id: 'trainee',
      title: 'Trainee Dashboard',
      description: 'Manage your learning journey, view certifications and job recommendations',
      icon: GraduationCap,
      path: '/trainee-dashboard',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'trainer',
      title: 'Trainer Dashboard',
      description: 'Manage trainees, track progress and certifications',
      icon: Users,
      path: '/trainer-dashboard',
      color: 'from-cyan-400 to-cyan-600'
    },
    {
      id: 'admin',
      title: 'Administrator Dashboard',
      description: 'Manage all users, organizations, jobs and recommendations',
      icon: Settings,
      path: '/admin-dashboard',
      color: 'from-teal-400 to-teal-600'
    }
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      <main className="container-custom py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-swing-dark mb-2">Welcome to Swing</h1>
          <p className="text-xl text-gray-600">Select your dashboard to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dashboards.map((dashboard) => {
            const Icon = dashboard.icon
            return (
              <div
                key={dashboard.id}
                onClick={() => navigate(dashboard.path)}
                className="card hover:shadow-lg hover:border-swing-primary transition cursor-pointer group"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${dashboard.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <Icon size={32} className="text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-swing-dark mb-2">
                  {dashboard.title}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {dashboard.description}
                </p>
                
                <button className="btn-primary w-full">
                  Access Dashboard
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default DashboardSelector