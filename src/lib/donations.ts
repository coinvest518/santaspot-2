import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface Donation {
  id?: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  metadata?: Record<string, any>;
}

export const addDonation = async (donation: Omit<Donation, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'donations'), {
      ...donation,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding donation:', error);
    throw error;
  }
};

export const getUserDonations = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Donation[];
  } catch (error) {
    console.error('Error getting user donations:', error);
    throw error;
  }
};

export const getTotalPotAmount = async () => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('status', '==', 'completed')
    );
    const querySnapshot = await getDocs(q);
    let total = 0;
    querySnapshot.docs.forEach(doc => {
      const donation = doc.data() as Donation;
      total += donation.amount;
    });
    return total;
  } catch (error) {
    console.error('Error getting total pot amount:', error);
    return 0;
  }
};

export const getRecentDonations = async (limitCount: number = 10) => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Donation[];
  } catch (error) {
    console.error('Error getting recent donations:', error);
    return [];
  }
};