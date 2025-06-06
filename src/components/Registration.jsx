import React, { useState, useEffect, useRef } from 'react';
import { createRegistration, testFirebaseConnection } from '../firebase/registrationService';
import { useCaptcha } from '../hooks/useCaptcha';
import './Registration.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    eventLocation: '',
    programType: 'darshan',
    numAdults: 1,
    numKids: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState(null);
  const [firebaseStatus, setFirebaseStatus] = useState('checking');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const captchaContainer = useRef(null);

  const handleCaptchaVerify = (token) => {
    console.log('Captcha verified:', token);
    setCaptchaVerified(true);
    setError(null);
  };

  const { renderCaptcha } = useCaptcha(handleCaptchaVerify);

  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        await testFirebaseConnection();
        console.log('Firebase connection test passed');
        setFirebaseStatus('connected');
      } catch (error) {
        console.error('Firebase connection test failed:', error);
        setFirebaseStatus('error');
        setError(
          error.code === 'permission-denied' 
            ? 'Access to the registration service is currently restricted. Please try again later.'
            : error.code === 'unavailable'
            ? 'The registration service is temporarily unavailable. Please try again in a few minutes.'
            : 'Unable to connect to the registration service. Please check your internet connection and try again.'
        );
      }
    };

    checkFirebaseConnection();
  }, []);

  useEffect(() => {
    if (captchaContainer.current) {
      renderCaptcha(captchaContainer.current);
    }
  }, [renderCaptcha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    if (firebaseStatus !== 'connected') {
      setError('Registration service is not available. Please try again later.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createRegistration(formData);
      console.log('Registration successful:', result);
      setConfirmationNumber(result.confirmationNumber);
      setSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration. Please try again.');
      // Reset captcha on error
      if (window.grecaptcha) {
        window.grecaptcha.reset();
        setCaptchaVerified(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      eventLocation: '',
      programType: 'darshan',
      numAdults: 1,
      numKids: 0
    });
    setSuccess(false);
    setConfirmationNumber(null);
    setError(null);
    setCaptchaVerified(false);
    if (window.grecaptcha) {
      window.grecaptcha.reset();
    }
  };

  if (firebaseStatus === 'checking') {
    return (
      <div className="registration">
        <div className="loading-message">
          Connecting to registration service...
        </div>
      </div>
    );
  }

  if (firebaseStatus === 'error') {
    return (
      <div className="registration">
        <div className="error-message">
          {error}
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
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

      <form className="registration-form" onSubmit={handleSubmit}>
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
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email address"
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
            <option value="amsterdam">Amsterdam</option>
            <option value="denhaag">Den Haag</option>
            <option value="eindhoven">Eindhoven</option>
            <option value="rotterdam">Rotterdam</option>
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
            disabled={loading}
          >
            <option value="darshan">Darshan</option>
            <option value="pooja">Pooja</option>
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

        <div className="captcha-container" ref={captchaContainer}></div>

        <button 
          type="submit" 
          className={`submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading || !captchaVerified || firebaseStatus !== 'connected'}
        >
          {loading ? 'Registering...' : 'Register Now'}
        </button>
      </form>
    </div>
  );
};

export default Registration; 