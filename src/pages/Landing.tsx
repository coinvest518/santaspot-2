import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Users, DollarSign, CreditCard, CheckCircle } from "lucide-react";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import LiveCounter from "@/components/LiveCounter";
import Testimonials from "@/components/Testimonials";
import FirebaseAuthForm from "@/components/FirebaseAuthForm";
import { toast } from "sonner";
import DrawTimer from "@/components/DrawTimer";
import RewardPot from '@/components/RewardPot';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Landing = () => {
  const navigate = useNavigate();
  const { firebaseUser } = useFirebaseUser();
  const [isLogin, setIsLogin] = useState(true);
  const [showRewardPot, setShowRewardPot] = useState(() => {
    return !localStorage.getItem('rewardPotClaimed');
  });

  useEffect(() => {
    if (firebaseUser) {
      navigate("/dashboard");
    }
  }, [firebaseUser, navigate]);

  const handleClaimReward = async () => {
    try {
      toast.success("🎄 Christmas Gift claimed successfully!");
      localStorage.setItem('rewardPotClaimed', 'true');
      setShowRewardPot(false);
    } catch (error) {
      toast.error("Failed to claim gift");
    }
  };

  const AuthDialogContent = () => (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{isLogin ? "Sign In" : "Create Account"}</DialogTitle>
      </DialogHeader>
      <FirebaseAuthForm isLogin={isLogin} />
      <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
      </Button>
    </DialogContent>
  );

  return (
    <>
      {showRewardPot && (
        <RewardPot
          isNewUser={true}
          onClose={handleClaimReward}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-violet-600 via-fuchsia-500 to-cyan-400">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-2">
            <Gift className="w-8 h-8 text-red-500" />
            <div className="text-2xl font-bold text-primary">
              Santas Pot
              <span className="text-red-500">🎅</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </Button>
              </DialogTrigger>
              <AuthDialogContent />
            </Dialog>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-5xl font-bold mb-6 text-white">
                Earn Money Through Your Network
                <span className="text-red-500">🎄</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Share your unique referral link, earn $2 per click and $50 for every
                successful new signup. $200 for new users. Start earning passive income today!
              </p>
              <LiveCounter />
              <div className="mt-6">
                <DrawTimer />
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card className="bg-black/20 backdrop-blur-lg border-[#ff0080]/20">
                  <CardContent className="pt-6">
                    <Users className="w-8 h-8 text-[#00d4ff] mb-4" />
                    <h3 className="font-semibold mb-2 text-white">Share</h3>
                    <p className="text-sm text-gray-300">Share your unique link</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/20 backdrop-blur-lg border-[#ff0080]/20">
                  <CardContent className="pt-6">
                    <Gift className="w-8 h-8 text-[#ff0080] mb-4" />
                    <h3 className="font-semibold mb-2 text-white">Refer</h3>
                    <p className="text-sm text-gray-300">Invite friends to join</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/20 backdrop-blur-lg border-[#ff0080]/20">
                  <CardContent className="pt-6">
                    <DollarSign className="w-8 h-8 text-[#7928ca] mb-4" />
                    <h3 className="font-semibold mb-2 text-white">Earn</h3>
                    <p className="text-sm text-gray-300">Get paid for referrals</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
              <p className="text-white/80 mb-6">Join thousands of others making money by sharing. It only takes a minute to sign up.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg w-full" onClick={() => setIsLogin(false)}>
                    Sign Up & Claim Your $200 Bonus
                  </Button>
                </DialogTrigger>
                <AuthDialogContent />
              </Dialog>
              <ul className="text-left mt-6 space-y-2 text-white/80">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> $200 New User Bonus</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Instant Referral Tracking</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Daily Payouts</li>
              </ul>
            </div>
          </div>
        </main>

        <section className="py-16 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">About Us</h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-gray-300 mb-6">
                Santa's Pot is more than just a community of hope, connection,
                and mutual support. We believe that everyone deserves a chance, and together,
                we can create unexpected moments of joy and relief.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-[#00d4ff] mb-2">300K+</h3>
                  <p className="text-gray-300">Active Members</p>
                </div>
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-[#ff0080] mb-2">$9.7M+</h3>
                  <p className="text-gray-300">Paid Out</p>
                </div>
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-[#7928ca] mb-2">500K+</h3>
                  <p className="text-gray-300">Successful Referrals</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-[#7928ca] to-[#00d4ff]/80 relative">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl font-bold text-center mb-8 text-white text-opacity-90">
              Payment Methods
            </h2>
            <div className="flex justify-center items-center space-x-8">
              <Card className="p-6 bg-black/30 backdrop-blur-md border border-[#ff0080]/20 hover:border-[#ff0080]/50 transition-all duration-300">
                <CreditCard className="w-12 h-12 text-[#00d4ff] mx-auto mb-4" />
                <p className="text-center font-semibold text-white">PayPal</p>
              </Card>
              <Card className="p-6 bg-black/30 backdrop-blur-md border border-[#ff0080]/20 hover:border-[#ff0080]/50 transition-all duration-300">
                <CreditCard className="w-12 h-12 text-[#ff0080] mx-auto mb-4" />
                <p className="text-center font-semibold text-white">Cash App</p>
              </Card>
              <Card className="p-6 bg-black/30 backdrop-blur-md border border-[#ff0080]/20 hover:border-[#ff0080]/50 transition-all duration-300">
                <CreditCard className="w-12 h-12 text-[#7928ca] mx-auto mb-4" />
                <p className="text-center font-semibold text-white">Venmo</p>
              </Card>
            </div>
          </div>
        </section>

        <Testimonials />

        <footer className="bg-gradient-to-b from-[#7928ca] to-[#1a1a1a] text-white py-12 relative">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#00d4ff]">ReferralPro</h3>
                <p className="text-gray-300">
                  Making passive income accessible to everyone.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#ff0080]">Quick Links</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a href="/"
                       target="_blank"
                       className="hover:text-[#00d4ff] transition-colors duration-300">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="https://buymeacoffee.com/coinvest/e/344832"
                       target="_blank"
                       className="hover:text-[#00d4ff] transition-colors duration-300">
                      Want an APP Made Like this?
                    </a>
                  </li>
                  <li>
                    <a href="https://t.me/omniai_ai"
                       target="_blank"
                       className="hover:text-[#00d4ff] transition-colors duration-300">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#00d4ff]">Contact Us</h3>
                <p className="text-gray-300">
                  Telegram: <a
                    href="https://t.me/omniai_ai"
                    className="text-[#ff0080] hover:text-[#00d4ff] transition-colors duration-300">
                    https://t.me/omniai_ai
                  </a>
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-[#ff0080]/20 text-center text-gray-300">
              <p>&copy; 2024 Santa's Pot All rights reserved.</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d4ff]"></div>
        </footer>
      </div>
    </>
  );
};

export default Landing;

