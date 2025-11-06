# API Documentation - TikTok Scraper Platform

Documentazione completa delle API REST disponibili nella piattaforma.

## Base URL

```
Development: http://localhost:3000
Production: https://your-app.vercel.app
```

## Autenticazione

Attualmente non è implementata l'autenticazione. È consigliato implementare JWT o sessioni per ambiente di produzione.

---

## Settings API

### GET /api/settings

Ottieni le impostazioni correnti.

**Response:**
```json
{
  "success": true,
  "settings": {
    "openai_api_key": "***key4",
    "database_url": "***host/neondb",
    "has_openai_key": true,
    "has_database_url": true
  }
}
```

### POST /api/settings

Aggiorna le impostazioni.

**Body:**
```json
{
  "openai_api_key": "sk-...",
  "database_url": "postgresql://..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

### POST /api/settings/test-connection

Testa la connessione al database.

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### POST /api/settings/init-db

Inizializza lo schema del database (crea tabelle).

**Response:**
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

---

## Projects API

### GET /api/projects

Ottieni tutti i progetti con statistiche.

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": 1,
      "name": "Progetto Test",
      "description": "Descrizione del progetto",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "video_count": 150,
      "main_videos_count": 50,
      "competitor_videos_count": 70,
      "competitor_user_videos_count": 30
    }
  ]
}
```

### POST /api/projects

Crea un nuovo progetto.

**Body:**
```json
{
  "name": "Nome Progetto",
  "description": "Descrizione opzionale"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": 1,
    "name": "Nome Progetto",
    "description": "Descrizione opzionale",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### GET /api/projects/[id]

Ottieni un progetto specifico con tutti i video.

**Response:**
```json
{
  "success": true,
  "project": {
    "id": 1,
    "name": "Nome Progetto",
    "description": "Descrizione",
    "created_at": "2024-01-15T10:00:00.000Z",
    "videos": [
      {
        "id": 1,
        "project_id": 1,
        "video_category": "main_videos",
        "tiktok_id": "7123456789",
        "tiktok_url": "https://www.tiktok.com/@user/video/7123456789",
        "username": "username",
        "title": "Titolo video",
        "duration": 30,
        "play_count": 1000000,
        "digg_count": 50000,
        "comment_count": 1000,
        "share_count": 5000,
        "video_file_path": "/downloads/project_1/main_videos/video.mp4",
        "audio_file_path": "/downloads/project_1/main_videos/audio.mp3",
        "cover_image_path": "/downloads/project_1/main_videos/cover.jpg",
        "transcription": "Testo trascrizione...",
        "transcription_details": {
          "text": "Trascrizione completa...",
          "analysis": {
            "speakers": ["Speaker 1"],
            "environment": "interno, silenzioso",
            "tone": "energetico"
          }
        },
        "metadata": {},
        "created_at": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

### PUT /api/projects/[id]

Aggiorna un progetto.

**Body:**
```json
{
  "name": "Nuovo Nome",
  "description": "Nuova descrizione"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": 1,
    "name": "Nuovo Nome",
    "description": "Nuova descrizione",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

### DELETE /api/projects/[id]

Elimina un progetto e tutti i video associati.

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Scraping API

### POST /api/scrape/user-videos

Scarica tutti i video di un utente TikTok.

**Body:**
```json
{
  "username": "charlidamelio",
  "count": 35
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "6818563029089682434",
    "uniqueId": "charlidamelio",
    "nickname": "Charli D'Amelio",
    "avatarThumb": "https://...",
    "followerCount": 150000000,
    "verified": true
  },
  "videos": [
    {
      "video_id": "7123456789",
      "title": "Titolo video",
      "author": {
        "unique_id": "charlidamelio",
        "nickname": "Charli D'Amelio"
      },
      "play_count": 1000000,
      "digg_count": 50000,
      "comment_count": 1000,
      "share_count": 5000,
      "duration": 30,
      "cover": "https://...",
      "play": "https://..."
    }
  ],
  "total": 35
}
```

### POST /api/scrape/search-keyword

Cerca video per parola chiave e regione.

**Body:**
```json
{
  "keyword": "ricette",
  "region": "IT",
  "count": 30
}
```

**Response:**
```json
{
  "success": true,
  "keyword": "ricette",
  "region": "IT",
  "videos": [
    {
      "video_id": "7123456789",
      "title": "Ricetta pasta carbonara",
      "author": {
        "unique_id": "username"
      },
      "region": "IT",
      "play_count": 500000,
      "digg_count": 25000,
      "duration": 45,
      "cover": "https://...",
      "play": "https://..."
    }
  ],
  "total": 30
}
```

### POST /api/scrape/save-videos

Salva video in bulk con download e trascrizione.

**Body:**
```json
{
  "projectId": 1,
  "videos": [
    {
      "video_id": "7123456789",
      "title": "Titolo",
      "author": {
        "unique_id": "username"
      },
      "play_count": 1000000,
      "play": "https://..."
    }
  ],
  "category": "main_videos",
  "downloadMedia": true,
  "transcribe": true
}
```

**Parameters:**
- `projectId` (number, required): ID del progetto
- `videos` (array, required): Array di video da salvare
- `category` (string, required): `main_videos`, `competitor_videos`, o `competitor_user_videos`
- `downloadMedia` (boolean, optional): Se scaricare video/audio/cover (default: true)
- `transcribe` (boolean, optional): Se trascrivere l'audio con GPT-4 (default: true)

**Response:**
```json
{
  "success": true,
  "saved": 10,
  "total": 10,
  "videos": [
    {
      "id": 1,
      "project_id": 1,
      "video_category": "main_videos",
      "tiktok_id": "7123456789",
      "video_file_path": "/downloads/project_1/main_videos/video.mp4",
      "transcription": "Testo trascritto..."
    }
  ],
  "errors": []
}
```

**Note:**
- Questa operazione può richiedere diversi minuti per molti video
- Vercel Free tier ha timeout di 10 secondi (necessario Pro per bulk operations)
- La trascrizione richiede OpenAI API key configurata

### GET /api/scrape/regions

Ottieni la lista delle regioni disponibili.

**Response:**
```json
{
  "success": true,
  "regions": ["IT", "US", "GB", "FR", "DE", "ES", ...]
}
```

---

## Videos API

### GET /api/videos/[id]

Ottieni i dettagli di un video specifico.

**Response:**
```json
{
  "success": true,
  "video": {
    "id": 1,
    "project_id": 1,
    "video_category": "main_videos",
    "tiktok_id": "7123456789",
    "tiktok_url": "https://...",
    "username": "username",
    "title": "Titolo video",
    "duration": 30,
    "play_count": 1000000,
    "video_file_path": "/downloads/...",
    "transcription": "Testo...",
    "transcription_details": {}
  }
}
```

### DELETE /api/videos/[id]

Elimina un video.

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

---

## Error Responses

Tutti gli endpoint possono restituire errori nel seguente formato:

```json
{
  "success": false,
  "error": "Messaggio di errore dettagliato"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (parametri mancanti/invalidi)
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

---

## Rate Limits

### TikTok API (tramite TikWM)
- Maggior parte endpoints: **1 richiesta ogni 10 secondi**
- Alcuni endpoints: **1 richiesta al secondo**
- Max risultati per richiesta: **35 video**

### Bulk Operations
La piattaforma implementa automaticamente:
- Pause di 1-2 secondi tra richieste TikTok
- Gestione cursori per paginazione
- Retry su errori temporanei

---

## Esempi di Utilizzo

### Workflow Completo: Scraping e Salvataggio

```bash
# 1. Crea un progetto
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Analisi Competitor",
    "description": "Q1 2024"
  }'
# Response: { "project": { "id": 1 } }

# 2. Cerca video per keyword
curl -X POST http://localhost:3000/api/scrape/search-keyword \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "fitness",
    "region": "IT",
    "count": 20
  }'
# Response: { "videos": [...] }

# 3. Salva i video con trascrizione
curl -X POST http://localhost:3000/api/scrape/save-videos \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "videos": [...],
    "category": "competitor_videos",
    "downloadMedia": true,
    "transcribe": true
  }'
# Response: { "saved": 20, "videos": [...] }

# 4. Ottieni i dettagli del progetto
curl http://localhost:3000/api/projects/1
# Response: { "project": { ..., "videos": [...] } }
```

### Scraping Video Utente

```javascript
const axios = require('axios');

async function scrapeUserVideos(username) {
  try {
    // Scrape videos
    const { data } = await axios.post('http://localhost:3000/api/scrape/user-videos', {
      username,
      count: 50
    });

    console.log(`Found ${data.total} videos for @${username}`);
    console.log(`Follower count: ${data.user.followerCount.toLocaleString()}`);

    // Save to project
    await axios.post('http://localhost:3000/api/scrape/save-videos', {
      projectId: 1,
      videos: data.videos,
      category: 'main_videos',
      downloadMedia: true,
      transcribe: true
    });

    console.log('Videos saved successfully!');
  } catch (error) {
    console.error('Error:', error.response?.data?.error || error.message);
  }
}

scrapeUserVideos('charlidamelio');
```

### Analisi Trascrizioni

```javascript
async function analyzeTranscriptions(projectId) {
  const { data } = await axios.get(`http://localhost:3000/api/projects/${projectId}`);

  const transcribed = data.project.videos.filter(v => v.transcription);

  console.log(`Transcribed videos: ${transcribed.length}`);

  transcribed.forEach(video => {
    const details = JSON.parse(video.transcription_details);
    console.log(`\n${video.title}`);
    console.log(`Tone: ${details.analysis.tone}`);
    console.log(`Environment: ${details.analysis.environment}`);
    console.log(`Speakers: ${details.analysis.speakers.join(', ')}`);
  });
}

analyzeTranscriptions(1);
```

---

## Webhook Support (Future)

Pianificato per versioni future:
- Webhook per completamento trascrizioni
- Webhook per nuovi video salvati
- Notifiche real-time

---

## Best Practices

1. **Rate Limiting**: Rispetta i rate limits di TikTok
2. **Batch Size**: Non superare 20-30 video per batch con trascrizione
3. **Error Handling**: Implementa retry logic per errori temporanei
4. **Caching**: Cachea i risultati delle ricerche quando possibile
5. **Storage**: Monitora lo spazio utilizzato per video/audio
6. **API Keys**: Proteggi le API keys, non esporle nel frontend

---

Per supporto o domande, apri una issue su GitHub.
