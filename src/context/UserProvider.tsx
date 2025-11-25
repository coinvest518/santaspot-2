import React, { useState, useEffect } from 'react';
import { User } from '../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { UserContext } from './UserContext';
import { auth, fetchUserProfile, logOut, subscribeToAuthChanges } from '@/lib/firebase';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setSession(firebaseUser);
      
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        if (profile) {
          setUser({
            id: firebaseUser.uid,
            username: profile.username,
          });
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, session, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};