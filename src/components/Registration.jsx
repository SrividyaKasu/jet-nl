import React, { useState, useEffect, useRef } from 'react';
import { signInWithGoogle, signOutUser, getCurrentUser, onAuthChange } from '../firebase/authService';
import { createRegistration } from '../firebase/registrationService';
import { sendConfirmationEmail } from '../services/emailService';
import { useCaptcha } from '../hooks/useCaptcha';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './Registration.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    eventLocation: '',
    programType: '',
    numAdults: 1,
    numKids: 0,
    wantsToContribute: false,
    contributionAmount: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState(null);
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const captchaContainer = useRef(null);
  const [captchaRendered, setCaptchaRendered] = useState(false);

  const programTypeOptions = {
    amstelveen: [
      { value: 'darshan', label: 'Darshan (Free)' },
      { value: 'lakshmi-narayana-pooja', label: 'Lakshmi Naryana Pooja (26 EUR/Family)' }
    ],
    denhaag: [
      { value: 'sita-rama-kalyanam', label: 'Sita Rama Kalyanam (Free)' }
    ],
    eindhoven: [
      { value: 'darshan', label: 'Darshan (Free)' },
      { value: 'dhana-lakshmi-pooja', label: 'Dhanalakshmi Pooja (26 EUR/Family)' }
    ]
  };

  const handleCaptchaVerify = (token) => {
    console.log('Captcha verified:', token);
    setError(null);
  };

  const { renderCaptcha } = useCaptcha(handleCaptchaVerify);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);

      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          name: currentUser.displayName || '',
          email: currentUser.email || ''
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (captchaContainer.current && user && !captchaRendered) {
      renderCaptcha(captchaContainer.current);
      setCaptchaRendered(true);
    }
  }, [renderCaptcha, user, captchaRendered]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const { user: signedInUser } = await signInWithGoogle();
      setUser(signedInUser);
      setFormData(prev => ({
        ...prev,
        name: signedInUser.displayName || '',
        email: signedInUser.email || ''
      }));
    } catch (error) {
      console.error('Google sign in failed:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      resetForm();
    } catch (error) {
      console.error('Sign out failed:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let amount = 0;
      const isPooja = formData.programType === 'lakshmi-narayana-pooja' || 
                     formData.programType === 'dhana-lakshmi-pooja';
      const hasCustom = formData.wantsToContribute && formData.contributionAmount;

      if (isPooja && hasCustom) {
        // Convert contribution amount to number only when needed for calculation
        const contributionAmount = parseFloat(formData.contributionAmount) || 0;
        amount = 26 + contributionAmount;
      } else if (isPooja) {
        amount = 26;
      } else if (hasCustom) {
        // Convert contribution amount to number only when needed for calculation
        amount = parseFloat(formData.contributionAmount) || 0;
      }

      // Create a copy of formData to ensure we don't lose any data
      const registrationData = { ...formData };

      if (amount > 0) {
        // Create payment link for the calculated amount
        const response = await fetch('/api/create-payment-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            description: `Registration for ${registrationData.eventLocation} (${registrationData.programType})`,
            email: registrationData.email
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || data.error || 'Failed to create payment link');
        }

        if (!data.url) {
          throw new Error('No payment URL received from server');
        }

        // Store registration data in session storage
        sessionStorage.setItem('pendingRegistration', JSON.stringify(registrationData));

        // Redirect to Stripe payment page
        window.location.href = data.url;
        return;
      }

      const result = await createRegistration(registrationData);
      setConfirmationNumber(result.confirmationNumber);
      
      // Send confirmation email
      await sendConfirmationEmail(registrationData, result.confirmationNumber);
      setSuccess(true);

      // Reset form
      setFormData({
        name: user.displayName || '',
        email: user.email || '',
        phone: '',
        city: '',
        eventLocation: '',
        programType: '',
        numAdults: 1,
        numKids: 0,
        wantsToContribute: false,
        contributionAmount: ''
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: user.displayName || '',
      email: user.email || '',
      phone: '',
      city: '',
      eventLocation: '',
      programType: '',
      numAdults: 1,
      numKids: 0,
      wantsToContribute: false,
      contributionAmount: ''
    });
    setSuccess(false);
    setConfirmationNumber(null);
    setError(null);
    setCaptchaRendered(false);
  };

  const availableProgramTypes = programTypeOptions[formData.eventLocation] || [];

  if (!authInitialized) {
    return (
      <div className="registration">
        <div className="loading-message">
          Initializing...
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="registration-success">
        <h2>Registration Successful!</h2>
        <p>Thank you for registering with JET NL. We will contact you shortly with further details.</p>
        <p className="confirmation-number">
          Your confirmation number: <strong>{confirmationNumber}</strong>
        </p>
        <p>Please save this number for future reference.</p>
        <button
          className="register-again-btn"
          onClick={resetForm}
        >
          Register Another
        </button>
      </div>
    );
  }

  return (
    <div className="registration">
      <div className="registration-header">
        <h1>Program Registration</h1>
        <p>Register for Darshan or Pooja services with JET NL</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!user ? (
        <div className="login-section">
          <p>Please sign in with your Google account to continue with registration</p>
          <button
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      ) : (
        <>
          <div className="user-info">
            <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
            <div className="user-details">
              <p>Signed in as: {user.displayName}</p>
              <button
                className="signout-btn"
                onClick={handleSignOut}
                disabled={loading}
              >
                Sign Out
              </button>
            </div>
          </div>

          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
                disabled={true}
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Enter your city"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventLocation">Event Location *</label>
              <select
                id="eventLocation"
                name="eventLocation"
                value={formData.eventLocation}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select Location</option>
                <option value="amstelveen">Amstelveen</option>
                <option value="denhaag">Den Haag</option>
                <option value="eindhoven">Eindhoven</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="programType">Type of Program *</label>
              <select
                id="programType"
                name="programType"
                value={formData.programType}
                onChange={handleChange}
                required
                disabled={loading || !formData.eventLocation}
              >
                <option value="">Select Program Type</option>
                {availableProgramTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="numAdults">Number of Adults *</label>
                <input
                  type="number"
                  id="numAdults"
                  name="numAdults"
                  value={formData.numAdults}
                  onChange={handleChange}
                  min="1"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group half">
                <label htmlFor="numKids">Number of Children</label>
                <input
                  type="number"
                  id="numKids"
                  name="numKids"
                  value={formData.numKids}
                  onChange={handleChange}
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="wantsToContribute"
                  checked={formData.wantsToContribute}
                  onChange={handleChange}
                />
                I would like to make a contribution
              </label>
            </div>

            {formData.wantsToContribute && (
              <div className="form-group">
                <label htmlFor="contributionAmount">Contribution Amount (€) *</label>
                <input
                  type="number"
                  id="contributionAmount"
                  name="contributionAmount"
                  min="1"
                  step="0.01"
                  value={formData.contributionAmount}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="captcha-container" ref={captchaContainer}></div>

            <button
              type="submit"
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Now'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Registration; 