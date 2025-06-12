import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sendConfirmationEmail } from '../services/emailService';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState(null);

  useEffect(() => {
    const processRegistration = async () => {
      const pending = sessionStorage.getItem('pendingRegistration');
      if (pending) {
        const formData = JSON.parse(pending);
        try {
          // Save to Firestore
          const docRef = await addDoc(collection(db, 'registrations'), {
            ...formData,
            createdAt: serverTimestamp()
          });
          // Send confirmation email
          await sendConfirmationEmail(formData, docRef.id);
          setRegistrationSuccess(true);
          setConfirmationNumber(docRef.id);
        } catch (err) {
          // Optionally handle error (show message, etc.)
          console.error('Error processing registration after payment:', err);
        }
        // Remove from sessionStorage
        sessionStorage.removeItem('pendingRegistration');
      }
    };
    processRegistration();
  }, []);

  return (
    <div className="payment-success">
      <div className="success-icon">✓</div>
      <h1>Thank You!</h1>
      <p>Your contribution has been successfully processed.</p>
      <p>We truly appreciate your support.</p>
      {registrationSuccess && (
        <div className="registration-success-message">
          <h2>Registration Successful!</h2>
          {confirmationNumber && <p>Your confirmation number is: {confirmationNumber}</p>}
          <p>A confirmation email has been sent to your email address.</p>
        </div>
      )}
      <Link to="/" className="home-button">
        Return to Home
      </Link>
    </div>
  );
};

export default PaymentSuccess; 