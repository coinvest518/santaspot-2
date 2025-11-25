import React, { useState, useEffect } from 'react';
import { auth, db, subscribeToAuthChanges, fetchUserProfile, signUp, signIn, logOut, signInWithGoogle, migrateUserProfile, trackDailyLogin, UserProfile } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { FirebaseUserContext } from './FirebaseUserContext';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export const FirebaseUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          // Migrate user first to ensure all fields exist
          await migrateUserProfile(user.uid);
          const profile = await fetchUserProfile(user.uid);
          setUserProfile(profile);
          
          // Track daily login if profile exists
          if (profile?.uuid) {
            await trackDailyLogin(profile.uuid);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
          setError('Failed to load user profile');
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await logOut();
      setUserProfile(null);
      // Clear localStorage on logout
      localStorage.removeItem('referralCode');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      await signUp(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <FirebaseUserContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        error,
        login,
        logout,
        signup,
        loginWithGoogle,
      }}
    >
      {children}
    </FirebaseUserContext.Provider>
  );
};
