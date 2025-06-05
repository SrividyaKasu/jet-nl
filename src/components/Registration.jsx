import React, { useState } from 'react';
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

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="registration-success">
        <h2>Registration Successful!</h2>
        <p>Thank you for registering with JET NL. We will contact you shortly with further details.</p>
        <button 
          className="register-again-btn"
          onClick={() => {
            setSubmitted(false);
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
          }}
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
            />
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Register Now
        </button>
      </form>
    </div>
  );
};

export default Registration; 