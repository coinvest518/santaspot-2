import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useNavigate } from 'react-router-dom';
import { Loader2, DollarSign } from 'lucide-react';
import { PaymentForm } from '@/components/PaymentForm';

import { useToast } from "@/components/ui/use-toast";

const Payments = () => {
  const { firebaseUser, loading } = useFirebaseUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('1');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      navigate('/');
    }
  }, [firebaseUser, loading, navigate]);

  const handleCreatePayment = async () => {
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount of at least $1.00",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPayment(true);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: donationAmount,
          currency: 'usd',
          userId: firebaseUser?.uid || 'anonymous',
          userEmail: firebaseUser?.email || 'unknown',
          type: 'donation',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create payment intent');
      setClientSecret(data.clientSecret);
      toast({
        title: "Payment Ready",
        description: "You can now complete your donation below.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">🎅 Donate to Santa's Pot</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto space-y-6"
        >
          {!clientSecret ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Donation Amount
                </CardTitle>
                <CardDescription>
                  Enter your donation amount to join Santa's Pot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                      placeholder="1.00"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCreatePayment}
                  disabled={isCreatingPayment}
                  className="w-full"
                >
                  {isCreatingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    `Donate $${amount}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Donation</CardTitle>
                <CardDescription>
                  Donating ${amount} to Santa's Pot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentForm clientSecret={clientSecret} />
              </CardContent>
            </Card>
          )}
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">🎁 How It Works</h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Minimum donation: $1.00</li>
              <li>• Every donation enters you in the draw</li>
              <li>• Winner selected on Christmas Day</li>
              <li>• Secure payments via Stripe</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Payments;