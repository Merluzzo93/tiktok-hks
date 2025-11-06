const { Pool } = require('pg');

let pool = null;

/**
 * Get or create database connection pool
 */
function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

/**
 * Initialize database schema
 */
async function initializeDatabase() {
  const client = await getPool().connect();

  try {
    // Create settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create videos table
    await client.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        video_category VARCHAR(50) NOT NULL,
        tiktok_id VARCHAR(255) UNIQUE NOT NULL,
        tiktok_url TEXT NOT NULL,
        username VARCHAR(255),
        title TEXT,
        duration INTEGER,
        play_count BIGINT,
        digg_count BIGINT,
        comment_count BIGINT,
        share_count BIGINT,
        download_count BIGINT,
        create_time BIGINT,
        region VARCHAR(10),
        video_file_path TEXT,
        audio_file_path TEXT,
        cover_image_path TEXT,
        transcription TEXT,
        transcription_details JSONB,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_videos_project_id ON videos(project_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(video_category)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_videos_username ON videos(username)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Query the database
 */
async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    return { success: true, timestamp: result.rows[0].now };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a setting value
 */
async function getSetting(key) {
  const result = await query('SELECT value FROM settings WHERE key = $1', [key]);
  return result.rows[0]?.value || null;
}

/**
 * Set a setting value
 */
async function setSetting(key, value) {
  await query(`
    INSERT INTO settings (key, value, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (key)
    DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
  `, [key, value]);
}

module.exports = {
  getPool,
  query,
  initializeDatabase,
  testConnection,
  getSetting,
  setSetting
};
