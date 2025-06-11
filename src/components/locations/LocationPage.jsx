import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import * as XLSX from 'xlsx';
import { useParams, useNavigate } from 'react-router-dom';
import './LocationPage.css';

const LocationPage = () => {
  const { location, secret } = useParams();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({ adults: 0, kids: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const registrationsPerPage = 10;

  // Get current registrations
  const indexOfLastRegistration = currentPage * registrationsPerPage;
  const indexOfFirstRegistration = indexOfLastRegistration - registrationsPerPage;
  const currentRegistrations = registrations.slice(indexOfFirstRegistration, indexOfLastRegistration);
  const totalPages = Math.ceil(registrations.length / registrationsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Validate location and secret
  useEffect(() => {
    const locationSecrets = {
      amstelveen: import.meta.env.VITE_AMSTELVEEN_SECRET || 'amstelveen123',
      denhaag: import.meta.env.VITE_DENHAAG_SECRET || 'denhaag456',
      eindhoven: import.meta.env.VITE_EINDHOVEN_SECRET || 'eindhoven789'
    };
    
    const validSecret = locationSecrets[location];
    
    if (!validSecret || validSecret !== secret) {
      navigate('/404');
      return;
    }
  }, [location, secret, navigate]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const q = query(
          collection(db, 'registrations'),
          where('eventLocation', '==', location)
        );
        
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Fetched registrations for location:', location, data);
        setRegistrations(data);
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
  }, [location]);

  // Calculate totals when registrations change
  useEffect(() => {
    const newTotals = registrations.reduce((acc, reg) => ({
      adults: acc.adults + (parseInt(reg.numAdults) || 0),
      kids: acc.kids + (parseInt(reg.numKids) || 0)
    }), { adults: 0, kids: 0 });
    setTotals(newTotals);
  }, [registrations]);

  const exportToExcel = () => {
    try {
      const exportData = registrations.map(reg => ({
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
        <button onClick={exportToExcel} className="export-button">
          Export to Excel
        </button>
      </div>

      <div className="registration-summary">
        <div className="summary-item">
          <span className="summary-label">Total Adults:</span>
          <span className="summary-value">{totals.adults}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Children:</span>
          <span className="summary-value">{totals.kids}</span>
        </div>
      </div>

      <div className="registrations-table-container">
        <table className="registrations-table">
          <thead>
            <tr>
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
                <td>{reg.name}</td>
                <td>{reg.email}</td>
                <td>{reg.phone}</td>
                <td>{reg.city}</td>
                <td>{reg.programType}</td>
                <td>{reg.numAdults || 0}</td>
                <td>{reg.numKids || 0}</td>
                <td>{reg.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}</td>
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