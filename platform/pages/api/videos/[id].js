const { query } = require('../../../lib/db');

/**
 * GET /api/videos/[id] - Get video by ID
 * DELETE /api/videos/[id] - Delete video
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const result = await query(
        'SELECT * FROM videos WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Video not found'
        });
      }

      res.status(200).json({
        success: true,
        video: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await query(
        'DELETE FROM videos WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Video not found'
        });
      }

      // TODO: Delete files from filesystem

      res.status(200).json({
        success: true,
        message: 'Video deleted successfully'
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
