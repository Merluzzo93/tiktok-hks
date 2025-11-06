import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Settings() {
  const [openaiKey, setOpenaiKey] = useState('')
  const [databaseUrl, setDatabaseUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [currentSettings, setCurrentSettings] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings')
      setCurrentSettings(data.settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await axios.post('/api/settings', {
        openai_api_key: openaiKey || undefined,
        database_url: databaseUrl || undefined
      })

      setMessage({ type: 'success', text: 'Impostazioni salvate con successo!' })
      setOpenaiKey('')
      setDatabaseUrl('')
      fetchSettings()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Errore nel salvataggio' })
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setLoading(true)
    setMessage(null)

    try {
      await axios.post('/api/settings/test-connection')
      setMessage({ type: 'success', text: 'Connessione al database riuscita!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Connessione fallita' })
    } finally {
      setLoading(false)
    }
  }

  const handleInitDatabase = async () => {
    if (!confirm('Sei sicuro di voler inizializzare il database? Questa operazione creerà le tabelle necessarie.')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      await axios.post('/api/settings/init-db')
      setMessage({ type: 'success', text: 'Database inizializzato con successo!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Errore inizializzazione' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Impostazioni</h1>
        <p className="text-gray-600">Configura API keys e connessione database</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Current Settings Status */}
      {currentSettings && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Stato Configurazione</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>OpenAI API Key:</span>
              <span className={currentSettings.has_openai_key ? 'text-green-600' : 'text-red-600'}>
                {currentSettings.has_openai_key ? '✓ Configurata' : '✗ Non configurata'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Database URL:</span>
              <span className={currentSettings.has_database_url ? 'text-green-600' : 'text-red-600'}>
                {currentSettings.has_database_url ? '✓ Configurato' : '✗ Non configurato'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="card space-y-6">
        <div>
          <label className="label">
            OpenAI API Key
          </label>
          <input
            type="password"
            className="input"
            placeholder="sk-..."
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">
            Richiesta per la trascrizione audio con GPT-4
          </p>
        </div>

        <div>
          <label className="label">
            Neon Database Connection String
          </label>
          <input
            type="password"
            className="input"
            placeholder="postgresql://..."
            value={databaseUrl}
            onChange={(e) => setDatabaseUrl(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">
            Es: postgresql://neondb_owner:password@host/neondb?sslmode=require
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? 'Salvataggio...' : 'Salva Impostazioni'}
        </button>
      </form>

      {/* Database Actions */}
      <div className="card space-y-4">
        <h2 className="text-xl font-bold">Azioni Database</h2>

        <div className="flex space-x-4">
          <button
            onClick={handleTestConnection}
            disabled={loading}
            className="btn-outline flex-1 disabled:opacity-50"
          >
            Testa Connessione
          </button>

          <button
            onClick={handleInitDatabase}
            disabled={loading}
            className="btn-secondary flex-1 disabled:opacity-50"
          >
            Inizializza Database
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Usa "Inizializza Database" solo alla prima configurazione o per ricreare le tabelle
        </p>
      </div>

      {/* Help Section */}
      <div className="card bg-blue-50">
        <h3 className="font-bold mb-2">Come ottenere le credenziali:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>OpenAI API Key:</strong> Visita{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              platform.openai.com/api-keys
            </a>
          </li>
          <li>
            <strong>Neon Database:</strong> Crea un database gratuito su{' '}
            <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              neon.tech
            </a>
            {' '}e copia la connection string
          </li>
        </ul>
      </div>
    </div>
  )
}
