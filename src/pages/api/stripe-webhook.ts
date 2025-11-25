import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function handleStripeWebhook(signature: string, rawBody: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || ''
    );
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const amount = paymentIntent.amount / 100;
      const userId = paymentIntent.metadata.userId;
      
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error('Error fetching user');
        throw new Error('User not found');
      }

      await addDoc(collection(db, 'donations'), {
        amount,
        userId,
        stripePaymentId: paymentIntent.id,
        status: 'completed',
        createdAt: serverTimestamp()
      });

      const currentEarnings = userSnap.data().earnings || 0;
      await updateDoc(userRef, { earnings: currentEarnings + amount });

      console.log(`Payment successful: ${paymentIntent.id}`);
      return { received: true };
    }
    return { received: true };
  } catch (err) {
    console.error('Error processing webhook:', err);
    throw err;
  }
}
