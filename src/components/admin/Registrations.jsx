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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const registrationsPerPage = 10;

  // Get current registrations
  const indexOfLastRegistration = currentPage * registrationsPerPage;
  const indexOfFirstRegistration = indexOfLastRegistration - registrationsPerPage;
  const currentRegistrations = filteredRegistrations.slice(indexOfFirstRegistration, indexOfLastRegistration);
  const totalPages = Math.ceil(filteredRegistrations.length / registrationsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset page when location or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, searchQuery]);

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

  // Filter registrations when location selection or search query changes
  useEffect(() => {
    let filtered = registrations;

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(reg => {
        const regLocation = reg.eventLocation || reg.location;
        return regLocation?.toLowerCase() === selectedLocation.toLowerCase();
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.name?.toLowerCase().includes(query) ||
        reg.email?.toLowerCase().includes(query) ||
        reg.phone?.toLowerCase().includes(query) ||
        reg.confirmationNumber?.toLowerCase().includes(query) ||
        reg.city?.toLowerCase().includes(query)
      );
    }

    setFilteredRegistrations(filtered);
  }, [selectedLocation, registrations, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredRegistrations.map(reg => ({
        'Confirmation #': reg.confirmationNumber || 'N/A',
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
        <h1>Registrations</h1>
        <div className="admin-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name, email, phone, confirmation #..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="location-select"
          >
            <option value="all">All Locations</option>
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>
                {loc.charAt(0).toUpperCase() + loc.slice(1)}
              </option>
            ))}
          </select>
          <button onClick={exportToExcel} className="export-btn">
            Export to Excel
          </button>
        </div>
      </div>

      <div className="registrations-table-container">
        <table className="registrations-table">
          <thead>
            <tr>
              <th>Confirmation #</th>
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
            {currentRegistrations.map(reg => (
              <tr key={reg.id}>
                <td>{reg.confirmationNumber || 'N/A'}</td>
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

      {filteredRegistrations.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          <button 
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Registrations; 