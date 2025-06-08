import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './PaymentFailed.css';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'An error occurred during payment processing';

  return (
    <div className="payment-failed">
      <div className="error-icon">✕</div>
      <h1>Payment Failed</h1>
      <p className="error-message">{error}</p>
      <div className="action-buttons">
        <Link to="/donate" className="retry-button">
          Try Again
        </Link>
        <Link to="/" className="home-button">
          Return to Home
        </Link>
      </div>
      <p className="help-text">
        If you continue to experience issues, please contact us at{' '}
        <a href="mailto:support@jetnl.org">support@jetnl.org</a>
      </p>
    </div>
  );
};

export default PaymentFailed; 