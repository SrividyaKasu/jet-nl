import emailjs from '@emailjs/browser';

const PUBLIC_KEY = import.meta.env.VITE_EMAIL_JS_PUBLIC_KEY;
emailjs.init(PUBLIC_KEY);

export const sendConfirmationEmail = async (registrationData, confirmationNumber) => {
  try {
    const message =
    registrationData.wantsToContribute === true
      ? 'We have received your contribution of ' + registrationData.contributionAmount + ' EUR. Thank you for your support!, We look forward to seeing you there!'
      : 'Thank you for registering for the event. We look forward to seeing you there!';


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
      reply_to: registrationData.email,
      message: message
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAIL_JS_SERVICE_ID,
      import.meta.env.VITE_EMAIL_JS_TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}; 