import Stripe from 'stripe';
import { auth } from '@/lib/firebase';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export const createPaymentIntent = async (amount: number) => {
  try {
    const amountInCents = Math.round(amount * 100);
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be logged in to make a payment');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, 
      currency: 'usd',
      metadata: {
        userId: user.uid,
        originalAmount: amount.toString(),
        amountInCents: amountInCents.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created:', paymentIntent.id);
    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};
