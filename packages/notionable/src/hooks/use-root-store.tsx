import { useContext } from 'react';
import { RootStoreContext, RootStoreType } from '../stores/root-store';

export const useRootStore = (): RootStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.portfolioStore) {
    throw new Error('portfolioStore must be used within a RootStoreContext');
  }

  return rootContext;
};
