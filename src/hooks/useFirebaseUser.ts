import { useContext } from 'react';
import { FirebaseUserContext } from '@/context/FirebaseUserContext';

export const useFirebaseUser = () => {
  const context = useContext(FirebaseUserContext);
  
  if (!context) {
    throw new Error('useFirebaseUser must be used within FirebaseUserProvider');
  }
  
  return context;
};
