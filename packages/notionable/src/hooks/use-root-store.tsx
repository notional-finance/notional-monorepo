import { useContext, useMemo } from 'react';
import {
  RootStoreContext,
  RootStoreType,
  NetworkClientModelType,
} from '../stores/root-store';
import { Network } from '@notional-finance/util';
import { useParams } from 'react-router-dom';
import { AppStoreType } from '../stores/app-store';
import { PortfolioStoreType } from '../stores/portfolio-store';

export const useRootStore = (): RootStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.portfolioStore) {
    throw new Error('rootStore must be used within a RootStoreContext');
  }

  return rootContext;
};

export const useCurrentNetworkStore = (): NetworkClientModelType => {
  const { selectedNetwork } = useParams<{ selectedNetwork: Network }>();
  const network = selectedNetwork || Network.mainnet;

  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.portfolioStore) {
    throw new Error('rootStore must be used within a RootStoreContext');
  }

  const networkClient = useMemo(() => {
    return rootContext.getNetworkClient(network);
  }, [network, rootContext]);

  return networkClient;
};

export const useAppStore = (): AppStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.appStore) {
    throw new Error('rootStore must be used within a RootStoreContext');
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
