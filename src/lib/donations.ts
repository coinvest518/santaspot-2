import { recordDonation as firebaseRecordDonation } from './firebase';

export const recordDonation = async (userId: string, amount: number, currency: string, network: string) => {
  try {
    await firebaseRecordDonation(userId, amount, currency, network);
  } catch (error) {
    console.error('Error recording donation:', error);
    throw error;
  }
};
