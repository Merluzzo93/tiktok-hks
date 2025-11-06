const { query } = require('../../../lib/db');
const { downloadAndProcessVideo } = require('../../../lib/downloader');
const { transcribeAudio } = require('../../../lib/openai');
const { TiktokApiFacade } = require('../../../../index');

/**
 * POST /api/scrape/save-videos - Bulk save videos to project
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, videos, category, downloadMedia = true, transcribe = true } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Videos array is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required (main_videos, competitor_videos, competitor_user_videos)'
      });
    }

    const savedVideos = [];
    const errors = [];

    for (const videoData of videos) {
      try {
        let videoFilePath = null;
        let audioFilePath = null;
        let coverImagePath = null;
        let transcription = null;
        let transcriptionDetails = null;
        let absoluteAudioPath = null;

        // Get video details with no watermark
        let fullVideoData = videoData;
        if (videoData.video_id && !videoData.play) {
          const videoUrl = `https://www.tiktok.com/@${videoData.author?.unique_id}/video/${videoData.video_id}`;
          const noWatermarkData = await TiktokApiFacade.getVideoNoWaterMark('GET', videoUrl, 1);

          if (noWatermarkData && noWatermarkData.code === 0 && noWatermarkData.data) {
            fullVideoData = { ...videoData, ...noWatermarkData.data };
          }
        }

        // Download and process media if requested
        if (downloadMedia) {
          const downloadResult = await downloadAndProcessVideo(fullVideoData, projectId, category);
          videoFilePath = downloadResult.videoPath;
          audioFilePath = downloadResult.audioPath;
          coverImagePath = downloadResult.coverPath;
          absoluteAudioPath = downloadResult.absoluteAudioPath;

          // Transcribe audio if requested
          if (transcribe && absoluteAudioPath) {
            try {
              const transcriptionResult = await transcribeAudio(absoluteAudioPath);
              transcription = transcriptionResult.text;
              transcriptionDetails = transcriptionResult;
            } catch (transcribeError) {
              console.error(`Error transcribing video ${videoData.video_id}:`, transcribeError);
              errors.push({
                video_id: videoData.video_id,
                error: `Transcription failed: ${transcribeError.message}`
              });
            }
          }
        }

        // Save to database
        const result = await query(`
          INSERT INTO videos (
            project_id,
            video_category,
            tiktok_id,
            tiktok_url,
            username,
            title,
            duration,
            play_count,
            digg_count,
            comment_count,
            share_count,
            download_count,
            create_time,
            region,
            video_file_path,
            audio_file_path,
            cover_image_path,
            transcription,
            transcription_details,
            metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          ON CONFLICT (tiktok_id) DO UPDATE SET
            updated_at = CURRENT_TIMESTAMP,
            play_count = EXCLUDED.play_count,
            digg_count = EXCLUDED.digg_count,
            comment_count = EXCLUDED.comment_count,
            share_count = EXCLUDED.share_count
          RETURNING *
        `, [
          projectId,
          category,
          fullVideoData.video_id || fullVideoData.id,
          fullVideoData.video_url || `https://www.tiktok.com/@${fullVideoData.author?.unique_id}/video/${fullVideoData.video_id}`,
          fullVideoData.author?.unique_id || fullVideoData.username,
          fullVideoData.title || fullVideoData.desc,
          fullVideoData.duration,
          fullVideoData.play_count,
          fullVideoData.digg_count,
          fullVideoData.comment_count,
          fullVideoData.share_count,
          fullVideoData.download_count,
          fullVideoData.create_time,
          fullVideoData.region,
          videoFilePath,
          audioFilePath,
          coverImagePath,
          transcription,
          transcriptionDetails ? JSON.stringify(transcriptionDetails) : null,
          JSON.stringify(fullVideoData)
        ]);

        savedVideos.push(result.rows[0]);

        // Rate limiting - wait between processing videos
        if (downloadMedia) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error saving video ${videoData.video_id}:`, error);
        errors.push({
          video_id: videoData.video_id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      saved: savedVideos.length,
      total: videos.length,
      videos: savedVideos,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error saving videos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Increase API timeout for long operations
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: false,
  },
  maxDuration: 300, // 5 minutes max for Vercel Pro
};
