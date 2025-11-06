const { testConnection } = require('../../../lib/db');

/**
 * POST /api/settings/test-connection - Test database connection
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await testConnection();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Database connection successful',
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
