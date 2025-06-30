import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRegistrationByConfirmationNumber, updateRegistrationStatus } from '../firebase/registrationService';
import { getCurrentUser } from '../firebase/authService';
import './RegistrationDetails.css';

function RegistrationDetails() {
  const { id } = useParams();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function fetchDocument() {
      try {
        setLoading(true);
        setError(null);
        const registrationData = await getRegistrationByConfirmationNumber(id);
        console.log('Registration data:', registrationData);
        setRegistration(registrationData);
      } catch (error) {
        console.error('Error getting registration:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchDocument();
    }
  }, [id]);

  useEffect(() => {
    async function getCurrentUserEmail() {
      try {
        const user = await getCurrentUser();
        if (user && user.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    }

    getCurrentUserEmail();
  }, []);

  const handleVerify = async () => {
    if (!registration || !userEmail) return;

    try {
      setVerifying(true);
      await updateRegistrationStatus(registration.id, 'verified');
      
      // Update local state
      setRegistration(prev => ({
        ...prev,
        status: 'verified'
      }));
      
      alert('Registration verified successfully!');
    } catch (error) {
      console.error('Error verifying registration:', error);
      alert('Failed to verify registration: ' + error.message);
    } finally {
      setVerifying(false);
    }
  };

  // Check if user can verify this registration
  const canVerify = userEmail === 'jeeyartrustnl@gmail.com' && 
                   registration?.status === 'pending';

  if (loading) return <div className="loading">Loading registration details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!registration) return <div className="not-found">Registration not found.</div>;

  return (
    <div className="registration-details">
      <h2>Registration Details</h2>
      <div className="registration-info">
        <div className="info-section">
          <h3>Confirmation Number</h3>
          <p className="confirmation-number">{registration.confirmationNumber}</p>
        </div>

        <div className="info-section">
          <h3>Event Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Event Location:</label>
              <span>{registration.eventLocation}</span>
            </div>
            <div className="info-item">
              <label>Program Type:</label>
              <span>{registration.programType}</span>
            </div>
            <div className="info-item">
              <label>Number of Adults:</label>
              <span>{registration.numAdults}</span>
            </div>
            {registration.numChildren && (
              <div className="info-item">
                <label>Number of Children:</label>
                <span>{registration.numChildren}</span>
              </div>
            )}
          </div>
        </div>

        <div className="info-section">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{registration.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{registration.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{registration.phone}</span>
            </div>
            <div className="info-item">
              <label>City:</label>
              <span>{registration.city}</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Registration Status</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Status:</label>
              <span className={`status ${registration.status}`}>
                {registration.status}
              </span>
            </div>
            {registration.createdAt && (
              <div className="info-item">
                <label>Created:</label>
                <span>
                  {registration.createdAt.toDate ? 
                    registration.createdAt.toDate().toLocaleString() : 
                    new Date(registration.createdAt).toLocaleString()
                  }
                </span>
              </div>
            )}
          </div>
          
          {canVerify && (
            <div className="verify-section">
              <button 
                className="verify-button"
                onClick={handleVerify}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Verify Registration'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistrationDetails;
