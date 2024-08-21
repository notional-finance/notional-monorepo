import { createContext, useContext } from 'react';
import { pointsStore, PointsStoreType } from '@notional-finance/notionable';
import PortfolioFeatureShell from './portfolio-feature-shell';

const PortfolioContext = createContext<PointsStoreType | null>(null);

export const usePortfolioStore = (): PointsStoreType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('portfolioStore must be used within a PortfolioContext');
  }
  return context;
};

export const InitPortfolio = () => {
  return (
    <PortfolioContext.Provider value={pointsStore}>
      <PortfolioFeatureShell />
    </PortfolioContext.Provider>
  );
};
