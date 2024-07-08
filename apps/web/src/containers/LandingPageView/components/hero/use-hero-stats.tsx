import { useState, useEffect } from 'react';

export const useHeroStats = () => {
  const [heroStats, setHeroStats] = useState<any>(null);

  useEffect(() => {
    const fetchHeroStats = async () => {
      try {
        const response = await fetch('https://data-dev.notional.finance/kpi');
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
