import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Gift, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { generateReferralLink, getReferrals } from '@/lib/firebase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Referrals: React.FC = () => {
  const { userProfile, loading } = useFirebaseUser();
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadReferrals = async () => {
      if (!userProfile) return;
      try {
        const data = await getReferrals(userProfile.uuid);
        setReferrals(data);
      } catch (error) {
        console.error('Error fetching referrals:', error);
      }
    };

    loadReferrals();
  }, [userProfile]);

  const getChartData = () => {
    const grouped = referrals.reduce((acc: any, curr: any) => {
      const date = new Date(curr.created_at.toDate()).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(grouped).slice(-7),
      datasets: [
        {
          label: 'Referrals',
          data: Object.values(grouped).slice(-7),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.4
        }
      ]
    };
  };

  const copyReferralLink = async () => {
    if (!userProfile?.referral_code) return;
    
    const referralLink = generateReferralLink(userProfile.referral_code);
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = async () => {
    if (!userProfile?.referral_code) return;

    const referralLink = generateReferralLink(userProfile.referral_code);
    try {
      await navigator.share({
        title: 'Join Santa\'s Pot!',
        text: 'Sign up using my referral link and earn $100!',
        url: referralLink,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-red-50 to-white">
      <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Your Referral Dashboard 🎄
              </h1>
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg mb-2">Your Referral Code:</p>
                    <p className="text-3xl font-bold">{userProfile?.referral_code}</p>
                  </div>
                  <div className="space-x-4">
                    <Button
                      onClick={copyReferralLink}
                      variant="secondary"
                      className="bg-white text-red-600 hover:bg-gray-100"
                    >
                      {copied ? <span>Copied! ✓</span> : <><Copy className="w-4 h-4 mr-2" /> Copy Link</>}
                    </Button>
                    <Button
                      onClick={shareReferralLink}
                      variant="secondary"
                      className="bg-white text-red-600 hover:bg-gray-100"
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/90 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      Total Referrals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-600">
                      {referrals.length}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-white/90 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Gift className="w-5 h-5 mr-2 text-green-500" />
                      Active This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-600">
                      {referrals.filter(r => {
                        const date = new Date(r.created_at.toDate());
                        const now = new Date();
                        return date.getMonth() === now.getMonth();
                      }).length}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-white/90 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
                      Total Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-yellow-600">
                      ${userProfile?.earnings.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle>Referral History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {referrals.length > 0 ? (
                      <Line
                        data={getChartData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            title: {
                              display: true,
                              text: 'Last 7 Days'
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No referral data yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Referrals;
