import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sendConfirmationEmail } from '../services/emailService';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processRegistration = async () => {
      const pending = sessionStorage.getItem('pendingRegistration');
      if (pending) {
        const formData = JSON.parse(pending);
        try {
          const result = await createRegistration(formData);
          console.log('Registration successful:', result);
          setConfirmationNumber(result.confirmationNumber);
          await sendConfirmationEmail(formData, result.id);
          setRegistrationSuccess(true);
        } catch (err) {
          // Optionally handle error (show message, etc.)
          console.error('Error processing registration after payment:', err);
        } finally {
          // Remove from sessionStorage
          sessionStorage.removeItem('pendingRegistration');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    processRegistration();
  }, []);

  if (isLoading) {
    return (
      <div className="payment-success">
        <div className="loading-spinner"></div>
        <p>Processing your registration...</p>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="success-icon">✓</div>
      {registrationSuccess && (
        <div className="registration-success-message">
          {confirmationNumber && 
          <p>Your registration is successful. Your confirmation number is: {confirmationNumber}</p>}
          <p>A confirmation email has been sent to your email address.</p>
        </div>
      )}
      <p>Thank you for your contribution.</p>
      <p>We truly appreciate your support.</p>
      <Link to="/" className="home-button">
        Return to Home
      </Link>
    </div>
  );
};

export default PaymentSuccess; 