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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const db = await getDb();
        const registrationsRef = collection(db, 'registrations');
        const querySnapshot = await getDocs(query(registrationsRef));
        
        const locationStats = {};
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const location = data.eventLocation;
          
          if (!locationStats[location]) {
            locationStats[location] = {
              totalAdults: 0,
              totalChildren: 0,
              programs: {
                'darshan': 0,
                'lakshmi-narayana-pooja': 0,
                'dhana-lakshmi-pooja': 0,
                'sita-rama-kalyanam': 0
              }
            };
          }
          
          locationStats[location].totalAdults += parseInt(data.numAdults) || 0;
          locationStats[location].totalChildren += parseInt(data.numKids) || 0;
          
          // Count program types
          if (data.programType) {
            locationStats[location].programs[data.programType] = 
              (locationStats[location].programs[data.programType] || 0) + 1;
          }
        });
        
        setStats(locationStats);
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
  const sortedLocations = Object.keys(stats).sort();
  
  const chartData = {
    labels: sortedLocations,
    datasets: [
      {
        label: 'Adults',
        data: sortedLocations.map(location => stats[location].totalAdults),
        backgroundColor: 'rgba(139, 0, 0, 0.7)',
        borderColor: 'rgba(139, 0, 0, 1)',
        borderWidth: 1
      },
      {
        label: 'Children',
        data: sortedLocations.map(location => stats[location].totalChildren),
        backgroundColor: 'rgba(255, 140, 0, 0.7)',
        borderColor: 'rgba(255, 140, 0, 1)',
        borderWidth: 1
      }
    ]
  };

  const programChartData = {
    labels: sortedLocations,
    datasets: [
      {
        label: 'Darshan',
        data: sortedLocations.map(location => stats[location].programs['darshan'] || 0),
        backgroundColor: 'rgba(0, 100, 0, 0.7)',
        borderColor: 'rgba(0, 100, 0, 1)',
        borderWidth: 1
      },
      {
        label: 'Lakshmi Narayana Pooja',
        data: sortedLocations.map(location => stats[location].programs['lakshmi-narayana-pooja'] || 0),
        backgroundColor: 'rgba(70, 130, 180, 0.7)',
        borderColor: 'rgba(70, 130, 180, 1)',
        borderWidth: 1
      },
      {
        label: 'Dhana Lakshmi Pooja',
        data: sortedLocations.map(location => stats[location].programs['dhana-lakshmi-pooja'] || 0),
        backgroundColor: 'rgba(128, 0, 128, 0.7)',
        borderColor: 'rgba(128, 0, 128, 1)',
        borderWidth: 1
      },
      {
        label: 'Sita Rama Kalyanam',
        data: sortedLocations.map(location => stats[location].programs['sita-rama-kalyanam'] || 0),
        backgroundColor: 'rgba(255, 69, 0, 0.7)',
        borderColor: 'rgba(255, 69, 0, 1)',
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
          <h3>Total Registrations by Location</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="stats-chart-container">
          <h3>Program Types by Location</h3>
          <Bar data={programChartData} options={chartOptions} />
        </div>
        
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Total Adults</th>
                <th>Total Children</th>
                <th>Darshan</th>
                <th>Lakshmi Narayana Pooja</th>
                <th>Dhana Lakshmi Pooja</th>
                <th>Sita Rama Kalyanam</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([location, data]) => (
                  <tr key={location}>
                    <td>{location}</td>
                    <td>{data.totalAdults}</td>
                    <td>{data.totalChildren}</td>
                    <td>{data.programs['darshan'] || 0}</td>
                    <td>{data.programs['lakshmi-narayana-pooja'] || 0}</td>
                    <td>{data.programs['dhana-lakshmi-pooja'] || 0}</td>
                    <td>{data.programs['sita-rama-kalyanam'] || 0}</td>
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