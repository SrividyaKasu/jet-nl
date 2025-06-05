import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about">
      <section className="hero-section">
        <h1>Our Vision & Mission</h1>
      </section>

      <section className="content-section">
        <div className="overview">
          <p>JET is a Non-Profit organization which is committed to improving human lives through "Education, Service and Ancient Wisdom". For over three decades, we have been providing charitable and philanthropic services LOCALLY, NATIONALLY, and INTERNATIONALLY.</p>
          <p>JET has established various Vedic Research schools to play a proactive and responsible role, to make this a better world.</p>
          <p>JET also educated and groomed several Vedic Scholars of extremely high caliber. JET continues to propagate the sacred ideology of service among individuals as well as to educate future generations.</p>
        </div>

        <div className="vision-mission">
          <div className="vision">
            <h2>Our Vision</h2>
            <p>To empower the impoverished communities across the world to have equal access and opportunities to quality education, healthcare, and self-confidence to live a life filled with dignity and pride.</p>
          </div>

          <div className="mission">
            <h2>Our Mission</h2>
            <ul>
              <li>Serve all beings as service to God – This includes our responsibility to all animals, plants and nature.</li>
              <li>Worship your own and respect all – This helps us to recognize while we want to learn more about our faith, we respect messages of other faiths.</li>
            </ul>
          </div>
        </div>

        <div className="aims">
          <h2>Our Aims</h2>
          <ul>
            <li>To undertake activities in accordance with Vedic principles under the guidance of our acharya HH Chinna Jeeyar Swamy</li>
            <li>To organise seminars, educational camps, workshops and so on to advance our understanding of our religious principles and ethical values</li>
            <li>To promote and protect the physical and mental health of those affected by blindness or cancers</li>
            <li>To advance education by providing and assisting in the provision of facilities</li>
            <li>To undertake activities to provide relief for those who may be affected by natural disasters</li>
            <li>To provide opportunities for doing service through activities that benefit communities locally, nationally and globally</li>
          </ul>
        </div>

        <div className="global-network">
          <h2>Our Global Network</h2>
          <div className="network-grid">
            <div className="network-item">JET Australia</div>
            <div className="network-item">JET India</div>
            <div className="network-item">JET USA</div>
            <div className="network-item">JET Canada</div>
            <div className="network-item">JET Germany</div>
            <div className="network-item">JET New Zealand</div>
            <div className="network-item">JET Singapore</div>
            <div className="network-item">JET Netherlands</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 