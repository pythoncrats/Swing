import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useDashboardStore } from '../../store/dashboardStore'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import { Users, CheckCircle, AlertCircle, X, Send } from 'lucide-react'

function TrainerDashboard() {
  const { user } = useAuthStore()
  const { fetchTrainerData, loading } = useDashboardStore()
  
  // 1. Live Interactive Local State Fields (Mocked initially from the DB logic)
  const [trainees, setTrainees] = useState([
    { id: 't1', name: 'Alinda Brian', email: 'alinda@swing.com', skill: 'React & Database Mgmt', progress: 85, status: 'assigned' },
    { id: 't2', name: 'Kato Emmanuel', email: 'kato@email.com', skill: 'Cisco Routing & Switching', progress: 40, status: 'assigned' },
    { id: 't3', name: 'Mbabazi Joan', email: 'joan@email.com', skill: 'Data Science Analytics', progress: 95, status: 'assigned' },
    { id: 't4', name: 'Atwine Innocent', email: 'atwine@email.com', skill: 'Frontend UI Systems', progress: 60, status: 'assigned' },
    { id: 't5', name: 'Mukasa Derrick', email: 'derrick@email.com', skill: 'MariaDB Integrations', progress: 70, status: 'assigned' },
    { id: 't6', name: 'Nassolo Shadia', email: 'shadia@email.com', skill: 'Web API Architecture', status: 'certified' },
    { id: 't7', name: 'Okirot John', email: 'okirot@email.com', skill: 'Python Automation', status: 'certified' },
    { id: 't8', name: 'Bwambale Samuel', email: 'samuel@email.com', skill: 'Mobile App Layouts', status: 'failed' }
  ])

  // Modal State Management
  const [selectedTrainee, setSelectedTrainee] = useState(null)
  const [evaluationStatus, setEvaluationStatus] = useState('certified')
  const [feedbackComment, setFeedbackComment] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchTrainerData(user.id)
    }
  }, [user])

  const sidebarItems = [
    { path: '#assigned', label: 'New Trainees', icon: <Users size={20} /> },
    { path: '#certified', label: 'Certified Trainees', icon: <CheckCircle size={20} /> },
    { path: '#failed', label: 'Return Trainees', icon: <AlertCircle size={20} /> }
  ]

  // Counter Metrics Calculations based on live states
  const assignedCount = trainees.filter(t => t.status === 'assigned').length
  const certifiedCount = trainees.filter(t => t.status === 'certified').length
  const failedCount = trainees.filter(t => t.status === 'failed').length

  // Triggered when a Trainer updates a Trainee's status
  const handleOpenModal = (trainee) => {
    setSelectedTrainee(trainee)
    setEvaluationStatus(trainee.status === 'assigned' ? 'certified' : 'assigned')
    setFeedbackComment('')
  }

  const handleSubmitFeedback = () => {
    if (!selectedTrainee) return

    // Update the live frontend array instantly for the presentation display
    setTrainees(prev => prev.map(t => {
      if (t.id === selectedTrainee.id) {
        return { 
          ...t, 
          status: evaluationStatus,
          progress: evaluationStatus === 'certified' ? 100 : evaluationStatus === 'failed' ? 15 : 50
        }
      }
      return t
    }))

    alert(`✨ Status feedback for ${selectedTrainee.name} submitted successfully to Admin Sedrack!`)
    setSelectedTrainee(null)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar items={sidebarItems} />
        
        <main className="ml-64 flex-1 p-8">
          <div className="space-y-8">
            
            {/* 📊 INTERACTIVE METRICS COUNTERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">New Trainees</p>
                    <p className="text-3xl font-bold text-teal-600">{assignedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-teal-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Certified</p>
                    <p className="text-3xl font-bold text-green-600">{certifiedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Need Retrain</p>
                    <p className="text-3xl font-bold text-amber-600">{failedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <AlertCircle size={24} className="text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* 👤 NEW ASSIGNED TRAINEES TABLE */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Trainees Active in My Tracks</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 text-sm">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Specialization Skill</th>
                      <th className="text-left py-3 px-4 font-semibold">Progress</th>
                      <th className="text-left py-3 px-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm divide-y divide-gray-50">
                    {trainees.filter(t => t.status === 'assigned').map((trainee) => (
                      <tr key={trainee.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3.5 px-4 font-medium text-gray-800">{trainee.name}</td>
                        <td className="py-3.5 px-4 text-gray-500">{trainee.email}</td>
                        <td className="py-3.5 px-4"><span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded text-xs">{trainee.skill}</span></td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-teal-600 h-2 rounded-full" style={{width: `${trainee.progress}%`}}></div>
                            </div>
                            <span className="text-xs font-semibold text-gray-500">{trainee.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button 
                            onClick={() => handleOpenModal(trainee)}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm transition"
                          >
                            View & Evaluate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 🎓 CERTIFIED TRAINEES GRID */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Certified Alumni</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainees.filter(t => t.status === 'certified').map((trainee) => (
                  <div key={trainee.id} className="p-4 border border-green-100 bg-green-50/40 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={20} className="text-green-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{trainee.name}</p>
                        <p className="text-xs text-gray-500">{trainee.skill}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleOpenModal(trainee)}
                      className="text-xs text-gray-500 hover:text-teal-600 font-medium underline"
                    >
                      Re-evaluate
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* ⚠️ RETRAINING ASSIGNMENT FEED */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Trainees Flagged for Retraining</h2>
              
              <div className="space-y-3">
                {trainees.filter(t => t.status === 'failed').map((trainee) => (
                  <div key={trainee.id} className="p-4 border border-amber-100 bg-amber-50/40 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <AlertCircle size={20} className="text-amber-700" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{trainee.name}</p>
                          <p className="text-xs text-amber-800 font-medium">{trainee.skill} — Requires Technical Support</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleOpenModal(trainee)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm transition"
                      >
                        Re-Activate Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* 📋 MODAL DIALOG: TRAINER EVALUATION REPORT TO ADMINS */}
      {selectedTrainee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            
            {/* Header */}
            <div className="bg-teal-600 p-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Trainee Progress Report</h3>
                <p className="text-xs text-teal-100">Sending evaluation data directly to Admin</p>
              </div>
              <button 
                onClick={() => setSelectedTrainee(null)}
                className="hover:bg-teal-700 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-gray-400">Target Student</span>
                <p className="text-base font-semibold text-gray-800">{selectedTrainee.name}</p>
                <p className="text-xs text-gray-500">{selectedTrainee.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Assessment Status</label>
                <select 
                  value={evaluationStatus}
                  onChange={(e) => setEvaluationStatus(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="assigned">In Progress (Keep Training)</option>
                  <option value="certified">Certified (Mark as Complete)</option>
                  <option value="failed">Failed (Return for Retraining)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Feedback Comment</label>
                <span className="text-xs text-gray-400 block mb-2">This detailed note will be forwarded straight to Admin dashboards.</span>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="e.g., Student has successfully completed technical project modules and is ready for placement..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 h-24 text-sm"
                />
              </div>

              {/* Action Actions */}
              <div className="pt-2 flex space-x-3 justify-end">
                <button 
                  onClick={() => setSelectedTrainee(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSubmitFeedback}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm py-2 px-4 rounded-xl inline-flex items-center space-x-2 transition shadow-sm"
                >
                  <Send size={16} />
                  <span>Submit to Admin</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default TrainerDashboard