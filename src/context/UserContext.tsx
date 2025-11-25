import { createContext } from 'react';
import { User } from '../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { auth, db, fetchUserProfile } from '../lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';


interface UserContextType {
  user: User | null;
  session: FirebaseUser | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  login: () => {},
  logout: async () => {},
  loading: true,
});

export const handleEmailConfirmation = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }

  const profile = await fetchUserProfile(user.uid);

  if (!profile) {
    const userUUID = uuidv4();
    const referralCode = uuidv4().slice(0, 8).toUpperCase();
    
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      uuid: userUUID,
      email: user.email || '',
      username: '',
      referral_code: referralCode,
      earnings: 100,
      total_clicks: 0,
      total_referrals: 0,
      completed_offers: 0,
      total_donated: 0,
      influence_score: 0,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
  }

  return user;
};