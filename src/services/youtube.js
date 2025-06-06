import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CHANNEL_HANDLE = '@jetworld';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Playlist IDs for different categories
const PLAYLISTS = {
  english: 'PLXI4DZflLxiBhRlBpS-m0ivHfhL-nVlKx', // Truth | Chinna Jeeyar Swamiji playlist
  telugu: 'YOUR_TELUGU_PLAYLIST_ID',
  latest: 'YOUR_LATEST_PLAYLIST_ID',
  dhanurmasam: 'YOUR_DHANURMASAM_PLAYLIST_ID'
};

const fetchPlaylistVideos = async (playlistId) => {
  try {
    const playlistResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/playlistItems`, {
      params: {
        part: 'snippet',
        playlistId: playlistId,
        maxResults: 50,
        key: YOUTUBE_API_KEY,
      },
    });

    const videoIds = playlistResponse.data.items.map(item => item.snippet.resourceId.videoId).join(',');
    
    const videoDetailsResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    return videoDetailsResponse.data.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.maxres || video.snippet.thumbnails.high,
      publishedAt: video.snippet.publishedAt,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
    }));
  } catch (error) {
    console.error(`Error fetching playlist ${playlistId}:`, error);
    return [];
  }
};

export const fetchAllVideos = async () => {
  try {
    // First get channel info
    const handleResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: CHANNEL_HANDLE,
        type: 'channel',
        key: YOUTUBE_API_KEY,
      },
    });

    const channelId = handleResponse.data.items[0]?.id?.channelId;
    if (!channelId) {
      throw new Error('Channel not found');
    }

    const channelResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });

    const channel = channelResponse.data.items[0];

    // Fetch videos from each playlist
    const [englishVideos, teluguVideos, latestVideos, dhanurmsamVideos] = await Promise.all([
      fetchPlaylistVideos(PLAYLISTS.english),
      fetchPlaylistVideos(PLAYLISTS.telugu),
      fetchPlaylistVideos(PLAYLISTS.latest),
      fetchPlaylistVideos(PLAYLISTS.dhanurmasam)
    ]);

    return {
      channelInfo: {
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails.default,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
      },
      categories: {
        english: {
          title: "English Videos",
          videos: englishVideos
        },
        telugu: {
          title: "Telugu Videos",
          videos: teluguVideos
        },
        latest: {
          title: "Latest Videos",
          videos: latestVideos
        },
        dhanurmasam: {
          title: "Dhanurmasam Videos",
          videos: dhanurmsamVideos
        }
      }
    };
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Video categories with direct video IDs
export const videoCategories = {
  english: {
    title: "English Videos",
    videos: [
      {
        id: "03dnOSrj7Lo",
        title: "Sri HH Chinna Jeeyar Swamiji Speech at Global Spirituality Mahotsav",
        description: "Spiritual discourse by HH Chinna Jeeyar Swamiji at the Global Spirituality Mahotsav"
      },
      {
        id: "Ba0LINqffsc",
        title: "108 Divya Desams & Sri Ramanujacharya Tribute",
        description: "Sriman Amogh Deshapathi Ji Visits Statue of Equality "
      }
    ]
  },
  telugu: {
    title: "Telugu Videos",
    videos: [
      {
        id: "63abhO93LIs",
        title: "మోదీ మాటే దేశ ప్రగతికి రక్షణ కోట!",
        description: "శ్రీ చిన్న జీయర్ స్వామిజి ప్రవచనం"
      }
    ]
  },
  latest: {
    title: "Latest Videos",
    videos: [
      {
        id: "KJhfjMsTjJA",
        title: "Chinna Jeeyar Swamy Bhagavad Gita Chapter 3 Episode 34",
        description: "భగవంతుడి నుండి దోచుకుంటున్నామా?"
      },
      {
        id: "Ew80xh29sqA",
        title: "JEఅరిటాకులతో ఆహ్వానం అద్భుతం!...",
        description: "ఆదివాసీయుల ఉచిత సామూహిక కళ్యాణం మహోత్సవము"
      }
    ]
  },
  special: {
    title: "Special Events",
    videos: [
      {
        id: "7l0KH4HzTKA",
        title: "Sri Rama Navami Celebrations",
        description: "శ్రీ సీతారామ కళ్యాణ మహోత్సవం | Sri Rama Navami 2025 | Sri Chinna Jeeyar Swamy | Statue Of Equality"
      }
    ]
  }
}; 