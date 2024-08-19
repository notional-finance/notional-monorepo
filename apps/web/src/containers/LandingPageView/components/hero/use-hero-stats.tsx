import { useState, useEffect } from 'react';

export const useHeroStats = () => {
  const [heroStats, setHeroStats] = useState<any>(null);

  useEffect(() => {
    const fetchHeroStats = async () => {
      try {
        // NOTE: this is still connected to the old data service and should be updated to the new registry service
        const response = await fetch(
          'https://registry.notional.finance/all/kpi'
        );
        const data = await response.json();
        setHeroStats(data);
      } catch (error) {
        console.error('Error fetching hero stats:', error);
      }
    };

    fetchHeroStats();
  }, []);

  return heroStats;
};
