import emailjs from '@emailjs/browser';

const PUBLIC_KEY = 'nmeIxaTnqe2_ZZbZE';
emailjs.init(PUBLIC_KEY);

export const sendConfirmationEmail = async (registrationData, confirmationNumber) => {
  try {
    const templateParams = {
      to_name: registrationData.name,
      to_email: registrationData.email,
      email: registrationData.email,
      confirmation_number: confirmationNumber,
      event_location: registrationData.eventLocation,
      program_type: registrationData.programType,
      num_adults: registrationData.numAdults,
      num_kids: registrationData.numKids,
      city: registrationData.city,
      phone: registrationData.phone,
      reply_to: registrationData.email
    };

    const response = await emailjs.send(
      'service_9dkyu8n',
      'template_JETNL_reg',
      templateParams,
      PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}; 