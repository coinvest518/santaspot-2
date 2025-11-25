import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { fetchUserStats } from '../lib/stats';

const useUserStats = () => {
  const { user } = useContext(UserContext);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (user) {
        try {
          const stats = await fetchUserStats(user.id);
          setUserStats(stats);
        } catch (error) {
          console.error('Error fetching user stats:', error);
        }
      }
    };
    loadStats();
  }, [user]);

  return userStats;
};

export default useUserStats;