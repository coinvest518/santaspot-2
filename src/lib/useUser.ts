import { useFirebaseUser } from '@/hooks/useFirebaseUser';

export const useUser = () => {
  const { firebaseUser, userProfile, login, logout, signup } = useFirebaseUser();
  
  return {
    user: userProfile ? { id: firebaseUser?.uid, username: userProfile.username } : null,
    firebaseUser,
    userProfile,
    login,
    logout,
    signup,
    loading: !firebaseUser && !userProfile,
  };
};
