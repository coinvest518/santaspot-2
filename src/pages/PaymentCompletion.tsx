import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

const PaymentCompletion = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status');

    if (redirectStatus === 'succeeded') {
      setStatus('success');
      setMessage('Your donation was successful! Thank you for joining Santa\'s Pot.');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#16a34a', '#eab308']
      });
    } else if (redirectStatus === 'failed') {
      setStatus('error');
      setMessage('Your donation could not be processed. Please try again.');
    } else {
      setStatus('error');
      setMessage('Payment status unclear. Please check your account or contact support.');
    }
  }, [searchParams]);

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  const handleTryAgain = () => {
    navigate('/payments');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-red-600" />
            <p>Processing your donation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            {status === 'success' ? (
              <>
                <div className="relative">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <Gift className="h-6 w-6 text-red-500 absolute top-0 right-1/3" />
                </div>
                <CardTitle className="text-green-700">🎅 Donation Successful!</CardTitle>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-red-700">Donation Failed</CardTitle>
              </>
            )}
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'success' ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">🎉 You're in Santa's Pot!</h3>
                  <p className="text-green-700 text-sm mb-2">
                    Your donation has been added to the pot. You're now eligible for the Christmas draw!
                  </p>
                  <p className="text-green-600 text-xs">
                    Winner will be selected on Christmas Day using our AI-powered fair selection system.
                  </p>
                </div>
                <Button onClick={handleReturnToDashboard} className="w-full bg-red-600 hover:bg-red-700">
                  🏠 Return to Dashboard
                </Button>
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">
                    Don't worry! You can try again or use our crypto payment option which is always available.
                  </p>
                </div>
                <Button onClick={handleTryAgain} className="w-full bg-red-600 hover:bg-red-700">
                  🔄 Try Again
                </Button>
                <Button 
                  onClick={handleReturnToDashboard} 
                  variant="outline" 
                  className="w-full"
                >
                  🏠 Return to Dashboard
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentCompletion;