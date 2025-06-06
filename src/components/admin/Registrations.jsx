import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import './Admin.css';

const Registrations = () => {
  const [registrations, setRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const db = await getDb();
        const registrationsRef = collection(db, 'registrations');
        const querySnapshot = await getDocs(
          query(registrationsRef, orderBy('createdAt', 'desc'))
        );
        
        const registrationsByLocation = {
          all: []
        };
        
        querySnapshot.forEach((doc) => {
          const data = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()?.toLocaleString() || 'N/A'
          };
          
          // Add to 'all' category
          registrationsByLocation.all.push(data);
          
          // Add to location-specific category
          if (!registrationsByLocation[data.eventLocation]) {
            registrationsByLocation[data.eventLocation] = [];
          }
          registrationsByLocation[data.eventLocation].push(data);
        });
        
        setRegistrations(registrationsByLocation);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        setError('Failed to load registrations. Please try again later.');
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-message">Loading registrations...</div>
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

  const displayRegistrations = registrations[selectedLocation] || [];

  return (
    <div className="admin-container">
      <h1>Registrations List</h1>
      
      <div className="filter-section">
        <label htmlFor="locationFilter">Filter by Event Location: </label>
        <select
          id="locationFilter"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="location-filter"
        >
          <option value="all">All Locations</option>
          {Object.keys(registrations)
            .filter(location => location !== 'all')
            .sort()
            .map(location => (
              <option key={location} value={location}>
                {location.charAt(0).toUpperCase() + location.slice(1)}
              </option>
            ))}
        </select>
      </div>

      <div className="registrations-table-container">
        <table className="registrations-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Event Location</th>
              <th>Program Type</th>
              <th>Adults</th>
              <th>Children</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {displayRegistrations.map((reg) => (
              <tr key={reg.id}>
                <td>{reg.name}</td>
                <td>{reg.email}</td>
                <td>{reg.phone}</td>
                <td>{reg.city}</td>
                <td>{reg.eventLocation}</td>
                <td>{reg.programType}</td>
                <td>{reg.numAdults}</td>
                <td>{reg.numKids}</td>
                <td>{reg.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="registration-summary">
        <p>Total Registrations: {displayRegistrations.length}</p>
      </div>
    </div>
  );
};

export default Registrations; 