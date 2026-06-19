import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useDashboardStore } from '../../store/dashboardStore'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import { User, BookOpen, Briefcase, Trophy, Save } from 'lucide-react'

function TraineeDashboard() {
  const { user } = useAuthStore()
  const { fetchTraineeData, updateTraineeProfile, loading } = useDashboardStore()
  const [hasSkillsSelection, setHasSkillsSelection] = useState('yes')
  
  const [skills, setSkills] = useState({
    existing: 'HTML, CSS',
    interests: 'Data Science, Network Configuration'
  })

  useEffect(() => {
    if (user?.id) {
      fetchTraineeData(user.id)
    }
  }, [user])

  const sidebarItems = [
    { path: '#profile', label: 'Profile', icon: <User size={20} /> },
    { path: '#skills', label: 'My Skills', icon: <BookOpen size={20} /> },
    { path: '#training', label: 'Training', icon: <Trophy size={20} /> },
    { path: '#jobs', label: 'Job Recommendations', icon: <Briefcase size={20} /> }
  ]

  const handleSaveProfile = async () => {
    try {
      await updateTraineeProfile(user.id, {
        existingSkills: skills.existing.split(',').map(s => s.trim()),
        skillsOfInterest: skills.interests.split(',').map(s => s.trim())
      })
      alert('✨ Skills updated successfully inside the database!')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      <div className="flex">
        <Sidebar items={sidebarItems} />
        
        <main className="ml-64 flex-1 p-8">
          <div className="space-y-8">
            
            {/* 👤 PROFILE SECTION */}
            <section className="card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="w-32 h-32 bg-teal-50 rounded-lg flex items-center justify-center border border-teal-100">
                    <User size={64} className="text-teal-600" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-lg font-semibold text-gray-800">{user?.name || "Alinda Brian"}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                    <p className="text-lg text-gray-700">{user?.email || "trainee@swing.com"}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                    <p className="text-lg text-gray-700">{user?.phone || "+256 700 000000"}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 📚 SKILLS INTERACTION SECTION */}
            <section className="card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">My Skills & Target Interests</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you have existing skills?
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="hasSkills" 
                        checked={hasSkillsSelection === 'yes'}
                        onChange={() => setHasSkillsSelection('yes')}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500" 
                      />
                      <span className="text-gray-700 font-medium">Yes, I have skills to list</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="hasSkills" 
                        checked={hasSkillsSelection === 'no'}
                        onChange={() => setHasSkillsSelection('no')}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500" 
                      />
                      <span className="text-gray-700 font-medium">No, I'm starting fresh</span>
                    </label>
                  </div>
                </div>

                {hasSkillsSelection === 'yes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Existing Skills (separated by commas)
                    </label>
                    <textarea
                      value={skills.existing}
                      onChange={(e) => setSkills({...skills, existing: e.target.value})}
                      placeholder="e.g., HTML, CSS, JavaScript"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 h-24"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills You Want to Learn / Interests
                  </label>
                  <textarea
                    value={skills.interests}
                    onChange={(e) => setSkills({...skills, interests: e.target.value})}
                    placeholder="e.g., Data Science, Cisco Networking"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 h-24"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleSaveProfile} 
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-5 rounded-lg inline-flex items-center space-x-2 shadow-sm transition"
                  >
                    <Save size={18} />
                    <span>Save Skills & Settings</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 🏆 TRAINING STATUS PROGRESS TRACKING */}
            <section className="card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Training Enrolment Status</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">Current Program</span>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Assigned
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Assigned Mentor:</span> Luutu Joseph</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Current Track:</span> Full-Stack Innovation Labs</p>
                </div>
              </div>
            </section>

            {/* 💼 JOBS RECOMMENDED SECTION */}
            <section className="card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Official Job Placement Recommendations</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:border-teal-500 hover:bg-white transition shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">Junior Data Analyst Intern</h4>
                      <p className="text-sm font-semibold text-teal-600">MTN Uganda</p>
                      <p className="text-sm text-gray-600 mt-2">Recommended by Admin Sedrack based on your computing milestones.</p>
                    </div>
                    <span className="bg-teal-100 text-teal-800 px-2.5 py-1 rounded-md text-xs font-bold">New Match</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}

export default TraineeDashboard