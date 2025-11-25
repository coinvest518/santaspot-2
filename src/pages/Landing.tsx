import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Share2, Star, Gift, Users, DollarSign, CreditCard, CheckCircle } from "lucide-react";
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
  const { firebaseUser, loading } = useFirebaseUser();
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [showRewardPot, setShowRewardPot] = useState(() => {
    return !localStorage.getItem('rewardPotClaimed');
  });

  useEffect(() => {
    if (firebaseUser && !loading) {
      navigate("/dashboard");
    }
  }, [firebaseUser, loading, navigate]);

  const handleClaimReward = async () => {
    try {
      toast.success("🎄 Your holiday spirit is shining bright!");
      localStorage.setItem('rewardPotClaimed', 'true');
      setShowRewardPot(false);
    } catch (error) {
      toast.error("Failed to claim gift");
    }
  };

  const AuthDialogContent = () => (
    <DialogContent className="sm:max-w-[425px] bg-gray-100" onInteractOutside={(e) => {
      if (authLoading || loading) {
        e.preventDefault();
      }
    }}>
      <DialogHeader>
        <DialogTitle>{isLogin ? "Sign In" : "Create Your Account"}</DialogTitle>
      </DialogHeader>
      <FirebaseAuthForm 
        isLogin={isLogin} 
        onLoadingChange={setAuthLoading}
      />
      <Button 
        variant="link" 
        onClick={() => setIsLogin(!isLogin)}
        disabled={authLoading || loading}
      >
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

      <div className="min-h-screen bg-gradient-to-br from-red-900 via-green-800 to-red-700 text-white">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-3">
            <Gift className="w-10 h-10 text-yellow-300" />
            <div className="text-3xl font-bold text-white tracking-wider">
              Santa's Pot <span className="text-yellow-300">🎅</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/10 border-yellow-300/50 text-white hover:bg-white/20"
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </Button>
              </DialogTrigger>
              <AuthDialogContent />
            </Dialog>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-6xl font-extrabold mb-6 text-white drop-shadow-lg">
            Share the Holiday Spirit. Fill the Pot.
          </h1>
          <p className="text-xl text-yellow-100/90 mb-10 max-w-3xl mx-auto">
            Join a community of givers this holiday season. Your donation, big or small, brings joy to families in need. 
            Share the spirit on social media and watch the pot grow!
          </p>
          <div className="max-w-md mx-auto mb-10">
            <LiveCounter />
          </div>
          <div className="max-w-md mx-auto">
             <h3 className="text-2xl font-bold mb-2 text-white">Next Family Gift Draw</h3>
            <DrawTimer />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-lg border-yellow-300/30">
              <CardContent className="pt-8 text-center">
                <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2 text-white">Give</h3>
                <p className="text-sm text-yellow-100/80">Make a donation to help fill the pot for a family.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-lg border-yellow-300/30">
              <CardContent className="pt-8 text-center">
                <Share2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2 text-white">Share</h3>
                <p className="text-sm text-yellow-100/80">Spread the word on social media with your unique link.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-lg border-yellow-300/30">
              <CardContent className="pt-8 text-center">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2 text-white">Celebrate</h3>
                <p className="text-sm text-yellow-100/80">Watch as gifts are distributed and see the impact you've made.</p>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <section className="py-20 bg-black/20 backdrop-blur-md">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-lg text-center">
                  <h2 className="text-4xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
                  <p className="text-white/80 mb-6">Join our community of holiday helpers. It only takes a minute to sign up and share the joy.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl w-full" onClick={() => setIsLogin(false)}>
                        Join the Giving & Share a Gift
                      </Button>
                    </DialogTrigger>
                    <AuthDialogContent />
                  </Dialog>
                  <ul className="text-left mt-8 space-y-3 text-white/80">
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" /> Help Families in Need</li>
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" /> Share the Holiday Spirit</li>
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" /> See Your Impact</li>
                  </ul>
                </div>
                 <div className="text-left">
                  <h2 className="text-4xl font-bold text-center mb-8 text-white">About Santa's Pot</h2>
                   <p className="text-lg text-yellow-100/90 mb-6">
                    Santa's Pot is a digital hearth, a place where the warmth of holiday giving is shared far and wide. We believe in the power of community and the magic of a shared gift to brighten a family's holiday season. We are not for profit, we are for community.
                  </p>
                  <div className="grid grid-cols-3 gap-8 mt-12 text-center">
                    <div>
                      <h3 className="text-4xl font-bold text-green-400 mb-2">1,200+</h3>
                      <p className="text-yellow-100/80">Families Helped</p>
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-red-400 mb-2">$150K+</h3>
                      <p className="text-yellow-100/80">Donations Collected</p>
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-yellow-400 mb-2">15K+</h3>
                      <p className="text-yellow-100/80">Community Givers</p>
                    </div>
                  </div>
                </div>
            </div>
        </section>

        <section className="py-16 bg-green-900/40 relative">
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">
              Donation Methods
            </h2>
            <div className="flex justify-center items-center space-x-8">
              <Card className="p-6 bg-black/30 backdrop-blur-md border border-yellow-300/30 hover:border-yellow-300/60 transition-all duration-300">
                <CreditCard className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-center font-semibold text-white">PayPal</p>
              </Card>
              <Card className="p-6 bg-black/30 backdrop-blur-md border border-yellow-300/30 hover:border-yellow-300/60 transition-all duration-300">
                <CreditCard className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-center font-semibold text-white">Cash App</p>
              </Card>
              <Card className="p-6 bg-black/30 backdrop-blur-md border border-yellow-300/30 hover:border-yellow-300/60 transition-all duration-300">
                <CreditCard className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-center font-semibold text-white">Venmo</p>
              </Card>
            </div>
          </div>
        </section>

        <Testimonials />

        <footer className="bg-red-900/50 text-white py-12">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-400">Santa's Pot</h3>
                <p className="text-yellow-100/80">
                  Spreading holiday cheer, one gift at a time.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-400">Quick Links</h3>
                <ul className="space-y-2 text-yellow-100/80">
                  <li><a href="/" className="hover:text-green-400 transition-colors">Home</a></li>
                  <li><a href="https://buymeacoffee.com/coinvest/e/344832" target="_blank" className="hover:text-green-400 transition-colors">Want an App Like This?</a></li>
                  <li><a href="https://t.me/omniai_ai" target="_blank" className="hover:text-green-400 transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-yellow-400">Contact Us</h3>
                <p className="text-yellow-100/80">
                  Telegram: <a href="https://t.me/omniai_ai" className="text-red-400 hover:text-green-400">https://t.me/omniai_ai</a>
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-green-700/50 text-center text-yellow-100/80">
              <p>&copy; 2024 Santa's Pot. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;

