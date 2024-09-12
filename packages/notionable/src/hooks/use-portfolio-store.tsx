import { useContext } from 'react';
import { PortfolioStoreType } from '../stores/portfolio-store';
import { RootStoreContext } from '../stores/root-store';

export const usePortfolioStore = (): PortfolioStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.portfolioStore) {
    throw new Error('portfolioStore must be used within a RootStoreContext');
  }

  return rootContext.portfolioStore;
};
