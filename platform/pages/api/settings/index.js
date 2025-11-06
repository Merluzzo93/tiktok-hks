const { getSetting, setSetting, testConnection, initializeDatabase } = require('../../../lib/db');
const { resetOpenAIClient } = require('../../../lib/openai');

/**
 * GET /api/settings - Get all settings
 * POST /api/settings - Update settings
 */
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const openaiKey = await getSetting('openai_api_key');
      const databaseUrl = await getSetting('database_url');

      res.status(200).json({
        success: true,
        settings: {
          openai_api_key: openaiKey ? '***' + openaiKey.slice(-4) : null,
          database_url: databaseUrl ? '***' + databaseUrl.split('@')[1]?.slice(0, 20) : null,
          has_openai_key: !!openaiKey,
          has_database_url: !!databaseUrl
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { openai_api_key, database_url } = req.body;

      if (openai_api_key) {
        await setSetting('openai_api_key', openai_api_key);
        resetOpenAIClient(); // Reset client to use new key
      }

      if (database_url) {
        await setSetting('database_url', database_url);
        // Update DATABASE_URL environment variable
        process.env.DATABASE_URL = database_url;
      }

      res.status(200).json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
