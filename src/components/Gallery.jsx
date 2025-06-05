import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchChannelVideos } from '../services/youtube';
import './Gallery.css';

const Gallery = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: videos, isLoading, isError } = useQuery({
    queryKey: ['videos'],
    queryFn: fetchChannelVideos,
    refetchInterval: 3600000, // Refetch every hour (3600000 ms)
    staleTime: 1800000, // Consider data stale after 30 minutes
  });

  const VideoModal = ({ video, onClose }) => {
    if (!video) return null;

    return (
      <div className="video-modal-overlay" onClick={onClose}>
        <div className="video-modal-content" onClick={e => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>&times;</button>
          <div className="video-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${video.id}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <h3>{video.title}</h3>
          <p>{video.description}</p>
          <div className="video-stats">
            <span>{parseInt(video.viewCount).toLocaleString()} views</span>
            <span>{parseInt(video.likeCount).toLocaleString()} likes</span>
            <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
          </div>
          <a 
            href={`https://www.youtube.com/watch?v=${video.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="watch-on-youtube"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    );
  };

  const VideoSection = ({ title, videos = [], isLoading }) => (
    <section className="video-section">
      <h2>{title}</h2>
      {isLoading ? (
        <div className="loading-skeleton">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="skeleton-card">
              <div className="skeleton-thumbnail"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-description"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="video-card"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="video-thumbnail">
                <img 
                  src={video.thumbnail.url}
                  alt={video.title}
                />
                <div className="play-button">▶</div>
              </div>
              <h3>{video.title}</h3>
              <p className="video-description">{video.description}</p>
              <div className="video-meta">
                <span>{parseInt(video.viewCount).toLocaleString()} views</span>
                <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  if (isError) {
    return (
      <div className="error-container">
        <h2>Error loading videos</h2>
        <p>Please check your internet connection and try again later.</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <section className="hero-section">
        <h1>JET World Videos</h1>
        <p>Watch spiritual discourses and divine events from Jeeyar Educational Trust</p>
        <a 
          href="https://www.youtube.com/@jetworld" 
          target="_blank" 
          rel="noopener noreferrer"
          className="subscribe-button"
        >
          Subscribe to Our Channel
        </a>
      </section>

      <div className="content-section">
        <VideoSection 
          title="Featured Videos" 
          videos={videos?.featured} 
          isLoading={isLoading} 
        />
        <VideoSection 
          title="Recent Videos" 
          videos={videos?.recent} 
          isLoading={isLoading} 
        />
        <VideoSection 
          title="Most Popular" 
          videos={videos?.popular} 
          isLoading={isLoading} 
        />
      </div>

      <VideoModal 
        video={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
    </div>
  );
};

export default Gallery; 