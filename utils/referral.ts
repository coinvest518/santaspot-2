import { db } from '../src/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const generateReferralLink = (referralCode: string): string => {
  return `${window.location.origin}/signup?referral=${referralCode}`;
};

export const processReferralReward = async (
  referrerId: string,
  referredId: string,
  referralCode: string,
  rewardAmount: number = 50
): Promise<boolean> => {
  try {
    if (!referrerId || !referredId || !referralCode) {
      console.error('Invalid referral data:', { referrerId, referredId, referralCode });
      return false;
    }
    const userRef = doc(db, 'users', referrerId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error('Referrer not found');
      return false;
    }
    
    const currentEarnings = userSnap.data().earnings || 0;
    await updateDoc(userRef, { earnings: currentEarnings + rewardAmount });
    
    await addDoc(collection(db, 'referrals'), {
      referrerId,
      referredId,
      referralCode,
      status: 'completed',
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error rewarding referrer:', error);
    return false;
  }
};

export const trackReferralClick = async (userId: string, referralCode: string) => {
  try {
    await addDoc(collection(db, 'clicks'), {
      userId,
      referralCode,
      clickedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    throw error;
  }
};

export const createReferralEntry = async (
  referrerId: string | null,
  referredId: string,
  referralCodeUsed: string | null
) => {
  if (!referredId) {
    console.error('Referred ID is required');
    return;
  }
  try {
    await addDoc(collection(db, 'referrals'), {
      referrerId,
      referredId,
      referralCode: referralCodeUsed,
      status: referrerId ? 'completed' : 'pending',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating referral entry:', error);
  }
};
