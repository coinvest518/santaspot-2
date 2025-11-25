import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Facebook, Twitter, Instagram, Users, BarChart, DollarSign, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useNavigate } from 'react-router-dom';
import {
  generateReferralLink,
  getUserDonations,
  subscribeToClicks,
  subscribeToReferrals,
  subscribeToUserProfile,
  subscribeToGlobalPot,
  DonationRecord,
  ReferralRecord,
  GlobalPot,
} from '@/lib/firebase';

interface DashboardData {
  earnings: number;
  referral_clicks: number;
  referrals: number;
  completed_offers: number;
  referralLink: string;
  username: string;
  referral_code: string;
  influence_score: number;
  total_donated: number;
}

const Dashboard = () => {
  const { firebaseUser, userProfile: initialUserProfile, loading: authLoading } = useFirebaseUser();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    earnings: 0,
    referral_clicks: 0,
    referrals: 0,
    completed_offers: 0,
    referralLink: '',
    username: '',
    referral_code: '',
    influence_score: 0,
    total_donated: 0,
  });
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [showDonations, setShowDonations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [potTotal, setPotTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      navigate('/', { replace: true });
    }
  }, [authLoading, firebaseUser, navigate]);

  useEffect(() => {
    if (!initialUserProfile) return;

    setLoading(true);

    const { uuid, referral_code, uid } = initialUserProfile;
    const referralLink = generateReferralLink(referral_code);

    // Set initial static data
    setDashboardData(prev => ({
      ...prev,
      referralLink,
      referral_code,
    }));
    
    // --- Set up real-time listeners ---

    const unsubProfile = subscribeToUserProfile(uid, (profile) => {
      if (profile) {
        setDashboardData(prev => ({
          ...prev,
          earnings: profile.earnings,
          completed_offers: profile.completed_offers,
          username: profile.username || 'User',
          influence_score: profile.influence_score || 0,
          total_donated: profile.total_donated || 0,
        }));
      }
      setLoading(false);
    });

    const unsubClicks = subscribeToClicks(uuid, (count) => {
      setDashboardData(prev => ({ ...prev, referral_clicks: count }));
    });

    const unsubReferrals = subscribeToReferrals(uuid, (referralsList) => {
      setDashboardData(prev => ({ ...prev, referrals: referralsList.length }));
    });
    
    // Subscribe to global pot for real-time updates
    const unsubGlobalPot = subscribeToGlobalPot((pot) => {
      if (pot) {
        setPotTotal(pot.total_amount);
      }
    });
    
    // Fetch user donations once
    getUserDonations(uuid).then(donationsList => {
      setDonations(donationsList);
    });

    // Cleanup function to unsubscribe on component unmount
    return () => {
      unsubProfile();
      unsubClicks();
      unsubReferrals();
      unsubGlobalPot();
    };

  }, [initialUserProfile]);

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(dashboardData.referral_code);
      toast.success(`Code "${dashboardData.referral_code}" copied!`);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(dashboardData.referralLink);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const getShareMessage = () => {
    return `🎅 Join Santa's Pot and earn money! Get $200 signup bonus + $2 per click + $50 per referral! Use my code: ${dashboardData.referral_code}`;
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(dashboardData.referralLink);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
    toast.success('Opening Facebook share dialog...');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(getShareMessage());
    const url = encodeURIComponent(dashboardData.referralLink);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
    toast.success('Opening Twitter share dialog...');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${getShareMessage()} ${dashboardData.referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const shareOnTelegram = () => {
    const text = encodeURIComponent(getShareMessage());
    const url = encodeURIComponent(dashboardData.referralLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    toast.success('Opening Telegram...');
  };

  const copyShareMessage = async () => {
    try {
      const message = `${getShareMessage()} ${dashboardData.referralLink}`;
      await navigator.clipboard.writeText(message);
      toast.success('Share message copied! Paste it anywhere to share.');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 w-full flex justify-between items-center p-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
            <div className="px-6 py-4">
              <div className="text-sm font-semibold opacity-90">Current Pot Total</div>
              <div className="text-2xl font-bold">${potTotal.toFixed(2)}</div>
            </div>
          </Card>
        </div>

        <Button>
          {dashboardData.username ? `Welcome, ${dashboardData.username}!` : 'Welcome!'}
        </Button>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <Card className="bg-primary text-white p-6 mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Total Earnings</h2>
              <span className="text-3xl font-bold">${dashboardData.earnings.toFixed(2)}</span>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Clicks</p>
                <p className="text-2xl font-bold text-primary">{dashboardData.referral_clicks}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Referrals</p>
                <p className="text-2xl font-bold text-primary">{dashboardData.referrals}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Donated</p>
                <p className="text-2xl font-bold text-primary">${dashboardData.total_donated.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Influence Score</p>
                <p className="text-2xl font-bold text-primary">{dashboardData.influence_score}</p>
              </div>
            </div>
          </Card>

          <div className="mb-8">
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-semibold mb-2">Community Pot</h2>
                <div className="text-5xl font-bold mb-2">${potTotal.toFixed(2)}</div>
                <p className="text-sm opacity-90">Total community contributions</p>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-lg font-semibold">Referrals</h3>
              </div>
              <p className="text-3xl font-bold">{dashboardData.referrals}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <BarChart className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-lg font-semibold">Clicks</h3>
              </div>
              <p className="text-3xl font-bold">{dashboardData.referral_clicks}</p>
            </Card>
          </div>

          <Card className="p-6">
            <Button onClick={() => setShowDonations(!showDonations)} variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              Donations ({donations.length})
            </Button>
            {showDonations && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-4">Your Donations</h3>
                {donations.length > 0 ? (
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Amount</th>
                        <th className="py-2 px-4 border-b">Currency</th>
                        <th className="py-2 px-4 border-b">Network</th>
                        <th className="py-2 px-4 border-b">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
                        <tr key={donation.id}>
                          <td className="py-2 px-4 border-b">${donation.amount}</td>
                          <td className="py-2 px-4 border-b">{donation.currency}</td>
                          <td className="py-2 px-4 border-b">{donation.network}</td>
                          <td className="py-2 px-4 border-b">
                            {donation.created_at.toDate().toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No donations yet</p>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Copy Your Referral Link 👇</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={dashboardData.referralLink}
                readOnly
                className="flex-1 p-2 border rounded-md bg-gray-50"
              />
              <Button onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={copyReferralCode} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Share on Social Media 🚀</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share your referral link and earn $2 per click + $50 per signup!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button 
                onClick={shareOnFacebook}
                className="bg-[#1877F2] hover:bg-[#1877F2]/90"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button 
                onClick={shareOnTwitter}
                className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button 
                onClick={shareOnWhatsApp}
                className="bg-[#25D366] hover:bg-[#25D366]/90"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                onClick={shareOnTelegram}
                className="bg-[#0088cc] hover:bg-[#0088cc]/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Telegram
              </Button>
              <Button 
                onClick={copyShareMessage}
                variant="outline"
                className="md:col-span-2"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Share Message
              </Button>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 font-medium mb-1">Preview:</p>
              <p className="text-sm text-gray-800">{getShareMessage()}</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
