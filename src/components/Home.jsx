import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="main-banner">
        <img src="/images/main-banner.png" alt="JETNL Main Banner" className="banner-image" />
      </div>
      
      <section className="travel-schedule">
        <h1>HH Swamiji's NL 2025 Travel Schedule</h1>
        <div className="schedule-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>July 18th 2025</td>
                <td>Lakshmi Naryana Pooja</td>
                <td>US Open Zaal, Bovenkerkerweg 81, 1187 XC Amstelveen</td>
              </tr>
              <tr>
                <td>July 19th 2025</td>
                <td>Sita Rama Kalyanam</td>
                <td>ASAN Arya Samaj Nederland, Van der Kunstraat 75, 2521 BA Den Haag</td>
              </tr>
              <tr>
                <td>July 20th 2025</td>
                <td>Dhanalakshmi Pooja</td>
                <td>Eindhoven</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="connect-section">
        <h2>Connect with us</h2>
        <div className="contact-info">
          <p>✉️ jeeyartrustnl@gmail.com</p>
          <p>📍 Amsterdam, Netherlands</p>
        </div>
      </section>
    </div>
  );
};

export default Home; 