const { query } = require('../../../lib/db');

/**
 * GET /api/projects - Get all projects
 * POST /api/projects - Create new project
 */
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT
          p.*,
          COUNT(DISTINCT v.id) as video_count,
          COUNT(DISTINCT CASE WHEN v.video_category = 'main_videos' THEN v.id END) as main_videos_count,
          COUNT(DISTINCT CASE WHEN v.video_category = 'competitor_videos' THEN v.id END) as competitor_videos_count,
          COUNT(DISTINCT CASE WHEN v.video_category = 'competitor_user_videos' THEN v.id END) as competitor_user_videos_count
        FROM projects p
        LEFT JOIN videos v ON p.id = v.project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `);

      res.status(200).json({
        success: true,
        projects: result.rows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Project name is required'
        });
      }

      const result = await query(
        'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
        [name, description || '']
      );

      res.status(201).json({
        success: true,
        project: result.rows[0]
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
