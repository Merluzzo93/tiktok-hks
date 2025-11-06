const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

/**
 * Download file from URL
 */
async function downloadFile(url, outputPath) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'arraybuffer',
    timeout: 60000, // 60 seconds
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  await writeFile(outputPath, response.data);
  return outputPath;
}

/**
 * Extract audio from video using ffmpeg
 */
async function extractAudio(videoPath, audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .on('end', () => resolve(audioPath))
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * Extract cover image from video
 */
async function extractCover(videoPath, coverPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: path.basename(coverPath),
        folder: path.dirname(coverPath),
        size: '1920x1080'
      })
      .on('end', () => resolve(coverPath))
      .on('error', (err) => reject(err));
  });
}

/**
 * Download and process TikTok video
 * @param {Object} videoData - TikTok video data from API
 * @param {number} projectId - Project ID
 * @param {string} category - Video category (main_videos, competitor_videos, competitor_user_videos)
 * @returns {Promise<Object>} Paths to downloaded files
 */
async function downloadAndProcessVideo(videoData, projectId, category) {
  const baseDir = path.join(process.cwd(), 'public', 'downloads', `project_${projectId}`, category);
  await ensureDir(baseDir);

  const videoId = videoData.video_id || videoData.id;
  const timestamp = Date.now();

  const videoPath = path.join(baseDir, `${videoId}_${timestamp}.mp4`);
  const audioPath = path.join(baseDir, `${videoId}_${timestamp}.mp3`);
  const coverPath = path.join(baseDir, `${videoId}_${timestamp}.jpg`);

  try {
    // Download video (use play URL or download URL)
    const videoUrl = videoData.play || videoData.download || videoData.video?.play;

    if (!videoUrl) {
      throw new Error('No video URL found in video data');
    }

    console.log(`Downloading video ${videoId} from ${videoUrl}`);
    await downloadFile(videoUrl, videoPath);

    // Extract audio
    console.log(`Extracting audio from video ${videoId}`);
    await extractAudio(videoPath, audioPath);

    // Extract cover (or download existing cover)
    console.log(`Extracting cover from video ${videoId}`);
    if (videoData.cover || videoData.video?.cover) {
      await downloadFile(videoData.cover || videoData.video.cover, coverPath);
    } else {
      await extractCover(videoPath, coverPath);
    }

    // Return relative paths for database storage
    const relativeBasePath = `/downloads/project_${projectId}/${category}`;
    return {
      videoPath: `${relativeBasePath}/${path.basename(videoPath)}`,
      audioPath: `${relativeBasePath}/${path.basename(audioPath)}`,
      coverPath: `${relativeBasePath}/${path.basename(coverPath)}`,
      absoluteAudioPath: audioPath // For transcription
    };
  } catch (error) {
    // Clean up any partial downloads
    try {
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }

    throw error;
  }
}

module.exports = {
  downloadFile,
  extractAudio,
  extractCover,
  downloadAndProcessVideo,
  ensureDir
};
