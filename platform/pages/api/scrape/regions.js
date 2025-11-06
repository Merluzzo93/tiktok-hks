const { TiktokApiFacade } = require('tiktok-hks');

/**
 * GET /api/scrape/regions - Get available regions
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const regionsData = await TiktokApiFacade.getRegions('GET');

    if (regionsData && regionsData.code === 0 && regionsData.data) {
      res.status(200).json({
        success: true,
        regions: regionsData.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch regions'
      });
    }
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
