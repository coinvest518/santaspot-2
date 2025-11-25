const Stripe = require('stripe');

console.log('Stripe key:', process.env.STRIPE_SECRET_KEY ? 'Found STRIPE_SECRET_KEY' : 'Using VITE_STRIPE_SECRET_KEY');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount < 1) { // Minimum $1.00
      return res.status(400).json({ error: 'Amount must be at least $1.00' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        source: 'santaspot',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}

module.exports = { default: handler };