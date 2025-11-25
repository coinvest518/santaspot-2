import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserByReferralCode, trackReferralClick } from '@/lib/firebase';

export const Redirect = () => {
  const { referralCode } = useParams<{ referralCode: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const handleReferral = async () => {
      if (!referralCode) {
        navigate('/');
        return;
      }

      try {
        // Find the user who owns the referral code
        const referringUser = await getUserByReferralCode(referralCode);

        if (referringUser) {
          // 1. Track the click for the referring user
          await trackReferralClick(referringUser.uuid, referralCode);

          // 2. Save the referral code to local storage to be used on signup
          localStorage.setItem('referralCode', referralCode);
        }
      } catch (error) {
        console.error('Error handling referral link:', error);
      } finally {
        // 3. Redirect to the main page
        navigate('/');
      }
    };

    handleReferral();
  }, [referralCode, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500" />
      <p className="ml-4 text-lg">Redirecting...</p>
    </div>
  );
};
