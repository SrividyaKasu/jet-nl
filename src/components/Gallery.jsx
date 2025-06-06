import React, { useState } from 'react';
import { videoCategories } from '../services/youtube';
import './Gallery.css';

const Gallery = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

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

  const VideoSection = ({ title, videos = [] }) => (
    <section className="video-section">
      <h2>{title}</h2>
      <div className="video-grid">
        {videos.map((video) => (
          <div 
            key={video.id} 
            className="video-card"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="video-thumbnail">
              <img 
                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                onError={(e) => {
                  // If maxresdefault fails, try hqdefault
                  e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                }}
                alt={video.title}
              />
              <div className="play-button">▶</div>
            </div>
            <h3>{video.title}</h3>
            <p className="video-description">{video.description}</p>
          </div>
        ))}
      </div>
    </section>
  );

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
        {Object.entries(videoCategories).map(([key, category]) => (
          <VideoSection 
            key={key}
            title={category.title} 
            videos={category.videos}
          />
        ))}
      </div>

      <VideoModal 
        video={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
    </div>
  );
};

export default Gallery; 