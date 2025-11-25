import { db } from './firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

export interface LiveStats {
  total_users: number;
  total_earnings: number;
  total_clicks: number;
}

export const fetchLiveStats = async (): Promise<LiveStats> => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const clicksSnap = await getDocs(collection(db, 'clicks'));
    
    let totalEarnings = 0;
    usersSnap.forEach(doc => {
      totalEarnings += doc.data().earnings || 0;
    });

    return {
      total_users: usersSnap.size,
      total_earnings: totalEarnings,
      total_clicks: clicksSnap.size,
    };
  } catch (error) {
    console.error('Error fetching live stats:', error);
    throw error;
  }
};

export const subscribeLiveStats = (callback: (stats: LiveStats) => void) => {
  const unsubscribe = onSnapshot(collection(db, 'users'), async () => {
    const stats = await fetchLiveStats();
    callback(stats);
  });

  return unsubscribe;
};
