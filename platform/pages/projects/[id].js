import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'

export default function ProjectDetail() {
  const router = useRouter()
  const { id } = router.query

  const [project, setProject] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    if (id) {
      fetchProject()
    }
  }, [id])

  const fetchProject = async () => {
    try {
      const { data } = await axios.get(`/api/projects/${id}`)
      setProject(data.project)
      setVideos(data.project.videos || [])
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = videos.filter((video) => {
    if (filter === 'all') return true
    return video.video_category === filter
  })

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Sei sicuro di voler eliminare questo video?')) return

    try {
      await axios.delete(`/api/videos/${videoId}`)
      fetchProject()
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">Progetto non trovato</p>
        <Link href="/projects" className="btn-primary inline-block">
          Torna ai Progetti
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/projects" className="text-primary hover:underline mb-2 inline-block">
            ← Torna ai Progetti
          </Link>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <p className="text-gray-600">{project.description || 'Nessuna descrizione'}</p>
        </div>
        <Link
          href={`/scraper?projectId=${id}`}
          className="btn-primary"
        >
          + Aggiungi Video
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Totale Video</p>
          <p className="text-2xl font-bold">{videos.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Video Principali</p>
          <p className="text-2xl font-bold text-blue-500">
            {videos.filter(v => v.video_category === 'main_videos').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Video Competitor</p>
          <p className="text-2xl font-bold text-purple-500">
            {videos.filter(v => v.video_category === 'competitor_videos').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Video Utenti Competitor</p>
          <p className="text-2xl font-bold text-orange-500">
            {videos.filter(v => v.video_category === 'competitor_user_videos').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="flex space-x-4 border-b">
          {[
            { id: 'all', label: 'Tutti', count: videos.length },
            { id: 'main_videos', label: 'Principali', count: videos.filter(v => v.video_category === 'main_videos').length },
            { id: 'competitor_videos', label: 'Competitor', count: videos.filter(v => v.video_category === 'competitor_videos').length },
            { id: 'competitor_user_videos', label: 'Utenti Competitor', count: videos.filter(v => v.video_category === 'competitor_user_videos').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`pb-3 px-4 font-medium transition-colors ${
                filter === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nessun video in questa categoria
          </div>
        ) : (
          <div className="video-grid mt-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="video-card"
                onClick={() => setSelectedVideo(video)}
              >
                {video.cover_image_path ? (
                  <img
                    src={video.cover_image_path}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Cover</span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{video.title || 'Senza titolo'}</h3>

                  <div className="text-sm text-gray-500 space-y-1">
                    <p>👤 @{video.username}</p>
                    <p>👁️ {video.play_count?.toLocaleString()} visualizzazioni</p>
                    <p>❤️ {video.digg_count?.toLocaleString()} like</p>
                  </div>

                  {video.transcription && (
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ✓ Trascritto
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Detail Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setSelectedVideo(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">{selectedVideo.title}</h2>
                <button onClick={() => setSelectedVideo(null)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              {selectedVideo.video_file_path && (
                <video controls className="w-full rounded-lg">
                  <source src={selectedVideo.video_file_path} type="video/mp4" />
                </video>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Username:</strong> @{selectedVideo.username}
                </div>
                <div>
                  <strong>Durata:</strong> {selectedVideo.duration}s
                </div>
                <div>
                  <strong>Visualizzazioni:</strong> {selectedVideo.play_count?.toLocaleString()}
                </div>
                <div>
                  <strong>Like:</strong> {selectedVideo.digg_count?.toLocaleString()}
                </div>
                <div>
                  <strong>Commenti:</strong> {selectedVideo.comment_count?.toLocaleString()}
                </div>
                <div>
                  <strong>Condivisioni:</strong> {selectedVideo.share_count?.toLocaleString()}
                </div>
              </div>

              {selectedVideo.transcription && (
                <div>
                  <h3 className="font-bold mb-2">Trascrizione:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedVideo.transcription}</p>
                  </div>
                </div>
              )}

              {selectedVideo.transcription_details && (
                <div>
                  <h3 className="font-bold mb-2">Analisi Dettagliata:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(JSON.parse(selectedVideo.transcription_details).analysis, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                {selectedVideo.video_file_path && (
                  <a href={selectedVideo.video_file_path} download className="btn-primary flex-1 text-center">
                    Download Video
                  </a>
                )}
                {selectedVideo.audio_file_path && (
                  <a href={selectedVideo.audio_file_path} download className="btn-outline flex-1 text-center">
                    Download Audio
                  </a>
                )}
                <button
                  onClick={() => {
                    handleDeleteVideo(selectedVideo.id)
                    setSelectedVideo(null)
                  }}
                  className="btn-outline flex-1 text-red-600 hover:bg-red-50"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
