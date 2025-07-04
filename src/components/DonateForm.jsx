import React, { useState } from 'react';
import './DonateForm.css';

const DonateForm = () => {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedAmounts = [10, 25, 50, 100, 150, 200, 250];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Store donation info in sessionStorage for use after payment success
      const donationData = {
        name,
        email,
        amount: parseFloat(amount),
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem('pendingDonation', JSON.stringify(donationData));

      const response = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: 'Contribution to JET NL',
          email: email,
          name: name,
        }),
      });

      const text = await response.text();
      console.log('Raw API response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse API response:', e);
        throw new Error('Invalid response from server: ' + text.substring(0, 100));
      }

      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(data.details || data.error || 'Failed to create payment link');
      }

      if (!data.url) {
        console.error('Missing URL in response:', data);
        throw new Error('No payment URL received from server');
      }

      console.log('Redirecting to payment URL:', data.url);
      window.location.href = data.url;
    } catch (err) {
      console.error('Detailed API Error:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donate-form">
      <h2>Make a Contribution</h2>
      <p>Your support helps us continue our mission</p>
      <p>As a token of gratitude, all contributions over €150 will receive a special Souvenir personally from Swami Varu carrying his grace and blessings.</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
        </div>

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
          <label htmlFor="custom-amount">Custom Amount (€) *</label>
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

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading || !amount || !name || !email}
        >
          {loading ? 'Processing...' : 'Contribute'}
        </button>
      </form>
    </div>
  );
};

export default DonateForm; 