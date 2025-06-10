import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import * as XLSX from 'xlsx';
import './Admin.css';

const LOCATIONS = ['amstelveen', 'denhaag', 'eindhoven'];

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const q = query(collection(db, 'registrations'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Fetched registrations:', data); // Debug log
        setRegistrations(data);
        setFilteredRegistrations(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError('Failed to load registrations');
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // Filter registrations when location selection changes
  useEffect(() => {
    if (selectedLocation === 'all') {
      setFilteredRegistrations(registrations);
    } else {
      const filtered = registrations.filter(reg => {
        // Check both possible field names for location
        const regLocation = reg.eventLocation || reg.location;
        return regLocation?.toLowerCase() === selectedLocation.toLowerCase();
      });
      console.log('Filtered registrations for', selectedLocation, ':', filtered); // Debug log
      setFilteredRegistrations(filtered);
    }
  }, [selectedLocation, registrations]);

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredRegistrations.map(reg => ({
        Name: reg.name,
        Email: reg.email,
        Phone: reg.phone,
        City: reg.city || '',
        EventLocation: reg.eventLocation || reg.location || '',
        ProgramType: reg.programType || '',
        Adults: reg.numAdults || 0,
        Children: reg.numKids || 0,
        RegistrationDate: reg.createdAt?.toDate?.().toLocaleDateString() || 
                         reg.registrationDate?.toDate?.().toLocaleDateString() || 
                         'N/A'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
      
      // Generate filename with location and date
      const locationString = selectedLocation === 'all' ? 'all-locations' : selectedLocation;
      const fileName = `registrations_${locationString}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Failed to export data');
    }
  };

  if (loading) {
    return <div className="admin-content loading">Loading...</div>;
  }

  if (error) {
    return <div className="admin-content error">{error}</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="admin-controls">
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="location-filter"
          >
            <option value="all">All Locations</option>
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>
                {loc.charAt(0).toUpperCase() + loc.slice(1)}
              </option>
            ))}
          </select>
          <button onClick={exportToExcel} className="export-button">
            Export to Excel
          </button>
        </div>
        <h1>Registrations</h1>
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
            {filteredRegistrations.map(reg => (
              <tr key={reg.id}>
                <td>{reg.name}</td>
                <td>{reg.email}</td>
                <td>{reg.phone}</td>
                <td>{reg.city}</td>
                <td>{reg.eventLocation || reg.location}</td>
                <td>{reg.programType}</td>
                <td>{reg.numAdults || 0}</td>
                <td>{reg.numKids || 0}</td>
                <td>
                  {reg.createdAt?.toDate?.().toLocaleDateString() || 
                   reg.registrationDate?.toDate?.().toLocaleDateString() || 
                   'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRegistrations.length === 0 && (
          <div className="no-data">
            No registrations found {selectedLocation !== 'all' ? `for ${selectedLocation}` : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default Registrations; 