import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Scraper() {
  const router = useRouter()
  const { projectId: urlProjectId } = router.query

  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(urlProjectId || '')
  const [mode, setMode] = useState('username') // username, keyword, competitor_username
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Form states
  const [username, setUsername] = useState('')
  const [keyword, setKeyword] = useState('')
  const [region, setRegion] = useState('IT')
  const [regions, setRegions] = useState([])
  const [count, setCount] = useState(35)

  // Results
  const [searchResults, setSearchResults] = useState([])
  const [selectedVideos, setSelectedVideos] = useState([])

  // Bulk save options
  const [downloadMedia, setDownloadMedia] = useState(true)
  const [transcribe, setTranscribe] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProjects()
    fetchRegions()
  }, [])

  useEffect(() => {
    if (urlProjectId) {
      setSelectedProject(urlProjectId)
    }
  }, [urlProjectId])

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/api/projects')
      setProjects(data.projects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchRegions = async () => {
    try {
      const { data } = await axios.get('/api/scrape/regions')
      if (data.success && data.regions) {
        setRegions(data.regions)
      }
    } catch (error) {
      console.error('Error fetching regions:', error)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setSearchResults([])
    setSelectedVideos([])

    try {
      let data

      if (mode === 'username' || mode === 'competitor_username') {
        const response = await axios.post('/api/scrape/user-videos', {
          username,
          count
        })
        data = response.data

        if (data.success) {
          setSearchResults(data.videos)
          setMessage({
            type: 'success',
            text: `Trovati ${data.videos.length} video di @${username}`
          })
        }
      } else if (mode === 'keyword') {
        const response = await axios.post('/api/scrape/search-keyword', {
          keyword,
          region,
          count
        })
        data = response.data

        if (data.success) {
          setSearchResults(data.videos)
          setMessage({
            type: 'success',
            text: `Trovati ${data.videos.length} video per "${keyword}"`
          })
        }
      }
    } catch (error) {
      console.error('Error searching:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Errore durante la ricerca'
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleVideoSelection = (video) => {
    if (selectedVideos.find(v => v.video_id === video.video_id)) {
      setSelectedVideos(selectedVideos.filter(v => v.video_id !== video.video_id))
    } else {
      setSelectedVideos([...selectedVideos, video])
    }
  }

  const selectAll = () => {
    setSelectedVideos([...searchResults])
  }

  const deselectAll = () => {
    setSelectedVideos([])
  }

  const handleBulkSave = async () => {
    if (!selectedProject) {
      setMessage({ type: 'error', text: 'Seleziona un progetto' })
      return
    }

    if (selectedVideos.length === 0) {
      setMessage({ type: 'error', text: 'Seleziona almeno un video' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      // Determine category based on mode
      let category
      if (mode === 'username') {
        category = 'main_videos'
      } else if (mode === 'keyword') {
        category = 'competitor_videos'
      } else if (mode === 'competitor_username') {
        category = 'competitor_user_videos'
      }

      const response = await axios.post('/api/scrape/save-videos', {
        projectId: selectedProject,
        videos: selectedVideos,
        category,
        downloadMedia,
        transcribe
      })

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Salvati ${response.data.saved} video su ${response.data.total}. ${
            response.data.errors?.length > 0
              ? `${response.data.errors.length} errori.`
              : ''
          }`
        })
        setSelectedVideos([])

        // Redirect to project page after 2 seconds
        setTimeout(() => {
          router.push(`/projects/${selectedProject}`)
        }, 2000)
      }
    } catch (error) {
      console.error('Error saving videos:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Errore durante il salvataggio'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">TikTok Scraper</h1>
        <p className="text-gray-600">Cerca e scarica video da TikTok</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Search Form */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Ricerca Video</h2>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="label">Tipo di Ricerca</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setMode('username')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'username'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-bold mb-1">Video Principali</div>
              <div className="text-sm text-gray-600">Scarica video da un tuo utente</div>
            </button>

            <button
              onClick={() => setMode('keyword')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'keyword'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-bold mb-1">Video Competitor</div>
              <div className="text-sm text-gray-600">Cerca per parola chiave</div>
            </button>

            <button
              onClick={() => setMode('competitor_username')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'competitor_username'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-bold mb-1">Video Utente Competitor</div>
              <div className="text-sm text-gray-600">Scarica video da un competitor</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Username Search */}
          {(mode === 'username' || mode === 'competitor_username') && (
            <div>
              <label className="label">Username TikTok *</label>
              <input
                type="text"
                className="input"
                placeholder="Es: charlidamelio"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Inserisci lo username senza @
              </p>
            </div>
          )}

          {/* Keyword Search */}
          {mode === 'keyword' && (
            <>
              <div>
                <label className="label">Parola Chiave *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Es: ricette, makeup, fitness..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Paese</label>
                <select
                  className="input"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="">Tutti i paesi</option>
                  <option value="IT">Italia</option>
                  <option value="US">Stati Uniti</option>
                  <option value="GB">Regno Unito</option>
                  <option value="FR">Francia</option>
                  <option value="DE">Germania</option>
                  <option value="ES">Spagna</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Count */}
          <div>
            <label className="label">Numero di Video</label>
            <input
              type="number"
              className="input"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
            />
            <p className="text-sm text-gray-500 mt-1">
              Massimo 100 video per ricerca (rate limits TikTok)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Ricerca in corso...' : 'Cerca Video'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searchResults.length > 0 && (
        <>
          {/* Selection Controls */}
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Risultati ({searchResults.length} video)
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedVideos.length} video selezionati
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={selectAll} className="btn-outline text-sm">
                  Seleziona Tutti
                </button>
                <button onClick={deselectAll} className="btn-outline text-sm">
                  Deseleziona Tutti
                </button>
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="video-grid">
            {searchResults.map((video) => {
              const isSelected = selectedVideos.find(v => v.video_id === video.video_id)
              return (
                <div
                  key={video.video_id}
                  onClick={() => toggleVideoSelection(video)}
                  className={`video-card ${isSelected ? 'video-card-selected' : ''}`}
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                    }`}>
                      {isSelected && <span className="text-white text-sm">✓</span>}
                    </div>
                  </div>

                  {video.cover ? (
                    <img
                      src={video.cover}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Cover</span>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 text-sm">
                      {video.title || video.desc || 'Senza titolo'}
                    </h3>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>👤 @{video.author?.unique_id || video.username}</p>
                      <p>👁️ {video.play_count?.toLocaleString()} views</p>
                      <p>❤️ {video.digg_count?.toLocaleString()} likes</p>
                      <p>⏱️ {video.duration}s</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bulk Save Section */}
          {selectedVideos.length > 0 && (
            <div className="card bg-primary/10 border-2 border-primary">
              <h2 className="text-xl font-bold mb-4">Salva Video Selezionati</h2>

              <div className="space-y-4">
                {/* Project Selection */}
                <div>
                  <label className="label">Progetto *</label>
                  <select
                    className="input"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    required
                  >
                    <option value="">Seleziona un progetto</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={downloadMedia}
                      onChange={(e) => setDownloadMedia(e.target.checked)}
                      className="w-5 h-5 text-primary"
                    />
                    <span>Scarica video, audio e copertina</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={transcribe}
                      onChange={(e) => setTranscribe(e.target.checked)}
                      disabled={!downloadMedia}
                      className="w-5 h-5 text-primary disabled:opacity-50"
                    />
                    <span>Trascrivi audio con GPT-4 (richiede OpenAI API key)</span>
                  </label>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                  ⚠️ Il salvataggio di {selectedVideos.length} video potrebbe richiedere diversi minuti.
                  {transcribe && ' La trascrizione con GPT-4 aumenterà i tempi e i costi.'}
                </div>

                {/* Save Button */}
                <button
                  onClick={handleBulkSave}
                  disabled={saving || !selectedProject}
                  className="btn-primary w-full disabled:opacity-50 py-3 text-lg"
                >
                  {saving
                    ? `Salvataggio in corso... (${selectedVideos.length} video)`
                    : `Salva ${selectedVideos.length} Video`
                  }
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
