import React, { useState } from 'react';
import './DonateForm.css';

const DonateForm = () => {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedAmounts = [10, 25, 50, 100, 250];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: 'Donation to JET NL',
          email: email || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create payment link');
      }

      if (!data.url) {
        throw new Error('No payment URL received from server');
      }

      // Redirect to Stripe payment page
      window.location.href = data.url;
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donate-form">
      <h2>Make a Donation</h2>
      <p>Your support helps us continue our mission</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="amount-buttons">
          {predefinedAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`amount-button ${amount === preset.toString() ? 'active' : ''}`}
              onClick={() => setAmount(preset.toString())}
            >
              €{preset}
            </button>
          ))}
        </div>

        <div className="form-group">
          <label htmlFor="custom-amount">Custom Amount (€)</label>
          <input
            type="number"
            id="custom-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email (optional)</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading || !amount}
        >
          {loading ? 'Processing...' : 'Donate Now'}
        </button>
      </form>
    </div>
  );
};

export default DonateForm; 