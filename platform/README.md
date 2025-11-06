# TikTok Scraper Platform

Piattaforma professionale per lo scraping e l'analisi di video TikTok con trascrizione AI.

## 🚀 Caratteristiche

### Scraping Video
- **Download senza watermark**: Video in alta qualità senza il watermark TikTok
- **Estrazione audio**: Estrazione automatica dell'audio in formato MP3
- **Copertine**: Salvataggio delle copertine dei video
- **Metadati completi**: Statistiche, informazioni autore, engagement

### Trascrizione AI
- **GPT-4 Turbo**: Trascrizione audio professionale con OpenAI Whisper
- **Analisi dettagliata**:
  - Identificazione speaker
  - Analisi ambiente sonoro
  - Rilevamento suoni di sottofondo
  - Analisi tono ed emozioni
  - Identificazione musica
  - Momenti chiave con timestamp

### Organizzazione
- **Progetti multipli**: Organizza i video in progetti separati
- **Categorie video**:
  - Video Principali (del tuo utente)
  - Video Competitor (da keyword)
  - Video Utenti Competitor (da username competitor)
- **Database PostgreSQL**: Storage sicuro e scalabile con Neon
- **Ricerca avanzata**: Filtri per categoria, utente, statistiche

### API Complete
Tutte le funzionalità disponibili via REST API per integrazioni esterne.

## 📋 Prerequisiti

- Node.js >= 14.0.0
- Account Neon PostgreSQL (gratuito su [neon.tech](https://neon.tech))
- OpenAI API Key (per trascrizioni)
- Account Vercel (per deployment)

## 🛠️ Installazione

### 1. Installare le dipendenze

```bash
cd platform
npm install
```

### 2. Configurare le variabili d'ambiente

Copia `.env.example` in `.env` e configura:

```env
DATABASE_URL=postgresql://neondb_owner:password@host/neondb?sslmode=require
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Avviare in sviluppo

```bash
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy su Vercel

### 1. Installa Vercel CLI

```bash
npm install -g vercel
```

### 2. Effettua il login

```bash
vercel login
```

### 3. Deploy

```bash
vercel --prod
```

### 4. Configura le variabili d'ambiente

Nel dashboard Vercel:
1. Vai su Settings > Environment Variables
2. Aggiungi:
   - `DATABASE_URL`: La tua connection string Neon
   - `OPENAI_API_KEY`: La tua API key OpenAI

### 5. Inizializza il database

Dopo il primo deploy, visita:
- `/settings` - Configura le API keys
- Clicca "Inizializza Database" per creare le tabelle

## 📖 Utilizzo

### 1. Configurazione Iniziale

1. Vai su **Impostazioni**
2. Inserisci OpenAI API Key (per trascrizioni)
3. Inserisci Neon Database URL
4. Clicca "Salva Impostazioni"
5. Clicca "Inizializza Database"

### 2. Creare un Progetto

1. Vai su **Progetti**
2. Clicca "Nuovo Progetto"
3. Inserisci nome e descrizione
4. Clicca "Crea Progetto"

### 3. Scraping Video

#### Video Principali (tuo utente)
1. Vai su **Scraper**
2. Seleziona "Video Principali"
3. Inserisci il tuo username TikTok
4. Clicca "Cerca Video"
5. Seleziona i video desiderati
6. Scegli progetto e opzioni
7. Clicca "Salva Video"

#### Video Competitor (keyword)
1. Seleziona "Video Competitor"
2. Inserisci parola chiave (es: "ricette")
3. Scegli il paese
4. Cerca e seleziona i video
5. Salva nel progetto

#### Video Utente Competitor
1. Seleziona "Video Utente Competitor"
2. Inserisci username del competitor
3. Cerca e salva i video

## 🔧 API Endpoints

### Settings
- `GET /api/settings` - Ottieni impostazioni
- `POST /api/settings` - Aggiorna impostazioni
- `POST /api/settings/test-connection` - Testa connessione DB
- `POST /api/settings/init-db` - Inizializza database

### Projects
- `GET /api/projects` - Lista progetti
- `POST /api/projects` - Crea progetto
- `GET /api/projects/[id]` - Dettagli progetto
- `PUT /api/projects/[id]` - Aggiorna progetto
- `DELETE /api/projects/[id]` - Elimina progetto

### Scraping
- `POST /api/scrape/user-videos` - Scarica video utente
- `POST /api/scrape/search-keyword` - Cerca per keyword
- `POST /api/scrape/save-videos` - Salva video (bulk)
- `GET /api/scrape/regions` - Lista regioni disponibili

### Videos
- `GET /api/videos/[id]` - Dettagli video
- `DELETE /api/videos/[id]` - Elimina video

## 📊 Esempio Richiesta API

### Scraping Video Utente

```bash
curl -X POST http://localhost:3000/api/scrape/user-videos \
  -H "Content-Type: application/json" \
  -d '{
    "username": "charlidamelio",
    "count": 10
  }'
```

### Bulk Save con Trascrizione

```bash
curl -X POST http://localhost:3000/api/scrape/save-videos \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "videos": [...],
    "category": "main_videos",
    "downloadMedia": true,
    "transcribe": true
  }'
```

## 📁 Struttura Database

### Tabella `projects`
- `id`: ID progetto
- `name`: Nome progetto
- `description`: Descrizione
- `created_at`: Data creazione

### Tabella `videos`
- `id`: ID video
- `project_id`: ID progetto associato
- `video_category`: Categoria (main_videos, competitor_videos, competitor_user_videos)
- `tiktok_id`: ID video TikTok
- `tiktok_url`: URL originale
- `username`: Username autore
- `title`: Titolo/descrizione
- `duration`: Durata in secondi
- `play_count`: Visualizzazioni
- `digg_count`: Like
- `comment_count`: Commenti
- `share_count`: Condivisioni
- `video_file_path`: Path video scaricato
- `audio_file_path`: Path audio estratto
- `cover_image_path`: Path copertina
- `transcription`: Testo trascrizione
- `transcription_details`: JSON analisi dettagliata
- `metadata`: JSON metadati completi

## ⚠️ Limiti e Considerazioni

### Rate Limits TikTok API
- Maggior parte endpoints: 1 richiesta ogni 10 secondi
- Alcuni endpoints: 1 richiesta al secondo
- Max 50 risultati per richiesta (follower/following)

### Vercel
- Free tier: 10 secondi timeout
- Pro tier: 300 secondi timeout (necessario per bulk operations)
- Considera Vercel Pro per progetti con molti video

### Costi
- **Neon Database**: Free tier 500MB (sufficiente per migliaia di video metadata)
- **OpenAI GPT-4**: ~$0.01 per minuto di audio trascritto
- **Vercel**: Free tier disponibile, Pro $20/mese per funzioni avanzate

## 🐛 Troubleshooting

### Errore "Database connection failed"
- Verifica che la connection string sia corretta
- Assicurati che contenga `?sslmode=require`
- Controlla che il database Neon sia attivo

### Errore "OpenAI API key not configured"
- Vai su Impostazioni e inserisci la tua API key
- Oppure imposta `OPENAI_API_KEY` nelle variabili d'ambiente

### Video non scaricati
- Verifica che la cartella `public/downloads` abbia permessi di scrittura
- Controlla i log per errori specifici
- Alcuni video potrebbero non essere disponibili per il download

### Timeout durante bulk save
- Riduci il numero di video selezionati
- Disabilita la trascrizione per velocizzare
- Considera upgrade a Vercel Pro per timeout più lunghi

## 🔒 Sicurezza

- Le API keys sono salvate nel database criptate
- Mai committare file `.env`
- Usa HTTPS in produzione
- Limita l'accesso al dashboard con autenticazione (da implementare)

## 📝 License

MIT License - Vedi LICENSE file

## 🤝 Contributing

Contributi benvenuti! Apri una issue o pull request.

## 📧 Supporto

Per supporto, apri una issue su GitHub.

---

Sviluppato con ❤️ usando tiktok-hks library
