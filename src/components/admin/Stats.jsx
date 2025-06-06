import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import './Admin.css';

const Stats = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const db = await getDb();
        const registrationsRef = collection(db, 'registrations');
        const querySnapshot = await getDocs(query(registrationsRef));
        
        const cityStats = {};
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const city = data.eventLocation;
          
          if (!cityStats[city]) {
            cityStats[city] = {
              totalAdults: 0,
              totalChildren: 0,
              darshan: 0,
              pooja: 0
            };
          }
          
          cityStats[city].totalAdults += parseInt(data.numAdults) || 0;
          cityStats[city].totalChildren += parseInt(data.numKids) || 0;
          cityStats[city][data.programType.toLowerCase()]++;
        });
        
        setStats(cityStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load statistics. Please try again later.');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-message">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Calculate totals
  const totals = Object.values(stats).reduce(
    (acc, data) => ({
      totalAdults: acc.totalAdults + data.totalAdults,
      totalChildren: acc.totalChildren + data.totalChildren,
      darshan: acc.darshan + data.darshan,
      pooja: acc.pooja + data.pooja,
    }),
    { totalAdults: 0, totalChildren: 0, darshan: 0, pooja: 0 }
  );

  return (
    <div className="admin-container">
      <h1>Registration Statistics</h1>
      
      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>City</th>
              <th>Total Adults</th>
              <th>Total Children</th>
              <th>Darshan Count</th>
              <th>Pooja Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([city, data]) => (
                <tr key={city}>
                  <td>{city.charAt(0).toUpperCase() + city.slice(1)}</td>
                  <td>{data.totalAdults}</td>
                  <td>{data.totalChildren}</td>
                  <td>{data.darshan}</td>
                  <td>{data.pooja}</td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>{totals.totalAdults}</td>
              <td>{totals.totalChildren}</td>
              <td>{totals.darshan}</td>
              <td>{totals.pooja}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Stats; 