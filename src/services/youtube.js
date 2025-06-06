import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CHANNEL_ID = '@jetworld';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchChannelVideos = async () => {
  try {
    // First, get the channel ID from the custom URL
    const channelResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: CHANNEL_ID,
        type: 'channel',
        key: YOUTUBE_API_KEY,
      },
    });

    const actualChannelId = channelResponse.data.items[0]?.id?.channelId;

    if (!actualChannelId) {
      throw new Error('Channel not found');
    }

    // Then fetch the channel's videos
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        channelId: actualChannelId,
        maxResults: 50,
        order: 'date',
        type: 'video',
        key: YOUTUBE_API_KEY,
      },
    });

    // Get detailed video information including statistics
    const videoIds = videosResponse.data.items.map(item => item.id.videoId).join(',');
    const videoDetailsResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    // Organize videos by category
    const videos = videoDetailsResponse.data.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.maxres || video.snippet.thumbnails.high,
      publishedAt: video.snippet.publishedAt,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
    }));

    return {
      featured: videos.slice(0, 2),
      recent: videos.slice(2, 8),
      popular: videos
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 6),
    };
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
}; 