import { useContext, createContext } from 'react';
import {
  RootStoreType,
  NetworkClientModelType,
  AppStoreType,
  WalletStoreType,
} from '@notional-finance/notionable';
import { useSelectedNetwork } from '../use-network';

export const RootStoreContext = createContext<RootStoreType | null>(null);

export const useRootStore = (): RootStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext) {
    throw new Error('rootStore must be used within a RootStoreContext');
  }

  return rootContext;
};

export const useCurrentNetworkStore = (): NetworkClientModelType => {
  const rootContext = useContext(RootStoreContext);
  const selectedNetwork = useSelectedNetwork();
  if (!rootContext) {
    throw new Error(
      'currentNetworkClient must be used within a RootStoreContext'
    );
  }

  return rootContext.getNetworkClient(selectedNetwork);
};

export const useWalletStore = (): WalletStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext) {
    throw new Error('walletStore must be used within a RootStoreContext');
  }

  return rootContext.walletStore;
};

export const useAppStore = (): AppStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.appStore) {
    throw new Error('appStore must be used within a RootStoreContext');
  }
  return rootContext.appStore;
};
