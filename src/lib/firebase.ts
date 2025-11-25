import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Type definitions
export interface UserProfile {
  uid: string;
  uuid: string;
  email: string;
  username: string | null;
  referral_code: string;
  earnings: number;
  total_clicks: number;
  total_referrals: number;
  completed_offers: number;
  total_donated: number;
  influence_score: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ClickRecord {
  id: string;
  user_uuid: string;
  referral_code: string;
  timestamp: Timestamp;
  ip_address?: string;
}

export interface ReferralRecord {
  id: string;
  referrer_uuid: string;
  referred_uuid: string;
  referral_code_used: string;
  status: 'pending' | 'completed';
  created_at: Timestamp;
}

export interface DonationRecord {
  id: string;
  user_uuid: string;
  amount: number;
  currency: string;
  network: string;
  transaction_hash?: string;
  created_at: Timestamp;
}

export interface OfferCompletion {
  id: string;
  user_uuid: string;
  offer_id: string;
  reward: number;
  completed_at: Timestamp;
}

// Auth functions
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile with UUID
    const userUUID = uuidv4();
    const referralCode = uuidv4().slice(0, 8).toUpperCase();
    
    const profileData: UserProfile = {
      uid: user.uid,
      uuid: userUUID,
      email: user.email || '',
      username: null,
      referral_code: referralCode,
      earnings: 100, // Signup bonus
      total_clicks: 0,
      total_referrals: 0,
      completed_offers: 0,
      total_donated: 0,
      influence_score: 0,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };
    
    await setDoc(doc(db, 'users', user.uid), profileData);
    
    // Increment global user count
    await incrementGlobalUserCount();

    // Check for and process referral
    const savedReferralCode = localStorage.getItem('referralCode');
    if (savedReferralCode) {
      const referrer = await getUserByReferralCode(savedReferralCode);
      if (referrer) {
        await createReferralRecord(referrer.uuid, userUUID, savedReferralCode);
      }
      localStorage.removeItem('referralCode');
    }
    
    return { user, uuid: userUUID, message: 'Account created successfully' };
  } catch (error: any) {
    throw new Error(`Sign up failed: ${error.message}`);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(`Sign in failed: ${error.message}`);
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const existingProfile = await fetchUserProfile(user.uid);
    
    if (!existingProfile) {
      const userUUID = uuidv4();
      const referralCode = uuidv4().slice(0, 8).toUpperCase();
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        uuid: userUUID,
        email: user.email || '',
        username: user.displayName || null,
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
      
      // Increment global user count
      await incrementGlobalUserCount();

      // Check for and process referral
      const savedReferralCode = localStorage.getItem('referralCode');
      if (savedReferralCode) {
        const referrer = await getUserByReferralCode(savedReferralCode);
        if (referrer) {
          await createReferralRecord(referrer.uuid, userUUID, savedReferralCode);
        }
        localStorage.removeItem('referralCode');
      }
    }
    
    return user;
  } catch (error: any) {
    throw new Error(`Google sign in failed: ${error.message}`);
  }
};

// User profile functions
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getUserByReferralCode = async (referralCode: string): Promise<UserProfile | null> => {
  try {
    const q = query(collection(db, 'users'), where('referral_code', '==', referralCode));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].data() as UserProfile;
  } catch (error) {
    console.error('Error getting user by referral code:', error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updated_at: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const subscribeToUserProfile = (uid: string, callback: (profile: UserProfile | null) => void) => {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (docSnap) => {
    callback(docSnap.exists() ? (docSnap.data() as UserProfile) : null);
  });
};

// Click tracking functions
export const trackReferralClick = async (userUUID: string, referralCode: string) => {
  try {
    const clickData: ClickRecord = {
      id: uuidv4(),
      user_uuid: userUUID,
      referral_code: referralCode,
      timestamp: Timestamp.now(),
    };
    
    await addDoc(collection(db, 'clicks'), clickData);
    
    // Update user's total clicks and influence score
    const userDoc = await getDocs(query(collection(db, 'users'), where('uuid', '==', userUUID)));
    if (!userDoc.empty) {
      const uid = userDoc.docs[0].id;
      const profile = userDoc.docs[0].data() as UserProfile;
      const newTotalClicks = (profile.total_clicks || 0) + 1;
      const newInfluenceScore = calculateInfluenceScore(
        profile.total_donated || 0,
        profile.total_referrals || 0,
        newTotalClicks
      );
      await updateUserProfile(uid, {
        total_clicks: newTotalClicks,
        influence_score: newInfluenceScore,
      });
    }
  } catch (error) {
    console.error('Error tracking click:', error);
  }
};

export const getClickCount = async (userUUID: string): Promise<number> => {
  try {
    const q = query(collection(db, 'clicks'), where('user_uuid', '==', userUUID));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting click count:', error);
    return 0;
  }
};

export const subscribeToClicks = (userUUID: string, callback: (count: number) => void) => {
  const q = query(collection(db, 'clicks'), where('user_uuid', '==', userUUID));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
};

// Referral functions
export const createReferralRecord = async (referrerUUID: string, referredUUID: string, referralCode: string) => {
  try {
    const referralData: ReferralRecord = {
      id: uuidv4(),
      referrer_uuid: referrerUUID,
      referred_uuid: referredUUID,
      referral_code_used: referralCode,
      status: 'completed',
      created_at: Timestamp.now(),
    };
    
    await addDoc(collection(db, 'referrals'), referralData);
    
    // Update referrer's total referrals, earnings, and influence score
    const referrerDoc = await getDocs(query(collection(db, 'users'), where('uuid', '==', referrerUUID)));
    if (!referrerDoc.empty) {
      const uid = referrerDoc.docs[0].id;
      const profile = referrerDoc.docs[0].data() as UserProfile;
      const newTotalReferrals = (profile.total_referrals || 0) + 1;
      const newInfluenceScore = calculateInfluenceScore(
        profile.total_donated || 0,
        newTotalReferrals,
        profile.total_clicks || 0
      );
      await updateUserProfile(uid, {
        total_referrals: newTotalReferrals,
        earnings: (profile.earnings || 0) + 50, // Referral bonus
        influence_score: newInfluenceScore,
      });
    }
  } catch (error) {
    console.error('Error creating referral record:', error);
  }
};

export const getReferrals = async (userUUID: string): Promise<ReferralRecord[]> => {
  try {
    const q = query(collection(db, 'referrals'), where('referrer_uuid', '==', userUUID));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ReferralRecord);
  } catch (error) {
    console.error('Error getting referrals:', error);
    return [];
  }
};

export const subscribeToReferrals = (userUUID: string, callback: (referrals: ReferralRecord[]) => void) => {
  const q = query(collection(db, 'referrals'), where('referrer_uuid', '==', userUUID));
  return onSnapshot(q, (snapshot) => {
    const referrals = snapshot.docs.map(doc => doc.data() as ReferralRecord);
    callback(referrals);
  });
};

// Donation functions
export const recordDonation = async (userUUID: string, amount: number, currency: string, network: string, transactionHash?: string) => {
  try {
    const donationData: DonationRecord = {
      id: uuidv4(),
      user_uuid: userUUID,
      amount,
      currency,
      network,
      transaction_hash: transactionHash,
      created_at: Timestamp.now(),
    };
    
    await addDoc(collection(db, 'donations'), donationData);
    
    // Update user's total_donated and influence_score
    const userDoc = await getDocs(query(collection(db, 'users'), where('uuid', '==', userUUID)));
    if (!userDoc.empty) {
      const uid = userDoc.docs[0].id;
      const profile = userDoc.docs[0].data() as UserProfile;
      const newTotalDonated = (profile.total_donated || 0) + amount;
      const newInfluenceScore = calculateInfluenceScore(
        newTotalDonated,
        profile.total_referrals || 0,
        profile.total_clicks || 0
      );
      await updateUserProfile(uid, {
        total_donated: newTotalDonated,
        influence_score: newInfluenceScore,
      });
    }
    
    // Update global pot total
    await updateGlobalPot(amount);
  } catch (error) {
    console.error('Error recording donation:', error);
    throw error;
  }
};

export const getUserDonations = async (userUUID: string): Promise<DonationRecord[]> => {
  try {
    const q = query(collection(db, 'donations'), where('user_uuid', '==', userUUID));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as DonationRecord);
  } catch (error) {
    console.error('Error getting donations:', error);
    return [];
  }
};

// Auth state observer
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Generate referral link
export const generateReferralLink = (referralCode: string): string => {
  return `${window.location.origin}/r/${referralCode}`;
};

// Influence score calculation
export const calculateInfluenceScore = (totalDonated: number, totalReferrals: number, totalClicks: number): number => {
  return (totalDonated * 10) + (totalReferrals * 5) + (totalClicks * 1);
};

// Update user's influence score
export const updateInfluenceScore = async (uid: string) => {
  try {
    const profile = await fetchUserProfile(uid);
    if (profile) {
      const score = calculateInfluenceScore(
        profile.total_donated || 0,
        profile.total_referrals || 0,
        profile.total_clicks || 0
      );
      await updateUserProfile(uid, { influence_score: score });
    }
  } catch (error) {
    console.error('Error updating influence score:', error);
  }
};

// Global pot management
export interface GlobalPot {
  total_amount: number;
  total_donations: number;
  total_users: number;
  updated_at: Timestamp;
}

export const updateGlobalPot = async (donationAmount: number) => {
  try {
    const potRef = doc(db, 'globals', 'pot');
    const potSnap = await getDoc(potRef);
    
    if (potSnap.exists()) {
      const currentPot = potSnap.data() as GlobalPot;
      await updateDoc(potRef, {
        total_amount: (currentPot.total_amount || 0) + donationAmount,
        total_donations: (currentPot.total_donations || 0) + 1,
        updated_at: Timestamp.now(),
      });
    } else {
      await setDoc(potRef, {
        total_amount: donationAmount,
        total_donations: 1,
        total_users: 0,
        updated_at: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error updating global pot:', error);
  }
};

export const getGlobalPot = async (): Promise<GlobalPot | null> => {
  try {
    const potSnap = await getDoc(doc(db, 'globals', 'pot'));
    return potSnap.exists() ? (potSnap.data() as GlobalPot) : null;
  } catch (error) {
    console.error('Error getting global pot:', error);
    return null;
  }
};

export const subscribeToGlobalPot = (callback: (pot: GlobalPot | null) => void) => {
  const potRef = doc(db, 'globals', 'pot');
  return onSnapshot(potRef, (docSnap) => {
    callback(docSnap.exists() ? (docSnap.data() as GlobalPot) : null);
  });
};

export const incrementGlobalUserCount = async () => {
  try {
    const potRef = doc(db, 'globals', 'pot');
    const potSnap = await getDoc(potRef);
    
    if (potSnap.exists()) {
      const currentPot = potSnap.data() as GlobalPot;
      await updateDoc(potRef, {
        total_users: (currentPot.total_users || 0) + 1,
        updated_at: Timestamp.now(),
      });
    } else {
      await setDoc(potRef, {
        total_amount: 0,
        total_donations: 0,
        total_users: 1,
        updated_at: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error incrementing user count:', error);
  }
};

// Offer completion tracking
export const completeOffer = async (userUUID: string, offerId: string, reward: number) => {
  try {
    const completionData: OfferCompletion = {
      id: uuidv4(),
      user_uuid: userUUID,
      offer_id: offerId,
      reward,
      completed_at: Timestamp.now(),
    };
    
    await addDoc(collection(db, 'offer_completions'), completionData);
    
    // Update user's earnings and completed_offers
    const userDoc = await getDocs(query(collection(db, 'users'), where('uuid', '==', userUUID)));
    if (!userDoc.empty) {
      const uid = userDoc.docs[0].id;
      const profile = userDoc.docs[0].data() as UserProfile;
      await updateUserProfile(uid, {
        earnings: (profile.earnings || 0) + reward,
        completed_offers: (profile.completed_offers || 0) + 1,
      });
    }
  } catch (error) {
    console.error('Error completing offer:', error);
    throw error;
  }
};

export const getUserCompletedOffers = async (userUUID: string): Promise<string[]> => {
  try {
    const q = query(collection(db, 'offer_completions'), where('user_uuid', '==', userUUID));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data().offer_id);
  } catch (error) {
    console.error('Error getting completed offers:', error);
    return [];
  }
};

export const hasCompletedOffer = async (userUUID: string, offerId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'offer_completions'),
      where('user_uuid', '==', userUUID),
      where('offer_id', '==', offerId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking offer completion:', error);
    return false;
  }
};

export const subscribeToOfferCompletions = (userUUID: string, callback: (completedOfferIds: string[]) => void) => {
  const q = query(collection(db, 'offer_completions'), where('user_uuid', '==', userUUID));
  return onSnapshot(q, (snapshot) => {
    const completedIds = snapshot.docs.map(doc => doc.data().offer_id);
    callback(completedIds);
  });
};
