const { TiktokApiFacade } = require('tiktok-hks');

/**
 * POST /api/scrape/user-videos - Get all videos from a TikTok user
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, count = 35 } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }

    // Get user info first
    const userInfo = await TiktokApiFacade.getUserInfo('GET', username);

    if (!userInfo || !userInfo.data || userInfo.code !== 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user videos
    let allVideos = [];
    let cursor = 0;
    let hasMore = true;

    while (hasMore && allVideos.length < count) {
      const videosData = await TiktokApiFacade.getVideosByUser('GET', username, Math.min(35, count - allVideos.length), cursor);

      if (videosData && videosData.code === 0 && videosData.data && videosData.data.videos) {
        allVideos = allVideos.concat(videosData.data.videos);
        hasMore = videosData.data.hasMore;
        cursor = videosData.data.cursor;

        // Rate limiting - wait 1 second between requests
        if (hasMore && allVideos.length < count) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        hasMore = false;
      }
    }

    res.status(200).json({
      success: true,
      user: userInfo.data,
      videos: allVideos,
      total: allVideos.length
    });
  } catch (error) {
    console.error('Error scraping user videos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
