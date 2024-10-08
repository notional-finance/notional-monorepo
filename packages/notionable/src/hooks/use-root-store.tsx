import { useContext } from 'react';
import {
  RootStoreContext,
  RootStoreType,
  NetworkClientModelType,
} from '../stores/root-store';
import { AppStoreType } from '../stores/app-store';
import { PortfolioStoreType } from '../stores/portfolio-store';
import { WalletStoreType } from '../stores/wallet-store';
import { TransactionStoreType } from '../stores/transaction-store';

export const useRootStore = (): RootStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext) {
    throw new Error('rootStore must be used within a RootStoreContext');
  }

  return rootContext;
};

export const useCurrentNetworkStore = (): NetworkClientModelType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext) {
    throw new Error(
      'currentNetworkClient must be used within a RootStoreContext'
    );
  }

  return rootContext.currentNetworkClient;
};

export const useWalletStore = (): WalletStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext) {
    throw new Error('walletStore must be used within a RootStoreContext');
  }

  return rootContext.walletStore;
};

export const useTransactionStore = (): TransactionStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext) {
    throw new Error('walletStore must be used within a RootStoreContext');
  }

  return rootContext.transactionStore;
};

export const useAppStore = (): AppStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.appStore) {
    throw new Error('appStore must be used within a RootStoreContext');
  }
  return rootContext.appStore;
};

export const usePortfolioStore = (): PortfolioStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.portfolioStore) {
    throw new Error('portfolioStore must be used within a RootStoreContext');
  }

  return rootContext.portfolioStore;
};
