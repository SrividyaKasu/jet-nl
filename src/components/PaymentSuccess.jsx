import React from 'react';
import { Link } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  return (
    <div className="payment-success">
      <div className="success-icon">✓</div>
      <h1>Thank You!</h1>
      <p>Your donation has been successfully processed.</p>
      <p>We truly appreciate your support.</p>
      <Link to="/" className="home-button">
        Return to Home
      </Link>
    </div>
  );
};

export default PaymentSuccess; 