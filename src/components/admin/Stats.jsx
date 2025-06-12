import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Admin.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Stats = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getLocationUrl = (location) => {
    return `${window.location.origin}/location/${location}`;
  };

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

  // Prepare data for the chart
  const sortedCities = Object.keys(stats).sort();
  
  const chartData = {
    labels: sortedCities,
    datasets: [
      {
        label: 'Adults',
        data: sortedCities.map(city => stats[city].totalAdults),
        backgroundColor: 'rgba(139, 0, 0, 0.7)',
        borderColor: 'rgba(139, 0, 0, 1)',
        borderWidth: 1
      },
      {
        label: 'Children',
        data: sortedCities.map(city => stats[city].totalChildren),
        backgroundColor: 'rgba(255, 140, 0, 0.7)',
        borderColor: 'rgba(255, 140, 0, 1)',
        borderWidth: 1
      },
      {
        label: 'Darshan',
        data: sortedCities.map(city => stats[city].darshan),
        backgroundColor: 'rgba(0, 100, 0, 0.7)',
        borderColor: 'rgba(0, 100, 0, 1)',
        borderWidth: 1
      },
      {
        label: 'Pooja',
        data: sortedCities.map(city => stats[city].pooja),
        backgroundColor: 'rgba(70, 130, 180, 0.7)',
        borderColor: 'rgba(70, 130, 180, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  return (
    <div className="admin-container">
      <h1>Statistics</h1>

      <div className="stats-section">
        <h2>Registration Statistics</h2>
        <div className="stats-chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
        
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
                    <td>{city}</td>
                    <td>{data.totalAdults}</td>
                    <td>{data.totalChildren}</td>
                    <td>{data.darshan}</td>
                    <td>{data.pooja}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stats; 