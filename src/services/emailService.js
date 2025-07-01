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

export const sendDonationConfirmationEmail = async (donationData) => {
  try {
    const message = `Dear ${donationData.name},

Thank you for your generous contribution of €${donationData.amount} to JET Netherlands!

Your support helps us continue our spiritual and educational mission. We truly appreciate your generosity and commitment to our cause.

${donationData.amount >= 150 ? 'As a token of our gratitude, you will receive a special Souvenir personally from Swami Varu carrying his grace and blessings.' : ''}

May you be blessed with happiness, prosperity, and spiritual growth.

With gratitude,
The JET NL Team`;

    const templateParams = {
      to_name: donationData.name,
      to_email: donationData.email,
      email: donationData.email,
      donation_amount: donationData.amount,
      reply_to: donationData.email,
      message: message,
      subject: 'Thank you for your contribution to JET Netherlands'
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAIL_JS_SERVICE_ID,
      import.meta.env.VITE_EMAIL_JS_DONATION_TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error('Failed to send donation confirmation email:', error);
    throw error;
  }
}; 