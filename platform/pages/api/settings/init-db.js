const { initializeDatabase } = require('../../../lib/db');

/**
 * POST /api/settings/init-db - Initialize database schema
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initializeDatabase();

    res.status(200).json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
