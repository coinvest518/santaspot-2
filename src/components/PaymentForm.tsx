import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Payment system not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-completion`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "Your donation could not be processed.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: 'tabs',
        }}
      />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-red-600 hover:bg-red-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Donation...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Donation
          </>
        )}
      </Button>
    </form>
  );
};

interface PaymentFormProps {
  clientSecret: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ clientSecret }) => {
  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading payment form...</span>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#dc2626', // Christmas red
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options} key={clientSecret}>
      <CheckoutForm />
    </Elements>
  );
};
