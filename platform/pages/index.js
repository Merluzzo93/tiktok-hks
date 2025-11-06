import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

export default function Home() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/projects')

      const totalVideos = data.projects.reduce((sum, p) => sum + parseInt(p.video_count || 0), 0)
      const totalMainVideos = data.projects.reduce((sum, p) => sum + parseInt(p.main_videos_count || 0), 0)
      const totalCompetitorVideos = data.projects.reduce((sum, p) => sum + parseInt(p.competitor_videos_count || 0), 0)
      const totalCompetitorUserVideos = data.projects.reduce((sum, p) => sum + parseInt(p.competitor_user_videos_count || 0), 0)

      setStats({
        projects: data.projects.length,
        totalVideos,
        totalMainVideos,
        totalCompetitorVideos,
        totalCompetitorUserVideos
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-primary">TikTok</span> Scraper Platform
        </h1>
        <p className="text-xl text-gray-600">
          Scraping professionale e analisi di video TikTok
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Progetti Totali</h3>
              <p className="text-3xl font-bold text-primary">{stats?.projects || 0}</p>
            </div>
            <div className="card">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Video Totali</h3>
              <p className="text-3xl font-bold text-secondary">{stats?.totalVideos || 0}</p>
            </div>
            <div className="card">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Video Principali</h3>
              <p className="text-3xl font-bold text-blue-500">{stats?.totalMainVideos || 0}</p>
            </div>
            <div className="card">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Video Competitor</h3>
              <p className="text-3xl font-bold text-purple-500">
                {(stats?.totalCompetitorVideos || 0) + (stats?.totalCompetitorUserVideos || 0)}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Azioni Rapide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/projects" className="btn-primary text-center">
                Gestisci Progetti
              </Link>
              <Link href="/scraper" className="btn-secondary text-center">
                Avvia Scraping
              </Link>
              <Link href="/settings" className="btn-outline text-center">
                Impostazioni
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-3 text-primary">Scraping Video</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Download senza watermark</li>
                <li>✓ Estrazione audio</li>
                <li>✓ Salvataggio copertina</li>
                <li>✓ Metadati completi</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-xl font-bold mb-3 text-secondary">Trascrizione AI</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Trascrizione con GPT</li>
                <li>✓ Analisi speaker</li>
                <li>✓ Analisi ambiente</li>
                <li>✓ Analisi tono ed emozioni</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-xl font-bold mb-3 text-purple-500">Organizzazione</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Progetti multipli</li>
                <li>✓ Categorie video</li>
                <li>✓ Ricerca avanzata</li>
                <li>✓ Database PostgreSQL</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
