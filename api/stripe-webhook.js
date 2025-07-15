import Stripe from 'stripe';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getDb } from '../src/firebase/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    const db = await getDb();

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Extract customer email from payment intent metadata
        const customerEmail = paymentIntent.metadata?.customer_email;
        const customerName = paymentIntent.metadata?.customer_name;
        
        if (customerEmail) {
          // Find pending registration by email
          const registrationsRef = collection(db, 'registrations');
          const q = query(
            registrationsRef,
            where('email', '==', customerEmail),
            where('status', '==', 'pending')
          );
          
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const registrationDoc = querySnapshot.docs[0];
            const registrationData = registrationDoc.data();
            
            // Update registration status to completed
            await updateDoc(doc(db, 'registrations', registrationDoc.id), {
              status: 'completed',
              paymentIntentId: paymentIntent.id,
              paymentCompletedAt: new Date(),
              updatedAt: new Date()
            });
            
            console.log('Registration updated to completed:', registrationDoc.id);
          } else {
            console.log('No pending registration found for email:', customerEmail);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        const failedCustomerEmail = failedPayment.metadata?.customer_email;
        
        if (failedCustomerEmail) {
          // Find pending registration and mark as failed
          const registrationsRef = collection(db, 'registrations');
          const q = query(
            registrationsRef,
            where('email', '==', failedCustomerEmail),
            where('status', '==', 'pending')
          );
          
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const registrationDoc = querySnapshot.docs[0];
            
            await updateDoc(doc(db, 'registrations', registrationDoc.id), {
              status: 'payment_failed',
              paymentIntentId: failedPayment.id,
              paymentFailedAt: new Date(),
              updatedAt: new Date()
            });
            
            console.log('Registration marked as payment failed:', registrationDoc.id);
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
} 