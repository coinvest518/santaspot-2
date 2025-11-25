export const createPaymentIntent = async (amount: number, metadata?: Record<string, string>) => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // Amount in dollars
        currency: 'usd',
        metadata
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    const data = await response.json();
    return { 
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId 
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};