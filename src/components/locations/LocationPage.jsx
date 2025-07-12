import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import * as XLSX from 'xlsx';
import { useParams } from 'react-router-dom';
import './LocationPage.css';

const LocationPage = () => {
  const { location } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({ adults: 0, kids: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first, 'asc' for oldest first
  const registrationsPerPage = 10;

  // Get current registrations
  const indexOfLastRegistration = currentPage * registrationsPerPage;
  const indexOfFirstRegistration = indexOfLastRegistration - registrationsPerPage;
  const currentRegistrations = filteredRegistrations.slice(indexOfFirstRegistration, indexOfLastRegistration);
  const totalPages = Math.ceil(filteredRegistrations.length / registrationsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const q = query(
          collection(db, 'registrations'),
          where('eventLocation', '==', location),
          orderBy('createdAt', sortOrder)
        );
        
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRegistrations(data);
        setFilteredRegistrations(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError('Failed to load registrations');
        setLoading(false);
      }
    };

    if (location) {
      fetchRegistrations();
    }
  }, [location, sortOrder]);

  // Filter registrations when search query changes
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = registrations.filter(reg => 
        reg.name?.toLowerCase().includes(query) ||
        reg.email?.toLowerCase().includes(query) ||
        reg.phone?.toLowerCase().includes(query) ||
        reg.confirmationNumber?.toLowerCase().includes(query) ||
        reg.city?.toLowerCase().includes(query)
      );
      setFilteredRegistrations(filtered);
    } else {
      setFilteredRegistrations(registrations);
    }
  }, [searchQuery, registrations]);

  // Calculate totals when filtered registrations change
  useEffect(() => {
    const newTotals = filteredRegistrations.reduce((acc, reg) => ({
      adults: acc.adults + (parseInt(reg.numAdults) || 0),
      kids: acc.kids + (parseInt(reg.numKids) || 0)
    }), { adults: 0, kids: 0 });
    setTotals(newTotals);
  }, [filteredRegistrations]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    });
  };

  const exportToExcel = () => {
    try {
      const exportData = registrations.map(reg => ({
        'Confirmation #': reg.confirmationNumber || 'N/A',
        'Registration URL': reg.confirmationNumber ? `https://www.jetnl.org/registration/${reg.confirmationNumber}` : 'N/A',
        Name: reg.name,
        Email: reg.email,
        Phone: reg.phone,
        City: reg.city || '',
        EventLocation: reg.eventLocation || '',
        ProgramType: reg.programType || '',
        Adults: reg.numAdults || 0,
        Children: reg.numKids || 0,
        RegistrationDate: reg.createdAt?.toDate?.().toLocaleDateString() || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
      
      const fileName = `${location}_registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Failed to export data');
    }
  };

  if (loading) {
    return <div className="location-page loading">Loading...</div>;
  }

  if (error) {
    return <div className="location-page error">{error}</div>;
  }

  return (
    <div className="location-page">
      <div className="location-header">
        <h1>{location.charAt(0).toUpperCase() + location.slice(1)} Registrations</h1>
        <div className="location-actions">
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
            value={sortOrder}
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          <button onClick={exportToExcel} className="export-btn">
            Export to Excel
          </button>
        </div>
      </div>

      <div className="totals">
        <div className="total-item">
          <span>Total Adults:</span>
          <span>{totals.adults}</span>
        </div>
        <div className="total-item">
          <span>Total Children:</span>
          <span>{totals.kids}</span>
        </div>
      </div>

      <div className="registrations-table-container">
        <table className="registrations-table">
          <thead>
            <tr>
              <th>Confirmation #</th>
              <th>Registration URL</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
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
                <td>
                  {reg.confirmationNumber ? (
                    <div className="url-cell">
                      <input
                        type="text"
                        value={`https://www.jetnl.org/registration/${reg.confirmationNumber}`}
                        readOnly
                        className="url-input"
                      />
                      <button
                        onClick={() => copyToClipboard(`https://www.jetnl.org/registration/${reg.confirmationNumber}`)}
                        className="copy-btn"
                        title="Copy URL"
                      >
                        📋
                      </button>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{reg.name}</td>
                <td>{reg.email}</td>
                <td>{reg.phone}</td>
                <td>{reg.city}</td>
                <td>{reg.programType}</td>
                <td>{reg.numAdults || 0}</td>
                <td>{reg.numKids || 0}</td>
                <td>
                  {reg.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {registrations.length === 0 && (
          <div className="no-data">
            No registrations found for {location}
          </div>
        )}
      </div>

      {registrations.length > 0 && (
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

export default LocationPage; 