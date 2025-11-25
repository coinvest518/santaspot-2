import { useFirebaseUser } from '@/hooks/useFirebaseUser';

const AuthDebug = () => {
  const { firebaseUser, userProfile, loading, error } = useFirebaseUser();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Firebase User: {firebaseUser ? 'Yes' : 'No'}</div>
      <div>User Profile: {userProfile ? 'Yes' : 'No'}</div>
      <div>Error: {error || 'None'}</div>
      {userProfile && (
        <div className="mt-2">
          <div>Username: {userProfile.username || 'Not set'}</div>
          <div>UUID: {userProfile.uuid?.slice(0, 8)}...</div>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;