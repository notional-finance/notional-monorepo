import { useContext } from 'react';
import {
  RootStoreContext,
  RootStoreType,
  NetworkClientModelType,
} from '../stores/root-store';
import { Network } from '@notional-finance/util';
import { useParams } from 'react-router-dom';

export const useRootStore = (): RootStoreType => {
  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.portfolioStore) {
    throw new Error('portfolioStore must be used within a RootStoreContext');
  }

  return rootContext;
};

export const useCurrentNetworkStore = (): NetworkClientModelType => {
  const { selectedNetwork } = useParams<{ selectedNetwork: Network }>();
  const network = selectedNetwork || Network.mainnet;

  const rootContext = useContext(RootStoreContext);
  if (!rootContext || !rootContext.portfolioStore) {
    throw new Error('portfolioStore must be used within a RootStoreContext');
  }

  return rootContext.getNetworkClient(network);
};
