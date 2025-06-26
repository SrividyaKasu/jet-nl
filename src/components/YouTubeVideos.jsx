import React, { useState, useEffect } from 'react';
import './YouTubeVideos.css';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCHF3at3YvwCUdJL7xNSJYeQ';
const CACHE_DURATION = 1;

const YouTubeVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch videos');
            }

            const data = await response.json();

            const formattedVideos = data.items
                .filter(item => item.id.kind === 'youtube#video')
                .map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail:
                        item.snippet.thumbnails.maxres?.url ||
                        item.snippet.thumbnails.standard?.url ||
                        item.snippet.thumbnails.high?.url ||
                        item.snippet.thumbnails.medium?.url ||
                        item.snippet.thumbnails.default?.url,
                    publishedAt: item.snippet.publishedAt,
                    description: item.snippet.description,
                }));

            const cacheData = {
                videos: formattedVideos,
                timestamp: Date.now(),
            };
            localStorage.setItem('youtubeVideos', JSON.stringify(cacheData));

            setVideos(formattedVideos);
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getCachedVideos = () => {
        const cached = localStorage.getItem('youtubeVideos');
        if (!cached) return null;

        const { videos: cachedVideos, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return cachedVideos;
        }
        return null;
    };

    useEffect(() => {
        const cached = getCachedVideos();
        if (cached) {
            setVideos(cached);
            setLoading(false);
        } else {
            fetchVideos();
        }
    }, []);


    if (loading) {
        return (
            <div className="youtube-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading latest videos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="youtube-container">
                <div className="error-container">
                    <h2>Error Loading Videos</h2>
                    <p>{error}</p>
                    <button onClick={fetchVideos} className="retry-button">Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="youtube-container">
             <div className="subscribe-section">
                <a
                    href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="subscribe-button"
                >
                    Subscribe to Channel
                </a>
            </div>
            <div className="youtube-header">
                <h2>Latest Videos</h2>
            </div>

           
            <div className="videos-grid">
                {videos.map((video) => (

                    <div key={video.id} className="video-card">
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                            <iframe
                                title="YouTube video player"
                                src={`https://www.youtube.com/embed/${video.id}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                frameBorder="0"
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YouTubeVideos;
