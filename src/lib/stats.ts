import { db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface DashboardStats {
  total_earned: number;
  clicks: number;
  referrals: number;
  completed_offers: number;
  current_streak: number;
}

export const fetchUserStats = async (userId: string): Promise<DashboardStats> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    
    const clicksQuery = query(collection(db, 'clicks'), where('user_uuid', '==', userData.uuid));
    const clicksSnap = await getDocs(clicksQuery);
    
    const referralsQuery = query(collection(db, 'referrals'), where('referrer_uuid', '==', userData.uuid));
    const referralsSnap = await getDocs(referralsQuery);

    return {
      total_earned: userData.earnings || 0,
      clicks: clicksSnap.size,
      referrals: referralsSnap.size,
      completed_offers: userData.completed_offers || 0,
      current_streak: 0,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};
