import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { 
  createWithdrawalRequest, 
  subscribeToWithdrawals,
  getPendingWithdrawals,
  getWithdrawalProgress,
  trackSocialShare,
  WithdrawalRequest 
} from '@/lib/firebase';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  MousePointer,
  Gift,
  Share2,
  Target,
  AlertCircle,
  Calendar
} from 'lucide-react';

const MINIMUM_WITHDRAWAL = 25;

const Withdraw: React.FC = () => {
  const { firebaseUser, userProfile, loading } = useFirebaseUser();
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('paypal');
  const [paymentDetails, setPaymentDetails] = useState<string>('');
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userProfile) return;

    const unsubscribe = subscribeToWithdrawals(userProfile.uuid, (withdrawalsList) => {
      setWithdrawals(withdrawalsList.sort((a, b) => b.created_at.seconds - a.created_at.seconds));
    });

    getPendingWithdrawals(userProfile.uuid).then(setPendingAmount);

    return () => unsubscribe();
  }, [userProfile]);

  const availableBalance = userProfile ? userProfile.earnings - pendingAmount : 0;
  const progress = userProfile ? getWithdrawalProgress(userProfile) : null;
  const isEligible = userProfile?.withdrawal_eligible || false;

  const handleSocialShare = async (platform: string) => {
    if (!userProfile || !firebaseUser) return;
    
    try {
      await trackSocialShare(firebaseUser.uid, platform);
      toast.success(`+2 points for ${platform} share!`);
    } catch (error) {
      toast.error('Failed to track share');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast.error("Please log in to withdraw funds");
      return;
    }

    if (!isEligible) {
      toast.error("You haven't met all withdrawal requirements yet");
      return;
    }

    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    if (withdrawAmount < MINIMUM_WITHDRAWAL) {
      toast.error(`Minimum withdrawal amount is $${MINIMUM_WITHDRAWAL}`);
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast.error("Insufficient available balance");
      return;
    }

    if (!paymentDetails.trim()) {
      toast.error("Please provide payment details");
      return;
    }

    setIsSubmitting(true);
    try {
      await createWithdrawalRequest(
        userProfile.uuid,
        withdrawAmount,
        paymentMethod,
        paymentDetails.trim()
      );
      
      toast.success("Withdrawal request submitted! Processing time: 3-5 business days");
      setAmount('');
      setPaymentDetails('');
      
      const newPending = await getPendingWithdrawals(userProfile.uuid);
      setPendingAmount(newPending);
    } catch (error) {
      toast.error("Failed to process withdrawal request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRequirementIcon = (completed: boolean) => {
    return completed ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">💰 Withdraw Funds</h1>
        
        {/* Eligibility Status */}
        {userProfile && (
          <Card className={`border-2 ${isEligible ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {isEligible ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {isEligible ? '✅ Withdrawal Eligible!' : '❌ Complete Requirements to Withdraw'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isEligible ? 
                      'You can now submit withdrawal requests' : 
                      'Complete all requirements below to unlock withdrawals'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {userProfile && (
          <div className="grid md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Earnings</p>
                    <p className="text-xl font-bold">${userProfile.earnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Points</p>
                    <p className="text-xl font-bold">{userProfile.total_points || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Referrals</p>
                    <p className="text-xl font-bold">{userProfile.total_referrals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MousePointer className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Clicks</p>
                    <p className="text-xl font-bold">{userProfile.total_clicks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5 text-cyan-500" />
                  <div>
                    <p className="text-sm text-gray-600">Shares</p>
                    <p className="text-xl font-bold">{userProfile.social_shares || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-sm text-gray-600">Donated</p>
                    <p className="text-xl font-bold">${(userProfile.total_donated || 0).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Requirements Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requirements</CardTitle>
              <p className="text-sm text-gray-600">
                Complete all requirements to unlock withdrawals
              </p>
            </CardHeader>
            <CardContent>
              {progress && (
                <div className="space-y-4">
                  {Object.entries(progress).map(([key, req]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRequirementIcon(req.completed)}
                          <span className="text-sm font-medium">{req.label}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {req.current}/{req.required}
                        </span>
                      </div>
                      <Progress 
                        value={(req.current / req.required) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                  
                  {/* Quick Actions */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Quick Actions to Earn Points:</h4>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSocialShare('facebook')}
                        className="mr-2"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share (+2 pts)
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open('/offers', '_blank')}
                      >
                        <Target className="w-4 h-4 mr-1" />
                        Complete Offers (+5 pts)
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
                <p className="text-sm text-gray-600">
                  Available: ${availableBalance.toFixed(2)} • Min: ${MINIMUM_WITHDRAWAL}
                </p>
              </CardHeader>
              <CardContent>
                {!isEligible ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Complete Requirements First</h3>
                    <p className="text-gray-600">
                      You need to complete all requirements on the left to unlock withdrawals.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (${MINIMUM_WITHDRAWAL} minimum)
                      </label>
                      <Input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Min $${MINIMUM_WITHDRAWAL}`}
                        min={MINIMUM_WITHDRAWAL}
                        max={availableBalance}
                        step="0.01"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      >
                        <option value="paypal">PayPal</option>
                        <option value="cashapp">Cash App</option>
                        <option value="venmo">Venmo</option>
                        <option value="crypto">Cryptocurrency</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="paymentDetails" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Details
                      </label>
                      <Input
                        type="text"
                        id="paymentDetails"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                        placeholder={paymentMethod === 'paypal' ? 'PayPal email' : 
                                   paymentMethod === 'crypto' ? 'Wallet address' : 
                                   'Username/Email'}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting || availableBalance < MINIMUM_WITHDRAWAL}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Withdrawal History */}
        {withdrawals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(withdrawal.status)}
                      <div>
                        <p className="font-medium">${withdrawal.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {withdrawal.payment_method} • {withdrawal.created_at.toDate().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {withdrawal.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Withdraw;