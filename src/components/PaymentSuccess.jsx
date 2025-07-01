import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sendConfirmationEmail, sendDonationConfirmationEmail } from '../services/emailService';
import { createRegistration } from '../firebase/registrationService';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState(null);
  const [donationAmount, setDonationAmount] = useState(null);
  const [donorName, setDonorName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      // Check for pending registration
      const pendingRegistration = sessionStorage.getItem('pendingRegistration');
      const pendingDonation = sessionStorage.getItem('pendingDonation');

      try {
        if (pendingRegistration) {
          const formData = JSON.parse(pendingRegistration);
          // Create registration with confirmation number
          const result = await createRegistration(formData);
          setConfirmationNumber(result.confirmationNumber);
          
          // Send confirmation email
          await sendConfirmationEmail(formData, result.confirmationNumber);
          setRegistrationSuccess(true);
          
          // Remove from sessionStorage
          sessionStorage.removeItem('pendingRegistration');
        }

        if (pendingDonation) {
          const donationData = JSON.parse(pendingDonation);
          
          // Store donation in Firebase
          await addDoc(collection(db, 'donations'), {
            name: donationData.name,
            email: donationData.email,
            amount: donationData.amount,
            timestamp: serverTimestamp(),
            paymentStatus: 'completed'
          });

          // Send donation confirmation email
          await sendDonationConfirmationEmail(donationData);
          
          setDonationSuccess(true);
          setDonationAmount(donationData.amount);
          setDonorName(donationData.name);
          
          // Remove from sessionStorage
          sessionStorage.removeItem('pendingDonation');
        }
      } catch (err) {
        console.error('Error processing payment success:', err);
      } finally {
        setIsLoading(false);
      }
    };

    processPaymentSuccess();
  }, []);

  if (isLoading) {
    return (
      <div className="payment-success">
        <div className="loading-spinner"></div>
        <p>Processing your payment...</p>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="success-icon">✓</div>
      
      {registrationSuccess && (
        <div className="registration-success-message">
          <h2>Registration Successful!</h2>
          {confirmationNumber && 
            <p>Your registration confirmation number is: <strong>{confirmationNumber}</strong></p>}
          <p>A confirmation email has been sent to your email address.</p>
        </div>
      )}

      {donationSuccess && (
        <div className="donation-success-message">
          <h2>Thank You for Your Contribution!</h2>
          <p>Dear {donorName}, your generous contribution of <strong>€{donationAmount}</strong> has been received successfully.</p>
          {donationAmount >= 150 && (
            <p className="souvenir-message">
              🎁 As a token of our gratitude, you will receive a special Souvenir personally from Swami Varu carrying his grace and blessings.
            </p>
          )}
          <p>A confirmation email has been sent to your email address.</p>
          <p>Your support helps us continue our spiritual and educational mission.</p>
        </div>
      )}

      {!registrationSuccess && !donationSuccess && (
        <div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your payment.</p>
        </div>
      )}

      <Link to="/" className="home-button">
        Return to Home
      </Link>
    </div>
  );
};

export default PaymentSuccess; 