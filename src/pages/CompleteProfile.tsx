import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { updateUserProfile, createReferralRecord, fetchUserProfile } from '@/lib/firebase';

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { firebaseUser, userProfile } = useFirebaseUser();
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!firebaseUser) {
      navigate('/');
      return;
    }

    if (userProfile?.username) {
      navigate('/dashboard');
    }
  }, [firebaseUser, userProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firebaseUser || !userProfile) {
      toast.error("User not found");
      return;
    }

    if (!username || username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateUserProfile(firebaseUser.uid, { username });

      if (referralCode) {
        const referrerProfile = await fetchUserProfile(referralCode);
        if (referrerProfile) {
          await createReferralRecord(referrerProfile.uuid, userProfile.uuid, referralCode);
        }
      }

      toast.success("Profile completed! Welcome to Santa's Pot! 🎅");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Failed to complete profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Welcome to Santa's Pot! 🎅</h2>
            <p className="text-gray-600 mt-2">Let's complete your profile to get started</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Choose Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Your unique username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="referral" className="text-sm font-medium">
                Referral Code (Optional)
              </label>
              <Input
                id="referral"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code if you have one"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Completing Profile..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
