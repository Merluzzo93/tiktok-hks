const OpenAI = require('openai');
const { getSetting } = require('./db');

let openaiClient = null;

/**
 * Get or create OpenAI client
 */
async function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = await getSetting('openai_api_key') || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    openaiClient = new OpenAI({
      apiKey: apiKey
    });
  }

  return openaiClient;
}

/**
 * Reset OpenAI client (when API key changes)
 */
function resetOpenAIClient() {
  openaiClient = null;
}

/**
 * Transcribe audio file with detailed analysis
 * @param {string} audioFilePath - Path to audio file
 * @returns {Promise<Object>} Transcription with analysis
 */
async function transcribeAudio(audioFilePath) {
  const client = await getOpenAIClient();
  const fs = require('fs');

  try {
    // Transcribe the audio
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment']
    });

    // Analyze the transcription with GPT
    const analysis = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Sei un esperto nell'analisi di audio e video. Analizza la trascrizione fornita e fornisci un'analisi dettagliata in formato JSON con i seguenti campi:
          - speakers: array di speaker identificati (se possibile distinguere più voci)
          - environment: descrizione dell'ambiente sonoro (interno, esterno, rumoroso, silenzioso, ecc.)
          - background_sounds: array di suoni di sottofondo identificati
          - music: presenza di musica (tipo, mood, volume relativo)
          - tone: tono generale del parlato (energetico, calmo, eccitato, serio, ecc.)
          - emotions: emozioni percepite nel parlato
          - pace: ritmo del parlato (veloce, medio, lento)
          - key_moments: array di momenti chiave con timestamp
          - summary: riassunto del contenuto
          - language: lingua identificata
          - accent: accento o dialetto se identificabile`
        },
        {
          role: 'user',
          content: `Trascrizione:\n${transcription.text}\n\nAnalizza questo audio in dettaglio.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const analysisData = JSON.parse(analysis.choices[0].message.content);

    return {
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      words: transcription.words || [],
      segments: transcription.segments || [],
      analysis: analysisData
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

module.exports = {
  getOpenAIClient,
  resetOpenAIClient,
  transcribeAudio
};
