import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/api/projects')
      setProjects(data.projects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setMessage({ type: 'error', text: 'Errore nel caricamento dei progetti' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()

    if (!newProject.name) {
      setMessage({ type: 'error', text: 'Il nome del progetto è obbligatorio' })
      return
    }

    try {
      await axios.post('/api/projects', newProject)
      setMessage({ type: 'success', text: 'Progetto creato con successo!' })
      setShowModal(false)
      setNewProject({ name: '', description: '' })
      fetchProjects()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Errore nella creazione' })
    }
  }

  const handleDeleteProject = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto? Tutti i video associati verranno eliminati.')) {
      return
    }

    try {
      await axios.delete(`/api/projects/${id}`)
      setMessage({ type: 'success', text: 'Progetto eliminato con successo!' })
      fetchProjects()
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore nell\'eliminazione del progetto' })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Progetti</h1>
          <p className="text-gray-600">Gestisci i tuoi progetti di scraping TikTok</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Nuovo Progetto
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Nessun progetto creato</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Crea il tuo primo progetto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="card hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2">{project.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{project.description || 'Nessuna descrizione'}</p>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Video Totali:</span>
                  <span className="font-semibold">{project.video_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Video Principali:</span>
                  <span className="font-semibold text-blue-500">{project.main_videos_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Video Competitor:</span>
                  <span className="font-semibold text-purple-500">{project.competitor_videos_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Video Utenti Competitor:</span>
                  <span className="font-semibold text-orange-500">{project.competitor_user_videos_count || 0}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex-1 text-center btn-primary text-sm py-2"
                >
                  Visualizza
                </Link>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex-1 text-center btn-outline text-sm py-2 text-red-600 hover:bg-red-50"
                >
                  Elimina
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Creato il {new Date(project.created_at).toLocaleDateString('it-IT')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Nuovo Progetto</h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="label">Nome Progetto *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Es: Analisi Competitor Q1 2024"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Descrizione</label>
                <textarea
                  className="input"
                  rows="3"
                  placeholder="Descrizione opzionale del progetto..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  Crea Progetto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setNewProject({ name: '', description: '' })
                  }}
                  className="btn-outline flex-1"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
