import { createContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '@/lib/firebase';

export interface FirebaseUserContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

export const FirebaseUserContext = createContext<FirebaseUserContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
});
