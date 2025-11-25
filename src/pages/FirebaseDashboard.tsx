import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Facebook, Twitter, Instagram, MessageCircle, Users, BarChart, DollarSign } from 'lucide-react';
import { CIcon } from '@coreui/icons-react';
import { cibTiktok } from '@coreui/icons';
import { toast } from 'sonner';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useNavigate } from 'react-router-dom';
import { generateReferralLink, getClickCount, getReferrals, getUserDonations, trackReferralClick } from '@/lib/firebase';
import { DonationRecord, ReferralRecord } from '@/lib/firebase';

interface DashboardData {
  earnings: number;
  referral_clicks: number;
  referrals: number;
  completed_offers: number;
  referralLink: string;
  username: string;
  referral_code: string;
}

const FirebaseDashboard = () => {
  const { firebaseUser, userProfile, loading: authLoading } = useFirebaseUser();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    earnings: 0,
    referral_clicks: 0,
    referrals: 0,
    completed_offers: 0,
    referralLink: '',
    username: '',
    referral_code: '',
  });
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [showDonations, setShowDonations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [potTotal, setPotTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      navigate('/');
    }
  }, [authLoading, firebaseUser, navigate]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!userProfile) return;

      try {
        const [clickCount, referralsList, donationsList] = await Promise.all([
          getClickCount(userProfile.uuid),
          getReferrals(userProfile.uuid),
          getUserDonations(userProfile.uuid),
        ]);

        const referralLink = generateReferralLink(userProfile.referral_code);

        setDashboardData({
          earnings: userProfile.earnings,
          referral_clicks: clickCount,
          referrals: referralsList.length,
          completed_offers: userProfile.completed_offers,
          referralLink,
          username: userProfile.username || 'User',
          referral_code: userProfile.referral_code,
        });

        setDonations(donationsList);
        
        // Calculate pot total from all donations
        const total = donationsList.reduce((sum, d) => sum + d.amount, 0);
        setPotTotal(total);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userProfile]);

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

      if (userProfile) {
        await trackReferralClick(userProfile.uuid, dashboardData.referral_code);
      }
    } catch (error) {
      toast.error('Failed to copy link');
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
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Clicks</p>
                <p className="text-2xl font-bold text-primary">{dashboardData.referral_clicks}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Referrals</p>
                <p className="text-2xl font-bold text-primary">{dashboardData.referrals}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Completed Offers</p>
                <p className="text-2xl font-bold text-primary">{dashboardData.completed_offers}</p>
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
            <h3 className="text-lg font-semibold mb-4">Share on Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-[#1877F2] hover:bg-[#1877F2]/90">
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90">
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button className="bg-[#E4405F] hover:bg-[#E4405F]/90">
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FirebaseDashboard;
