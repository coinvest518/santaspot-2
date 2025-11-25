import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { app } from '../lib/firebase';

export const createShortUrl = async (referralCode: string) => {
  const shortCode = nanoid(6);
  const longUrl = `${import.meta.env.VITE_APP_URL}/signup?referral=${referralCode}`;

  try {
    await addDoc(collection(db, 'short_urls'), {
      shortCode,
      longUrl,
      referralCode,
      createdAt: serverTimestamp()
    });

    return {
      shortUrl: `${import.meta.env.VITE_APP_URL}/r/${shortCode}`,
      originalUrl: longUrl
    };
  } catch (error) {
    console.error('Error creating short URL:', error);
    return null;
  }
};

/**
 * Generates a referral link using the real domain santaspot.xyz.
 * @param referralCode The referral code to include in the link.
 * @returns A referral link URL.
 */
export const generateReferralLink = (referralCode: string): string => {
  return `https://santaspot.xyz/r/${referralCode}`;
};
