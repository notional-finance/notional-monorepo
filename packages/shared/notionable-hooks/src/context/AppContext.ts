import { AppStoreType, RootStoreContext } from '@notional-finance/notionable';
import { useContext, createContext } from 'react';

export const AppContext = createContext<AppStoreType | null>(null);

export const useAppStore = (): AppStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.appStore) {
    throw new Error('RootStoreContext must be used within a RootStoreContext');
  }
  return rootContext.appStore;
};