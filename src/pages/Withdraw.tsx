import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import ProgressBar from '../components/ProgressBar';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

const calculateProgress = (userProfile: any) => {
  const { earnings, completed_offers } = userProfile;
  const maxEarned = 1000;
  const maxOffers = 100;

  const earnedProgress = Math.min(earnings / maxEarned, 1) * 0.5;
  const offersProgress = Math.min(completed_offers / maxOffers, 1) * 0.5;

  return (earnedProgress + offersProgress) * 100;
};

const Withdraw: React.FC = () => {
  const { firebaseUser, userProfile } = useFirebaseUser();
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('paypal');
  const [paymentDetails, setPaymentDetails] = useState<string>('');

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    if (!userProfile || parseFloat(amount) > userProfile.earnings) {
      toast.error("Insufficient funds");
      return;
    }

    try {
      toast.success("Withdrawal request submitted successfully");
      setAmount('');
      setPaymentDetails('');
    } catch (error) {
      toast.error("Failed to process withdrawal");
    }
  };

  const progress = userProfile ? calculateProgress(userProfile) : 0;

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">🎮 Santa'sPot: The Holiday Giving Game! 🎁✨</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Welcome, {firebaseUser?.email}</h2>
                <p>Here's how the withdrawal process works:</p>
                <ol className="list-decimal list-inside">
                  <li>Enter the amount you wish to withdraw.</li>
                  <li>Select your preferred payment method.</li>
                  <li>Provide the necessary payment details.</li>
                  <li>Submit your request and wait for approval.</li>
                </ol>
              </div>
              {userProfile && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Your Stats:</h2>
                  <p>Total Earnings: ${userProfile.earnings.toFixed(2)}</p>
                  <p>Completed Offers: {userProfile.completed_offers}</p>
                  <ProgressBar value={progress} max={100} />
                </div>
              )}
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <Input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="paymentDetails" className="block text-sm font-medium text-gray-700">
                    Payment Details
                  </label>
                  <Input
                    type="text"
                    id="paymentDetails"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder="Enter payment details"
                    required
                  />
                </div>
                <Button type="submit">Submit Withdrawal Request</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Withdraw;
