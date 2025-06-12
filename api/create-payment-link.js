import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Stripe is properly initialized
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return res.status(500).json({
        error: 'Internal Server Error',
        details: 'Stripe configuration is missing'
      });
    }

    console.log('Request body:', req.body);
    const { amount, description, email } = req.body;

    // Validate required fields
    if (!amount || !description) {
      console.error('Missing required fields:', { amount, description });
      return res.status(400).json({ 
        error: 'Bad Request',
        details: 'Amount and description are required'
      });
    }

    // First create a product
    const product = await stripe.products.create({
      name: description,
    });

    // Then create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
    });

    // Log the payment link creation attempt
    console.log('Creating payment link with params:', {
      priceId: price.id,
      email: email || 'not provided',
      origin: req.headers.origin
    });

    // Create a payment link using Stripe
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      payment_method_types: ['ideal', 'card'],
      after_completion: { 
        type: 'redirect',
        redirect: { url: `${req.headers.origin}/payment-success` }
      },
      payment_intent_data: {
        metadata: {
          failure_url: `${req.headers.origin}/payment-failed`
        }
      },
      customer_creation: 'always'
    });

    console.log('Payment link created successfully:', paymentLink.url);
    return res.status(200).json({ url: paymentLink.url });
  } catch (error) {
    console.error('Detailed error creating payment link:', {
      message: error.message,
      type: error.type,
      stack: error.stack,
      stripeError: error.raw || 'No raw error data'
    });

    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message,
      type: error.type || 'Unknown error type'
    });
  }
} 