import { AppStoreType } from '@notional-finance/notionable';
import { useContext, createContext } from 'react';

export const AppContext = createContext<AppStoreType | null>(null);

export const useAppStore = (): AppStoreType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('App Store must be used within a AppContext');
  }
  return context;
};