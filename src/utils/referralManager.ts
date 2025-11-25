import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Creates a referral entry in the database.
 * @param referrerId The ID of the user who referred.
 * @param referredId The ID of the user being referred.
 * @param referralCode The referral code used.
 */
export const createReferralEntry = async (
  referrerId: string | null,
  referredId: string,
  referralCode: string | null
) => {
  try {
    await addDoc(collection(db, 'referrals'), {
      referrerId,
      referredId,
      referralCode,
      status: referrerId ? 'completed' : 'pending',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating referral entry:', error);
  }
};

/**
 * Links a referral code to a user during account setup.
 * @param userId The ID of the user setting up the account.
 * @param referralCode The referral code entered by the user.
 */
export const linkReferralCodeToUser = async (userId: string, referralCode: string) => {
  try {
    const referralDoc = doc(db, 'users', userId);
    const userSnap = await getDoc(referralDoc);

    if (userSnap.exists()) {
      await setDoc(referralDoc, { referralCode }, { merge: true });
    } else {
      console.error('User not found');
    }
  } catch (error) {
    console.error('Error linking referral code to user:', error);
  }
};