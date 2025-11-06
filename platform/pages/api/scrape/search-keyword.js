const { TiktokApiFacade } = require('../../../../index');

/**
 * POST /api/scrape/search-keyword - Search videos by keyword and region
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { keyword, region = 'IT', count = 30 } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }

    let allVideos = [];
    let cursor = 0;
    let hasMore = true;

    while (hasMore && allVideos.length < count) {
      const searchData = await TiktokApiFacade.getVideoByKeyword('GET', keyword, Math.min(30, count - allVideos.length), cursor);

      if (searchData && searchData.code === 0 && searchData.data && searchData.data.videos) {
        // Filter by region if specified
        const videos = region
          ? searchData.data.videos.filter(v => v.region === region)
          : searchData.data.videos;

        allVideos = allVideos.concat(videos);
        hasMore = searchData.data.hasMore;
        cursor = searchData.data.cursor;

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
      keyword,
      region,
      videos: allVideos,
      total: allVideos.length
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
