import React, { useState, useEffect, useRef } from 'react';
import { signInWithGoogle, signOutUser, getCurrentUser, onAuthChange } from '../firebase/authService';
import { createRegistration } from '../firebase/registrationService';
import { sendConfirmationEmail } from '../services/emailService';
import { useCaptcha } from '../hooks/useCaptcha';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useSearchParams } from 'react-router-dom';
import './Registration.css';
import Modal from './Modal';

const Registration = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    eventLocation: searchParams.get('location') || '',
    programType: searchParams.get('program') || '',
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
  const [authMethod, setAuthMethod] = useState(null); // 'google' or 'email'
  const captchaContainer = useRef(null);
  const [captchaRendered, setCaptchaRendered] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const programTypeOptions = {
    amstelveen: [
      { value: 'darshan', label: 'Darshan (Free)' },
      { value: 'lakshmi-narayana-pooja', label: 'Lakshmi Naryana Pooja (26 EUR/Family)' }
    ],
    denhaag: [
      { value: 'sita-rama-kalyanam', label: 'Sita Rama Kalyanam (Free)' }
    ],
    eindhoven: [
      { value: 'darshan', label: 'Darshan (Free)' }
    ]
  };

  const handleCaptchaVerify = (token) => {
    console.log('Captcha verified:', token);
    setError(null);
  };

  const { renderCaptcha } = useCaptcha(handleCaptchaVerify);

  // Initialize auth state listener
  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthChange((currentUser) => {
      console.log('Auth state changed:', currentUser);
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
      const user = await signInWithGoogle();
      setUser(user);
      setAuthMethod('google');
      if (user?.email) {
        setFormData(prev => ({
          ...prev,
          email: user.email,
          name: user.displayName || ''
        }));
      }
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    setAuthMethod('email');
    setUser({ email: formData.email }); // Set user with email for form validation
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

        setTimeout(() => {
          window.location.href = data.url;
        }, 200); // slight delay to ensure storage is written
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
          <p>Please sign in with your Google account or enter your email to continue with registration</p>
          <div className="auth-options">
            <button
              className="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <div className="email-auth">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="email-input"
                disabled={loading}
              />
              <button
                className="email-continue-btn"
                onClick={handleEmailAuth}
                disabled={loading || !formData.email}
              >
                Continue with Email
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="registration-form">
          {authMethod === 'google' && (
            <div className="user-info">
              <p>Signed in as: {user.email}</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="sign-out-btn"
              >
                Sign Out
              </button>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading || authMethod === 'google'}
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

          {/* Show closed message and disable submit if Amstelveen or Denhaag is selected */}
          {(formData.eventLocation === 'amstelveen' || formData.eventLocation === 'denhaag') && (
            <div className="closed-message" style={{ color: '#800020', fontWeight: 'bold', marginBottom: '1rem' }}>
              Registrations for {formData.eventLocation.charAt(0).toUpperCase() + formData.eventLocation.slice(1)} Are Now Closed
            </div>
          )}
          {formData.eventLocation && (
            <div className="form-group">
              <label htmlFor="programType">Program Type *</label>
              <select
                id="programType"
                name="programType"
                value={formData.programType}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select Program Type</option>
                {programTypeOptions[formData.eventLocation]?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>  
            </div>
          )}
          <div className="form-group">
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
          <div className="form-group">
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
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="wantsToContribute"
                checked={formData.wantsToContribute}
                onChange={handleChange}
                disabled={loading}
              />
              I would like to contribute to the program
            </label>
          </div>
          {formData.wantsToContribute && (
            <div className="form-group">
              <label htmlFor="contributionAmount">Contribution Amount (EUR)</label>
              <input
                type="number"
                id="contributionAmount"
                name="contributionAmount"
                value={formData.contributionAmount}
                onChange={handleChange}
                min="1"
                step="0.01"
                disabled={loading}
              />
              <span>As a token of gratitude, all contributions over €150 will receive a special Souvenir personally from Swami Varu carrying his grace and blessings.</span>
            </div>
          )}
          <div ref={captchaContainer} className="captcha-container"></div>
          
          <div className="privacy-link">
            <button 
              type="button" 
              onClick={() => setIsPrivacyModalOpen(true)}
              className="privacy-button"
            >
              Read Privacy Statement
            </button>
          </div>

          <button
            type="submit"
            className={`submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading || formData.eventLocation === 'amstelveen' || formData.eventLocation === 'denhaag'}
          >
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>
      )}

      <Modal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)}
      >
        <div className="privacy-statement">
          <h3>Privacy Statement</h3>
          <p>By registering for this event, you agree to the following:</p>
          <ul>
            <li>Your personal information will be used solely for event registration and communication purposes.</li>
            <li>We will not share your information with third parties without your explicit consent.</li>
            <li>Your payment information is processed securely through Stripe and is not stored on our servers.</li>
            <li>You may request deletion of your data at any time by contacting us.</li>          
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default Registration;