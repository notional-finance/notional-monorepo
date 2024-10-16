import { createContext, useContext } from 'react';
import { pointsStore, PointsStoreType } from '@notional-finance/notionable';
import PointsDashboard from './points-dashboard';

const PointsDashboardContext = createContext<PointsStoreType | null>(null);

export const usePointsDashboardStore = (): PointsStoreType => {
  const context = useContext(PointsDashboardContext);
  if (!context) {
    throw new Error('pointsStore must be used within a PointsDashboardContext');
  }
  return context;
};

export const InitPointsDashboard = () => {
  return (
    <PointsDashboardContext.Provider value={pointsStore}>
      <PointsDashboard />
    </PointsDashboardContext.Provider>
  );
};
