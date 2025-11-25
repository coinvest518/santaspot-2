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
  total_points: number;
  social_shares: number;
  offer_clicks: number;
  withdrawal_eligible: boolean;
  login_streak: number;
  last_login_date: string;
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

export interface WithdrawalRequest {
  id: string;
  user_uuid: string;
  amount: number;
  payment_method: string;
  payment_details: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: Timestamp;
  processed_at?: Timestamp;
  admin_notes?: string;
}

export interface DailyLogin {
  id: string;
  user_uuid: string;
  login_date: string; // YYYY-MM-DD format
  created_at: Timestamp;
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
      earnings: 200, // Signup bonus
      total_clicks: 0,
      total_referrals: 0,
      completed_offers: 0,
      total_donated: 0,
      influence_score: 0,
      total_points: 0,
      social_shares: 0,
      offer_clicks: 0,
      withdrawal_eligible: false,
      login_streak: 0,
      last_login_date: '',
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
        earnings: 200,
        total_clicks: 0,
        total_referrals: 0,
        completed_offers: 0,
        total_donated: 0,
        influence_score: 0,
        total_points: 0,
        social_shares: 0,
        offer_clicks: 0,
        withdrawal_eligible: false,
        login_streak: 0,
        last_login_date: '',
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
    
    // Update user's total clicks, earnings, points and influence score
    const userDoc = await getDocs(query(collection(db, 'users'), where('uuid', '==', userUUID)));
    if (!userDoc.empty) {
      const uid = userDoc.docs[0].id;
      const profile = userDoc.docs[0].data() as UserProfile;
      const newTotalClicks = (profile.total_clicks || 0) + 1;
      const newEarnings = (profile.earnings || 0) + 2; // +$2 for click
      const newPoints = (profile.total_points || 0) + 1;
      const newInfluenceScore = calculateInfluenceScore(
        profile.total_donated || 0,
        profile.total_referrals || 0,
        newTotalClicks
      );
      await updateUserProfile(uid, {
        total_clicks: newTotalClicks,
        earnings: newEarnings,
        total_points: newPoints,
        influence_score: newInfluenceScore,
      });
      
      await checkWithdrawalEligibility(uid);
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
    
    // Update referrer's total referrals, earnings, points and influence score
    const referrerDoc = await getDocs(query(collection(db, 'users'), where('uuid', '==', referrerUUID)));
    if (!referrerDoc.empty) {
      const uid = referrerDoc.docs[0].id;
      const profile = referrerDoc.docs[0].data() as UserProfile;
      const newTotalReferrals = (profile.total_referrals || 0) + 1;
      const newEarnings = (profile.earnings || 0) + 50; // $50 referral bonus
      const newPoints = (profile.total_points || 0) + 50; // Biggest point reward
      const newInfluenceScore = calculateInfluenceScore(
        profile.total_donated || 0,
        newTotalReferrals,
        profile.total_clicks || 0
      );
      await updateUserProfile(uid, {
        total_referrals: newTotalReferrals,
        earnings: newEarnings,
        total_points: newPoints,
        influence_score: newInfluenceScore,
      });
      
      await checkWithdrawalEligibility(uid);
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
    
    // Update user's total_donated, points and influence_score
    const userDoc = await getDocs(query(collection(db, 'users'), where('uuid', '==', userUUID)));
    if (!userDoc.empty) {
      const uid = userDoc.docs[0].id;
      const profile = userDoc.docs[0].data() as UserProfile;
      const newTotalDonated = (profile.total_donated || 0) + amount;
      const newPoints = (profile.total_points || 0) + (amount * 10); // 10 points per $1
      const newInfluenceScore = calculateInfluenceScore(
        newTotalDonated,
        profile.total_referrals || 0,
        profile.total_clicks || 0
      );
      await updateUserProfile(uid, {
        total_donated: newTotalDonated,
        total_points: newPoints,
        influence_score: newInfluenceScore,
      });
      
      await checkWithdrawalEligibility(uid);
    }
    
    // Update global pot total
    await updateGlobalPot(amount);
    
    // Add to current prize pool
    const currentPool = await getCurrentPrizePool();
    if (currentPool) {
      await updateDoc(doc(db, 'prize_pools', currentPool.id), {
        total_amount: currentPool.total_amount + amount,
        updated_at: Timestamp.now(),
      });
    }
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

export interface PrizePool {
  id: string;
  name: string;
  total_amount: number;
  draw_date: Timestamp;
  status: 'active' | 'drawing' | 'completed';
  winner_uuid?: string;
  winner_username?: string;
  entries: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PrizeEntry {
  id: string;
  pool_id: string;
  user_uuid: string;
  username: string;
  influence_score: number;
  entries: number;
  created_at: Timestamp;
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
    
    // Update user's earnings, completed_offers, and points
    const userDoc = await getDocs(query(collection(db, 'users'), where('uuid', '==', userUUID)));
    if (!userDoc.empty) {
      const uid = userDoc.docs[0].id;
      const profile = userDoc.docs[0].data() as UserProfile;
      const newEarnings = (profile.earnings || 0) + reward;
      const newCompletedOffers = (profile.completed_offers || 0) + 1;
      const newPoints = (profile.total_points || 0) + 5; // 5 points for completing offer
      
      await updateUserProfile(uid, {
        earnings: newEarnings,
        completed_offers: newCompletedOffers,
        total_points: newPoints,
      });
      
      console.log(`Updated user ${userUUID}: earnings=${newEarnings}, offers=${newCompletedOffers}, points=${newPoints}`);
      
      // Check withdrawal eligibility after offer completion
      await checkWithdrawalEligibility(uid);
    } else {
      console.error('User not found with UUID:', userUUID);
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

// Migrate existing user to have new fields
export const migrateUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const profile = userDoc.data();
      
      // Check if user needs migration (missing new fields)
      const needsMigration = (
        profile.total_points === undefined || 
        profile.social_shares === undefined ||
        profile.offer_clicks === undefined ||
        profile.withdrawal_eligible === undefined
      );
      
      if (needsMigration) {
        const updates = {
          total_points: profile.total_points || 0,
          social_shares: profile.social_shares || 0,
          offer_clicks: profile.offer_clicks || 0,
          withdrawal_eligible: profile.withdrawal_eligible || false,
          login_streak: profile.login_streak || 0,
          last_login_date: profile.last_login_date || '',
        };
        
        await updateUserProfile(uid, updates);
        console.log('User migrated successfully:', uid, updates);
      }
    }
  } catch (error) {
    console.error('Error migrating user:', error);
  }
};

// Daily login tracking
export const trackDailyLogin = async (userUUID: string) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check if user already logged in today
    const loginQuery = query(
      collection(db, 'daily_logins'),
      where('user_uuid', '==', userUUID),
      where('login_date', '==', today)
    );
    const loginSnap = await getDocs(loginQuery);
    
    if (loginSnap.empty) {
      // Record today's login
      const loginData: DailyLogin = {
        id: uuidv4(),
        user_uuid: userUUID,
        login_date: today,
        created_at: Timestamp.now(),
      };
      
      await addDoc(collection(db, 'daily_logins'), loginData);
      
      // Update user's login streak
      const userDoc = await getDocs(query(collection(db, 'users'), where('uuid', '==', userUUID)));
      if (!userDoc.empty) {
        const uid = userDoc.docs[0].id;
        const profile = userDoc.docs[0].data() as UserProfile;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = 1;
        if (profile.last_login_date === yesterdayStr) {
          // Consecutive day
          newStreak = (profile.login_streak || 0) + 1;
        }
        
        const newPoints = (profile.total_points || 0) + 1; // +1 point for daily login
        
        await updateUserProfile(uid, {
          login_streak: newStreak,
          last_login_date: today,
          total_points: newPoints,
        });
        
        console.log(`Daily login tracked: streak=${newStreak}, points=${newPoints}`);
        return newStreak;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error tracking daily login:', error);
    return 0;
  }
};

// Manually sync user stats from all collections
export const syncUserStats = async (userUUID: string) => {
  try {
    console.log('Syncing user stats for:', userUUID);
    
    // Get user document
    const userQuery = query(collection(db, 'users'), where('uuid', '==', userUUID));
    const userSnap = await getDocs(userQuery);
    
    if (userSnap.empty) {
      console.error('User not found:', userUUID);
      return;
    }
    
    const uid = userSnap.docs[0].id;
    const currentProfile = userSnap.docs[0].data() as UserProfile;
    
    // Count clicks
    const clicksQuery = query(collection(db, 'clicks'), where('user_uuid', '==', userUUID));
    const clicksSnap = await getDocs(clicksQuery);
    const totalClicks = clicksSnap.size;
    
    // Count referrals
    const referralsQuery = query(collection(db, 'referrals'), where('referrer_uuid', '==', userUUID));
    const referralsSnap = await getDocs(referralsQuery);
    const totalReferrals = referralsSnap.size;
    
    // Count completed offers and calculate earnings from them
    const offersQuery = query(collection(db, 'offer_completions'), where('user_uuid', '==', userUUID));
    const offersSnap = await getDocs(offersQuery);
    const completedOffers = offersSnap.size;
    const offerEarnings = offersSnap.docs.reduce((sum, doc) => sum + (doc.data().reward || 0), 0);
    
    // Calculate total earnings: signup bonus + referral bonuses + offer earnings + click earnings + social share earnings
    const signupBonus = 200;
    const referralEarnings = totalReferrals * 50; // $50 per referral
    const clickEarnings = totalClicks * 2; // $2 per click
    const socialShareEarnings = (currentProfile.social_shares || 0) * 2; // $2 per share
    const totalEarnings = signupBonus + referralEarnings + offerEarnings + clickEarnings + socialShareEarnings;
    
    // Calculate total points
    const clickPoints = totalClicks * 1;
    const referralPoints = totalReferrals * 50;
    const offerPoints = completedOffers * 5;
    const socialPoints = (currentProfile.social_shares || 0) * 2;
    const donationPoints = (currentProfile.total_donated || 0) * 10;
    const totalPoints = clickPoints + referralPoints + offerPoints + socialPoints + donationPoints;
    
    // Update user profile with synced data
    const updates = {
      total_clicks: totalClicks,
      total_referrals: totalReferrals,
      completed_offers: completedOffers,
      earnings: totalEarnings,
      total_points: totalPoints,
      influence_score: calculateInfluenceScore(
        currentProfile.total_donated || 0,
        totalReferrals,
        totalClicks
      ),
    };
    
    await updateUserProfile(uid, updates);
    
    console.log('User stats synced:', {
      userUUID,
      totalClicks,
      totalReferrals,
      completedOffers,
      totalEarnings,
      totalPoints,
      breakdown: {
        signupBonus,
        referralEarnings,
        offerEarnings,
        clickEarnings,
        socialShareEarnings
      }
    });
    
    // Check withdrawal eligibility after sync
    await checkWithdrawalEligibility(uid);
    
    return updates;
  } catch (error) {
    console.error('Error syncing user stats:', error);
    throw error;
  }
};

// Withdrawal functions
export const createWithdrawalRequest = async (userUUID: string, amount: number, paymentMethod: string, paymentDetails: string) => {
  try {
    const withdrawalData: WithdrawalRequest = {
      id: uuidv4(),
      user_uuid: userUUID,
      amount,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
      status: 'pending',
      created_at: Timestamp.now(),
    };
    
    await addDoc(collection(db, 'withdrawal_requests'), withdrawalData);
    return withdrawalData;
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    throw error;
  }
};

export const getUserWithdrawals = async (userUUID: string): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(collection(db, 'withdrawal_requests'), where('user_uuid', '==', userUUID));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as WithdrawalRequest);
  } catch (error) {
    console.error('Error getting withdrawals:', error);
    return [];
  }
};

export const getPendingWithdrawals = async (userUUID: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'withdrawal_requests'), 
      where('user_uuid', '==', userUUID),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.reduce((total, doc) => total + doc.data().amount, 0);
  } catch (error) {
    console.error('Error getting pending withdrawals:', error);
    return 0;
  }
};

export const subscribeToWithdrawals = (userUUID: string, callback: (withdrawals: WithdrawalRequest[]) => void) => {
  const q = query(collection(db, 'withdrawal_requests'), where('user_uuid', '==', userUUID));
  return onSnapshot(q, (snapshot) => {
    const withdrawals = snapshot.docs.map(doc => doc.data() as WithdrawalRequest);
    callback(withdrawals);
  });
};

// Social share tracking - using Firebase Auth UID directly
export const trackSocialShare = async (uid: string, platform: string) => {
  try {
    console.log('trackSocialShare called:', { uid, platform });
    const userDoc = await getDoc(doc(db, 'users', uid));
    console.log('User doc found:', userDoc.exists());
    
    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile;
      const newShares = (profile.social_shares || 0) + 1;
      const newEarnings = (profile.earnings || 0) + 2; // +$2 for social share
      const newPoints = (profile.total_points || 0) + 2;
      
      console.log('Updating social shares:', { oldShares: profile.social_shares, newShares, newEarnings, newPoints });
      
      await updateUserProfile(uid, {
        social_shares: newShares,
        earnings: newEarnings,
        total_points: newPoints,
      });
      
      console.log('Social share tracked successfully');
      await checkWithdrawalEligibility(uid);
    } else {
      console.error('User not found with UID:', uid);
    }
  } catch (error) {
    console.error('Error tracking social share:', error);
    throw error;
  }
};

// Offer click tracking
export const trackOfferClick = async (userUUID: string, offerId: string) => {
  try {
    const userDoc = await getDocs(query(collection(db, 'users'), where('uuid', '==', userUUID)));
    if (!userDoc.empty) {
      const uid = userDoc.docs[0].id;
      const profile = userDoc.docs[0].data() as UserProfile;
      const newOfferClicks = (profile.offer_clicks || 0) + 1;
      const newPoints = (profile.total_points || 0) + 1;
      
      await updateUserProfile(uid, {
        offer_clicks: newOfferClicks,
        total_points: newPoints,
      });
      
      await checkWithdrawalEligibility(uid);
    }
  } catch (error) {
    console.error('Error tracking offer click:', error);
  }
};

// Check withdrawal eligibility - using Firebase Auth UID directly
export const checkWithdrawalEligibility = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile;
      
      const requirements = {
        hasDonation: (profile.total_donated || 0) >= 1,
        hasReferrals: (profile.total_referrals || 0) >= 3,
        hasClicks: (profile.total_clicks || 0) >= 50,
        hasOffers: (profile.completed_offers || 0) >= 5,
        hasShares: (profile.social_shares || 0) >= 10,
        hasPoints: (profile.total_points || 0) >= 100,
        accountAge: (Date.now() - profile.created_at.toMillis()) >= (7 * 24 * 60 * 60 * 1000) // 7 days
      };
      
      const isEligible = Object.values(requirements).every(req => req);
      
      if (isEligible !== profile.withdrawal_eligible) {
        await updateUserProfile(uid, {
          withdrawal_eligible: isEligible,
        });
      }
    }
  } catch (error) {
    console.error('Error checking withdrawal eligibility:', error);
  }
};

// Get withdrawal requirements progress
export const getWithdrawalProgress = (profile: UserProfile) => {
  const accountAgeMs = Date.now() - profile.created_at.toMillis();
  const accountAgeDays = accountAgeMs / (24 * 60 * 60 * 1000);
  
  return {
    donation: {
      current: profile.total_donated || 0,
      required: 1,
      completed: (profile.total_donated || 0) >= 1,
      label: 'Crypto Donation ($1+)'
    },
    referrals: {
      current: profile.total_referrals || 0,
      required: 3,
      completed: (profile.total_referrals || 0) >= 3,
      label: 'Successful Referrals'
    },
    clicks: {
      current: profile.total_clicks || 0,
      required: 50,
      completed: (profile.total_clicks || 0) >= 50,
      label: 'Referral Link Clicks'
    },
    offers: {
      current: profile.completed_offers || 0,
      required: 5,
      completed: (profile.completed_offers || 0) >= 5,
      label: 'Completed Offers'
    },
    shares: {
      current: profile.social_shares || 0,
      required: 10,
      completed: (profile.social_shares || 0) >= 10,
      label: 'Social Media Shares'
    },
    points: {
      current: profile.total_points || 0,
      required: 100,
      completed: (profile.total_points || 0) >= 100,
      label: 'Total Activity Points'
    },
    accountAge: {
      current: Math.floor(accountAgeDays),
      required: 7,
      completed: accountAgeDays >= 7,
      label: 'Account Age (Days)'
    }
  };
};

// Prize Pool Functions
export const createPrizePool = async (name: string, drawDate: Date, initialAmount: number = 100) => {
  try {
    const poolData: PrizePool = {
      id: uuidv4(),
      name,
      total_amount: initialAmount,
      draw_date: Timestamp.fromDate(drawDate),
      status: 'active',
      entries: 0,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };
    
    await setDoc(doc(db, 'prize_pools', poolData.id), poolData);
    return poolData;
  } catch (error) {
    console.error('Error creating prize pool:', error);
    throw error;
  }
};

export const getCurrentPrizePool = async (): Promise<PrizePool | null> => {
  try {
    const q = query(
      collection(db, 'prize_pools'),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as PrizePool;
    }
    
    // Create initial Thanksgiving pool if none exists (2 days away!)
    const thanksgiving = new Date('2025-11-27T18:00:00Z'); // Thanksgiving 6 PM UTC
    return await createPrizePool('Thanksgiving Draw', thanksgiving, 100);
  } catch (error) {
    console.error('Error getting current prize pool:', error);
    return null;
  }
};

export const subscribeToCurrentPrizePool = (callback: (pool: PrizePool | null) => void) => {
  const q = query(
    collection(db, 'prize_pools'),
    where('status', '==', 'active')
  );
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      callback(snapshot.docs[0].data() as PrizePool);
    } else {
      callback(null);
    }
  });
};

export const enterPrizePool = async (userUUID: string, username: string, influenceScore: number) => {
  try {
    const currentPool = await getCurrentPrizePool();
    if (!currentPool) {
      throw new Error('No active prize pool');
    }
    
    // Check if user already entered
    const existingEntry = await getDocs(query(
      collection(db, 'prize_entries'),
      where('pool_id', '==', currentPool.id),
      where('user_uuid', '==', userUUID)
    ));
    
    if (!existingEntry.empty) {
      // Update existing entry
      const entryDoc = existingEntry.docs[0];
      await updateDoc(entryDoc.ref, {
        influence_score: influenceScore,
        entries: Math.max(1, Math.floor(influenceScore / 10)),
      });
    } else {
      // Create new entry
      const entryData: PrizeEntry = {
        id: uuidv4(),
        pool_id: currentPool.id,
        user_uuid: userUUID,
        username,
        influence_score: influenceScore,
        entries: Math.max(1, Math.floor(influenceScore / 10)),
        created_at: Timestamp.now(),
      };
      
      await addDoc(collection(db, 'prize_entries'), entryData);
      
      // Update pool entry count
      await updateDoc(doc(db, 'prize_pools', currentPool.id), {
        entries: currentPool.entries + 1,
        updated_at: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error entering prize pool:', error);
    throw error;
  }
};

export const getUserPrizeEntry = async (userUUID: string): Promise<PrizeEntry | null> => {
  try {
    const currentPool = await getCurrentPrizePool();
    if (!currentPool) return null;
    
    const q = query(
      collection(db, 'prize_entries'),
      where('pool_id', '==', currentPool.id),
      where('user_uuid', '==', userUUID)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.empty ? null : snapshot.docs[0].data() as PrizeEntry;
  } catch (error) {
    console.error('Error getting user prize entry:', error);
    return null;
  }
};

export const initializePrizePools = async () => {
  try {
    // Check if we have active pools
    const activePool = await getCurrentPrizePool();
    if (activePool) return;
    
    // Create Thanksgiving pool (first draw - 2 days away!)
    const thanksgiving = new Date('2025-11-27T18:00:00Z');
    await createPrizePool('Thanksgiving Draw', thanksgiving, 100);
    
    console.log('Prize pools initialized');
  } catch (error) {
    console.error('Error initializing prize pools:', error);
  }
};

export const createNextPrizePool = async () => {
  try {
    // Create Christmas pool after Thanksgiving
    const christmas = new Date('2025-12-25T18:00:00Z');
    await createPrizePool('Christmas Draw', christmas, 200);
    
    console.log('Next prize pool created for Christmas');
  } catch (error) {
    console.error('Error creating next prize pool:', error);
  }
};
