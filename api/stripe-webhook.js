import Stripe from 'stripe';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sendConfirmationEmail } from '../services/emailService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Get the registration data from the session metadata
      const registrationData = JSON.parse(session.metadata.registrationData);

      // Create the registration in Firestore
      const docRef = await addDoc(collection(db, 'registrations'), {
        ...registrationData,
        contributionAmount: session.amount_total / 100, // Convert from cents to euros
        stripePaymentId: session.payment_intent,
        createdAt: serverTimestamp()
      });

      // Send confirmation email
      await sendConfirmationEmail(registrationData, docRef.id);

      console.log('Registration completed successfully:', docRef.id);
    } catch (err) {
      console.error('Error processing registration:', err);
      return res.status(500).json({ error: 'Error processing registration' });
    }
  }

  res.json({ received: true });
} 